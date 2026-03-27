import {
  BoxGeometry,
  BufferGeometry,
  Fog,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  Vector2,
  Vector3,
} from "three";
import { landscapeThemes } from "./constants";
import {
  biasRand,
  cubicBezier,
  easeInOut,
  normalize,
  rand,
  randInt,
  randPick,
  rescale,
} from "./graphics";
import { ColorTween, IntervalSchedule, Simulation, TimeoutSchedule, Tween } from "./simulation";
import { Tree } from "./tree";
import { Sprite } from "./sprite";
import { SPREAD_VARIETIES } from "./tree-utils";
import { House } from "./house";
import { lerp } from "three/src/math/MathUtils";
import { Windmill } from "./windmill";

export class Landscape extends Simulation {
  color = "#363537";
  colorTween = null;
  posTween = new Tween(0, 1, 1.25, cubicBezier(0.33, 0.03, 0.35, 0.97));
  gustTimeout = new TimeoutSchedule(0.75);
  windInterval = new IntervalSchedule(rand(6, 16));
  windTween = new Tween(1, 1, 2, easeInOut);
  props = {
    originTree: null,
    noOfTrees: 20,
    noOfInstances: 2,
    trees: [],
    house: null,
    windmill: null,
    meself: null,
  };
  sandbox = {
    widthScale: 1.5,
    bounds: {
      leftNear: null,
      leftFar: null,
      rightNear: null,
      rightFar: null,
      z: [-15, -85],
    },
    nearWidth: 0,
    farWidth: 0,
    orgNearWidth: 0,
    orgFarWidth: 0,
  };
  enableFog = true;
  fog = new Fog(0x999999, 10, 100);
  wind = new Vector2(randPick(-0.75, 0.75), 0);
  position = new Vector3();
  #targetPos = null;
  startPos = new Vector3();
  minPaxFactor = 0.2;
  minDepthScale = 0.2;
  maxWorldX = 0;
  dbg = [];

  get targetPos() {
    return this.#targetPos;
  }
  set targetPos(newPos) {
    this.#targetPos = newPos;
    if (this.posTween.running) {
      this.startPos.copy(this.position);
      this.posTween.reset();
    }
  }

  constructor(world) {
    super(world);
    this.color = landscapeThemes[world.state.theme];
    this.setup();
  }

  setup() {
    this.resetWorldPos(this.position);
    this.calcBounds();

    if (this.enableFog) {
      this.fog.near = Math.abs(this.sandbox.bounds.z[0] - 10);
      this.fog.far = Math.abs(this.sandbox.bounds.z[1] + 10);
      this.world.scene.fog = this.fog;
    }

    // this.debugGroundTrapezium(leftNear, leftFar, rightNear, rightFar);

    this.generateHeroTree();
    this.generateFoliage();
    this.generateMeself();
    this.generateHouse();
    this.generateWindmill();

    this.windInterval.start();
  }
  resetWorldPos(startPos) {
    this.targetPos = startPos;
    this.position.copy(this.targetPos);
  }
  calcBounds() {
    const cam = this.world.orthoCam;

    const leftBottom = new Vector3(-1, -1, 0).unproject(cam);
    const rightBottom = new Vector3(1, -1, 0).unproject(cam);

    const nearZ = this.sandbox.bounds.z[0];
    const farZ = this.sandbox.bounds.z[1];

    const width = rightBottom.x - leftBottom.x;
    this.maxWorldX = width * this.sandbox.widthScale;
    const leftX = leftBottom.x;
    const rightNearX = rightBottom.x + this.maxWorldX;
    const rightFarX = rightBottom.x + this.maxWorldX * this.minPaxFactor;

    this.sandbox.bounds.leftNear = new Vector3(leftX, leftBottom.y, nearZ);
    this.sandbox.bounds.leftFar = new Vector3(leftX, leftBottom.y, farZ);
    this.sandbox.bounds.rightNear = new Vector3(rightNearX, leftBottom.y, nearZ);
    this.sandbox.bounds.rightFar = new Vector3(rightFarX, leftBottom.y, farZ);

    const orgWidth = rightBottom.x - leftBottom.x;
    const nearWidth = rightNearX - leftX;
    const farWidth = rightFarX - leftX;

    this.sandbox.orgNearWidth = orgWidth;
    this.sandbox.orgFarWidth = orgWidth;
    this.sandbox.nearWidth = nearWidth;
    this.sandbox.farWidth = farWidth;
  }
  generateHeroTree() {
    const pos = this.sandbox.bounds.leftNear.clone();
    pos.x = -(0.8 * (this.sandbox.orgNearWidth / 2));
    this.props.originTree = new Tree(this, pos, 0, this.color);
    this.props.originTree.baseX = pos.x;
    this.world.scene.add(this.props.originTree.mesh);
    this.props.trees.push(this.props.originTree);
  }
  generateFoliage() {
    const [nearZ, farZ] = this.sandbox.bounds.z;
    for (let i = 0; i < this.props.noOfTrees; i += 1) {
      const pos = this.getRandomPoint();
      const tree = new Tree(
        this,
        pos,
        this.props.noOfInstances,
        this.color,
        this.randomizeTreeConfig(pos, nearZ, farZ),
      );
      tree.baseX = pos.x;
      this.props.trees.push(tree);
      this.world.scene.add(tree.mesh);
    }
  }
  randomizeTreeConfig(pos, nearZ, farZ) {
    const lod = rescale(pos.z, farZ, nearZ, 0.1, 1);

    return {
      wind: { sensitivity: rand(0.85, 1.3) },
      visual: { swayScale: rand(0.15, 0.25) },
      generation: {
        initialLength: rand(0.4, 1),
        initialWidth: rand(1.2, 1.7),
        branchLengthThreshold: rand(0.25, 0.35),
        branchLengthFactor: [0.75, 0.85],
        branchWidthFactor: 0.8,
        lod,
      },
      spread: this.selectTreeVariety(),
    };
  }
  selectTreeVariety() {
    const spreadVariety = SPREAD_VARIETIES[randInt(0, 3)];
    if (typeof spreadVariety === "function") {
      return spreadVariety();
    }
    return structuredClone(spreadVariety);
  }
  generateMeself() {
    const pos = this.props.originTree.mesh.position.clone();
    this.props.meself = new Sprite(
      this.world.texLoader,
      `${import.meta.env.VITE_SB_CDN_URL}/images/me-under-tree-inv.webp`,
      pos,
      (sprite) => {
        this.world.scene.add(sprite);
        this.props.meself.baseX = sprite.position.x;
      },
    );
  }
  generateHouse() {
    const pos = this.getRandomPoint(0.5, 0.3);
    this.props.house = new House(this, pos, (obj) => this.world.scene.add(obj));
    this.props.house.baseX = pos.x;
  }
  generateWindmill() {
    const pos = this.getRandomPoint(0.9, 0.5);
    this.props.windmill = new Windmill(this, pos, (obj) => this.world.scene.add(obj));
    this.props.windmill.baseX = pos.x;
  }
  getRandomPoint(xNorm, zNorm) {
    const { leftNear, leftFar, rightNear, rightFar } = this.sandbox.bounds;
    const xN = typeof xNorm === "undefined" ? rand(0, 1) : xNorm;
    const zN = typeof zNorm === "undefined" ? rand(0, 1) : zNorm;

    const left = leftNear.clone().lerp(leftFar.clone(), zN);
    const right = rightNear.clone().lerp(rightFar.clone(), zN);

    return left.lerp(right, xN);
  }
  debugGroundTrapezium(leftNear, leftFar, rightNear, rightFar) {
    const materialR = new LineBasicMaterial({ color: 0xff0000 });
    const materialB = new LineBasicMaterial({ color: 0x0000ff });
    let lines = new LineSegments(
      new BufferGeometry().setFromPoints([
        leftNear.clone().setX(leftNear.x + (rightNear.x - leftNear.x) / 2),
        rightNear.clone(),
        rightNear.clone(),
        rightFar.clone(),
      ]),
      materialR,
    );
    this.world.scene.add(lines);
    lines.baseX = lines.position.x;
    lines = new LineSegments(
      new BufferGeometry().setFromPoints([
        rightFar.clone().setX(rightFar.x - (rightFar.x - leftFar.x) / 2),
        leftFar.clone(),
        leftFar.clone(),
        leftNear.clone(),
      ]),
      materialB,
    );
    this.world.scene.add(lines);
    lines.baseX = lines.position.x;
    const boxNF = new Mesh(new BoxGeometry(5, 5, 5), materialB);
    boxNF.position.copy(leftFar);
    const boxNL = new Mesh(new BoxGeometry(0.6, 0.6, 0.6), materialR);
    boxNL.position.copy(leftNear);
    const boxRF = new Mesh(new BoxGeometry(5, 5, 5), materialR);
    boxRF.position.copy(rightFar);
    const boxRN = new Mesh(new BoxGeometry(0.6, 0.6, 0.6), materialB);
    boxRN.position.copy(rightNear);
    this.world.scene.add(boxNF);
    this.world.scene.add(boxNL);
    this.world.scene.add(boxRF);
    this.world.scene.add(boxRN);
    boxNF.baseX = boxNF.position.x;
    boxNL.baseX = boxNF.position.x;
    boxRF.baseX = boxNF.position.x;
    boxRN.baseX = boxNF.position.x;
  }
  update(dt) {
    this.updateWorldPosition(dt);

    if (this.windTween.running) {
      const tweenRes = this.windTween.update(dt);
      this.wind.x = tweenRes.value;
      if (tweenRes.finished) {
        this.windInterval = new IntervalSchedule(rand(3, 10));
        this.windInterval.start();
      }
    }
    if (this.gustTimeout.update(dt)) {
      this.onGustTimeout();
    }
    if (this.windInterval.update(dt)) {
      this.onWindInterval();
    }

    if (this.colorTween && this.props.meself) {
      const colorTweenRes = this.colorTween.update(dt);
      this.color = colorTweenRes.value;
      this.props.trees.forEach((tree) => (tree.color = this.color));
      this.props.meself.color = this.color;
      if (colorTweenRes.finished) {
        this.colorTween = null;
      }
    }

    for (const tree of this.props.trees) {
      const [pX, pScale] = this.perspectiveXAndScale(tree, tree.mesh.position.z, true);
      tree.mesh.position.x = pX;
      tree.mesh.scale.setScalar(pScale);
      tree.update(dt);
    }

    const house = this.props.house;
    if (house.mesh) {
      const [pX, pScale] = this.perspectiveXAndScale(house, house.mesh.position.z);
      house.mesh.position.x = pX;
      house.mesh.scale.setScalar(pScale);
      this.props.house?.update(dt);
    }

    const windmill = this.props.windmill;
    if (windmill.mesh) {
      const [pX, pScale] = this.perspectiveXAndScale(windmill, windmill.mesh.position.z);
      windmill.mesh.position.x = pX;
      windmill.mesh.scale.setScalar(pScale);
      this.props.windmill?.update(dt);
    }

    const meself = this.props.meself;
    if (meself.sprite) {
      const [pX, _] = this.perspectiveXAndScale(meself, meself.sprite.position.z);
      meself.sprite.position.x = pX;
      this.props.meself?.update(dt);
    }
  }
  perspectiveXAndScale(prop, z, scaleEased = false) {
    const [nearZ, farZ] = this.sandbox.bounds.z;
    let t = (z - nearZ) / (farZ - nearZ);

    const factor = lerp(1.0, this.minPaxFactor, t);
    const pX = prop.baseX + -this.position.x * factor;

    if (scaleEased) {
      t = Math.pow(t, 1 / 2);
    }
    const scale = lerp(1.0, this.minDepthScale, t);
    const pScale = prop.baseScale * scale;
    return [pX, pScale];
  }
  updateWorldPosition(dt) {
    const distance = this.position.distanceTo(this.targetPos);
    if (!this.posTween.running && Math.abs(distance) > 0.001) {
      this.posTween.start();
      this.startPos.copy(this.position);
    }
    if (this.posTween.running) {
      const tweenRes = this.posTween.update(dt);
      const alpha = tweenRes.value;
      this.position.lerpVectors(this.startPos, this.targetPos, alpha);
    }
  }
  gust(direction) {
    this.gustTimeout.stop();
    this.windInterval.stop();
    this.windTween.stop();

    this.wind = new Vector2(direction * 2, 0);
    this.gustTimeout.start();
  }
  onGustTimeout() {
    this.wind.x = Math.sign(this.wind.x) * 1;
    this.windInterval.start();
  }
  onWindInterval() {
    this.windInterval.stop();

    const calmnessChance = 0.25;
    let newWind;
    if (rand(0, 1) < calmnessChance) {
      newWind = biasRand(-0.75, 0.75, 1 - normalize(this.wind.x, -0.75, 0.75), "pow");
    } else {
      newWind = rand(-0.2, 0.2);
    }
    this.windTween = new Tween(this.wind.x, newWind, 5, easeInOut);
    this.windTween.start();
  }
  sync() {
    this.colorTween = new ColorTween(
      this.color,
      landscapeThemes[this.world.state.theme],
      0.75,
      easeInOut,
    );
    this.colorTween.start();
  }
  resize(width, height) {
    for (const tree of this.props.trees) {
      tree.resize({ width, height });
    }
  }
  destroy() {}
}
