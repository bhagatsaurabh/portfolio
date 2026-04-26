import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  DirectionalLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Vector2,
  Vector3,
} from "three";
import { lerp } from "three/src/math/MathUtils";

import { landscapeThemes, themes } from "@/utils/constants";
import { Simulation } from "./simulation";
import { biasRand, cubicBezier, easeInOut, fbm, randInt, randPick, rescale } from "@/world/utils";
import { clamp, denorm, norm, rand } from "@/utils";
import { ColorTween, Tween } from "@/world/utils/tween";
import { IntervalSchedule, TimeoutSchedule } from "@/world/utils/schedule";
import { Tree } from "../props/tree";
import { ReedCluster } from "../props/reed-cluster";
import { MeSprite } from "../sprite/me.sprite";
import { House } from "../props/house";
import { Windmill } from "../props/windmill";
import { Flock } from "../props/flock";
import { SPREAD_VARIETIES } from "../utils/tree-utils";
import { EventBus } from "@/utils/event-bus";

export class Landscape extends Simulation {
  color = "#363537";
  colorTween = null;
  light = 0;
  lightTween = null;
  posTween = new Tween(0, 1, 1.25, cubicBezier(0.33, 0.03, 0.35, 0.97));
  gustTimeout = new TimeoutSchedule(0.75);
  windInterval = new IntervalSchedule(rand(6, 16));
  windTween = new Tween(1, 1, 2, easeInOut);
  props = {
    originTree: null,
    noOfTrees: 20,
    treeInstanceCount: 2,
    trees: [],
    reedClusters: [],
    noOfBirbs: randInt(2, 3),
    flock: null,
    house: null,
    windmill: null,
    meself: null,
  };
  sandbox = {
    widthScale: 1.75,
    bounds: {
      leftNear: null,
      leftFar: null,
      rightNear: null,
      rightFar: null,
      currLeftNear: null,
      currRightNear: null,
      z: [-15, -85],
    },
    nearWidth: 0,
    farWidth: 0,
    orgNearWidth: 0,
    orgFarWidth: 0,
  };
  wind = new Vector2(randPick(-0.75, 0.75), 0);
  gustWindAmp = 2;
  calmWindAmp = 0.2;
  normalWindAmp = 0.75;
  position = new Vector3();
  prevPosition = new Vector3();
  #targetPos = null;
  startPos = new Vector3();
  minPaxFactor = 0.2;
  minDepthScale = 0.2;
  maxWorldX = 0;
  center = new Vector3();
  lights = {
    ambient: null,
    sun: null,
  };
  lightIntensity = {
    ambient: [0.1, 0.5],
    sun: [0.4, 0.85],
  };
  events = new EventBus();

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
    this.light = world.state.theme === themes.LIGHT ? 1 : 0;
    this.setup();

    this.boxLN = new Mesh(
      new BoxGeometry(0.05, 0.05, 0.05),
      new MeshBasicMaterial({ color: 0xff0000 }),
    );
    this.boxRN = new Mesh(
      new BoxGeometry(0.05, 0.05, 0.05),
      new MeshBasicMaterial({ color: 0xff0000 }),
    );
    this.world.scene.add(this.boxLN, this.boxRN);
  }

  setup() {
    this.resetWorldPos(this.position);
    this.calcBounds();

    this.setupGlobalLights();

    this.spawnHeroTree();
    this.spawnFoliage();
    this.spawnMeself();
    this.spawnHouse();
    this.spawnWindmill();
    this.spawnReedClusters();
    this.spawnFlock();

    this.windInterval.start();

    // this.debugGroundTrapezoid();
  }
  resetWorldPos(startPos) {
    this.targetPos = startPos;
    this.position.copy(this.targetPos);
  }
  setupGlobalLights() {
    const minOrMax = this.world.state.theme === themes.DARK ? 0 : 1;
    this.lights.ambient = new AmbientLight(0xffffff, this.lightIntensity.ambient[minOrMax]);
    this.lights.sun = new DirectionalLight(0xffffff, this.lightIntensity.sun[minOrMax]);

    const pos = this.center.clone();
    pos.x -= 30;
    pos.y += 30;
    pos.z = -30;

    this.lights.sun.position.copy(pos);
    this.lights.sun.target.position.copy(this.center);

    this.world.scene.add(this.lights.ambient, this.lights.sun, this.lights.sun.target);
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

    const left = this.sandbox.bounds.leftNear.clone().lerp(this.sandbox.bounds.leftFar, 0.5);
    const right = this.sandbox.bounds.rightNear.clone().lerp(this.sandbox.bounds.rightFar, 0.5);
    this.center = left.lerp(right, 0.5);

    const currLeftNear = new Vector3(-1, -1, 0).unproject(this.world.orthoCam);
    currLeftNear.y = -1;
    currLeftNear.z = this.sandbox.bounds.z[0];
    const currRightNear = new Vector3(1, -1, 0).unproject(this.world.orthoCam);
    currRightNear.y = -1;
    currRightNear.z = this.sandbox.bounds.z[0];

    this.sandbox.bounds.currLeftNear = currLeftNear;
    this.sandbox.bounds.currRightNear = currRightNear;
  }
  spawnReedClusters() {
    const minX = this.sandbox.bounds.leftNear.x;
    const maxX = this.sandbox.bounds.rightNear.x;

    const step = 0.05;
    const denseT = 0.25;

    const seed = rand(0, 100);
    for (let x = minX; x < maxX; x += step) {
      const density = fbm(x + seed);
      if (density > denseT) {
        this.spawnReedCluster(x);
      }
    }
    this.world.metrics.noOfReedClusters = this.props.reedClusters.length;
  }
  spawnReedCluster(x) {
    const pos = new Vector3(x, -1, this.sandbox.bounds.z[0]);
    const cluster = new ReedCluster(this, pos, rand(0.2, 0.25), randInt(15, 35), this.color, {
      clusterSpread: 3,
    });
    cluster.baseX = pos.x;
    this.world.scene.add(cluster.mesh);
    this.props.reedClusters.push(cluster);
  }
  spawnHeroTree() {
    const pos = this.sandbox.bounds.leftNear.clone();
    pos.x = -(0.75 * (this.sandbox.orgNearWidth / 2));
    this.props.originTree = new Tree(this, pos, 0, this.color);
    this.props.originTree.baseX = pos.x;
    this.world.scene.add(this.props.originTree.mesh);
    this.props.trees.push(this.props.originTree);
  }
  spawnFoliage() {
    const [nearZ, farZ] = this.sandbox.bounds.z;
    for (let i = 0; i < this.props.noOfTrees; i += 1) {
      const pos = this.getRandomPoint();
      const tree = new Tree(
        this,
        pos,
        this.props.treeInstanceCount,
        this.color,
        this.randomizeTreeConfig(pos, nearZ, farZ),
      );
      tree.baseX = pos.x;
      this.props.trees.push(tree);
      this.world.scene.add(tree.mesh);
    }
    this.world.metrics.noOfTrees = this.props.trees.length;
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
  spawnMeself() {
    const pos = this.props.originTree.mesh.position.clone();
    this.props.meself = new MeSprite(this.world.texLoader, pos, this.color, (sprite) => {
      this.world.scene.add(sprite);
      this.props.meself.baseX = sprite.position.x;
    });
  }
  spawnHouse() {
    const pos = this.getRandomPoint(0.9, 0.3);
    this.props.house = new House(this, pos, (obj) => this.world.scene.add(obj));
    this.props.house.baseX = pos.x;
  }
  spawnWindmill() {
    const pos = this.getRandomPoint(0.5, 0.5);
    this.props.windmill = new Windmill(this, pos, (obj) => this.world.scene.add(obj));
    this.props.windmill.baseX = pos.x;
  }
  spawnFlock() {
    const flock = new Flock(this, this.props.noOfBirbs, this.props.originTree);
    this.props.flock = flock;
    flock.baseX = flock.target.x;
  }
  getRandomPoint(xNorm, zNorm) {
    const { leftNear, leftFar, rightNear, rightFar } = this.sandbox.bounds;
    const xN = typeof xNorm === "undefined" ? rand(0, 1) : xNorm;
    const zN = typeof zNorm === "undefined" ? rand(0, 1) : zNorm;

    const left = leftNear.clone().lerp(leftFar.clone(), zN);
    const right = rightNear.clone().lerp(rightFar.clone(), zN);

    return left.lerp(right, xN);
  }
  debugGroundTrapezoid() {
    const { leftNear, leftFar, rightNear, rightFar } = this.sandbox.bounds;
    const materialR = new LineBasicMaterial({ color: 0xff0000 });
    const materialB = new LineBasicMaterial({ color: 0x0000ff });
    let lines = new LineSegments(
      new BufferGeometry().setFromPoints([
        leftNear.clone(),
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
        rightFar.clone(),
        leftFar.clone(),
        leftFar.clone(),
        leftNear.clone(),
      ]),
      materialB,
    );
    this.world.scene.add(lines);
    lines.baseX = lines.position.x;
    const boxLF = new Mesh(new BoxGeometry(5, 5, 5), materialB);
    boxLF.position.copy(leftFar);
    const boxLN = new Mesh(new BoxGeometry(0.6, 0.6, 0.6), materialR);
    boxLN.position.copy(leftNear);
    const boxRF = new Mesh(new BoxGeometry(5, 5, 5), materialR);
    boxRF.position.copy(rightFar);
    const boxRN = new Mesh(new BoxGeometry(0.6, 0.6, 0.6), materialB);
    boxRN.position.copy(rightNear);
    // this.world.scene.add(boxLF);
    // this.world.scene.add(boxLN);
    // this.world.scene.add(boxRF);
    // this.world.scene.add(boxRN);
    boxLF.baseX = boxLF.position.x;
    boxLN.baseX = boxLF.position.x;
    boxRF.baseX = boxLF.position.x;
    boxRN.baseX = boxLF.position.x;
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
      this.updateColor();
      if (colorTweenRes.finished) {
        this.colorTween = null;
      }
    }
    if (this.lightTween) {
      const lightTweenRes = this.lightTween.update(dt);
      this.light = lightTweenRes.value;
      this.updateLight();
      if (lightTweenRes.finished) {
        this.lightTween = null;
      }
    }

    for (const tree of this.props.trees) {
      const [pX, pScale] = this.perspectiveXAndScale(tree, tree.mesh.position.z, true);
      tree.mesh.position.x = pX;
      tree.mesh.scale.setScalar(pScale);
      tree.update(dt);
    }

    const house = this.props.house;
    if (house?.mesh) {
      const [pX, pScale] = this.perspectiveXAndScale(house, house.mesh.position.z);
      house.mesh.position.x = pX;
      house.mesh.scale.setScalar(pScale);
      this.props.house?.update(dt);
    }

    const windmill = this.props.windmill;
    if (windmill?.mesh) {
      const [pX, pScale] = this.perspectiveXAndScale(windmill, windmill.mesh.position.z);
      windmill.mesh.position.x = pX;
      windmill.mesh.scale.setScalar(pScale);
      this.props.windmill?.update(dt);
    }

    const meself = this.props.meself;
    if (meself?.sprite) {
      const [pX, _] = this.perspectiveXAndScale(meself, meself.sprite.position.z);
      meself.sprite.position.x = pX;
      this.props.meself?.update(dt);
    }

    for (let i = 0; i < this.props.reedClusters.length; i++) {
      const reedCluster = this.props.reedClusters[i];
      const [pX, pScale] = this.perspectiveXAndScale(reedCluster, reedCluster.mesh.position.z);
      reedCluster.mesh.position.x = pX;
      reedCluster.mesh.scale.setScalar(pScale);
      reedCluster?.update(dt);
    }

    if (this.props.flock) {
      for (const birb of this.props.flock.birbs) {
        if (birb.sprite) {
          const [pX, _] = this.perspectiveXAndScale(birb, birb.sprite.position.z);
          birb.sprite.position.x = pX;
        }
      }
    }

    this.props.flock?.update(dt);
  }
  updateColor() {
    this.props.trees.forEach((tree) => (tree.color = this.color));
    this.props.meself.color = this.color;
    this.props.reedClusters.forEach((cluster) => (cluster.color = this.color));
    this.props.flock?.birbs.forEach((birb) => (birb.color = this.color));
    this.props.windmill.color = this.color;
    this.props.house.color = this.color;
  }
  updateLight() {
    this.lights.ambient.intensity = denorm(this.light, ...this.lightIntensity.ambient);
    this.lights.sun.intensity = denorm(this.light, ...this.lightIntensity.sun);
    if (this.props.windmill?.mesh) {
      this.props.windmill.lights.shadowCast.intensity = denorm(
        this.light,
        ...this.props.windmill.lightIntensity.shadowCast,
      );
      const nIntensity = denorm(1 - this.light, ...this.props.windmill.lightIntensity.night);
      this.props.windmill.lights.night.forEach((nLight) => (nLight.intensity = nIntensity));
    }
    if (this.props.house?.mesh) {
      const nIntensity = denorm(1 - this.light, ...this.props.house.lightIntensity.night);
      this.props.house.lights.night.forEach((nLight) => (nLight.intensity = nIntensity));
    }

    this.props.trees.forEach((tree) => {
      tree.material.opacity = denorm(this.light, tree.opacity.night, tree.opacity.day);
    });
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

    const baseAmp = clamp(Math.abs(direction), 0, 2);
    this.wind = new Vector2(baseAmp * Math.sign(direction) * this.gustWindAmp, 0);
    this.gustTimeout.start();
  }
  onGustTimeout() {
    this.wind.x = Math.sign(this.wind.x) * this.normalWindAmp;
    this.windInterval.start();
  }
  onWindInterval() {
    this.windInterval.stop();

    const calmnessChance = 0.2;
    let newWind;
    if (rand(0, 1) < calmnessChance) {
      newWind = biasRand(
        -this.normalWindAmp,
        this.normalWindAmp,
        1 - norm(this.wind.x, -this.normalWindAmp, this.normalWindAmp),
        "pow",
      );
    } else {
      newWind = rand(-this.calmWindAmp, this.calmWindAmp);
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

    this.lightTween = new Tween(
      this.light,
      this.world.state.theme === themes.LIGHT ? 1 : 0,
      0.75,
      easeInOut,
    );
    this.lightTween.start();
  }
  resize(_width, _height) {
    this.calcBounds();
    /* for (const tree of this.props.trees) {
      tree.resize({ width, height });
    } */
  }
  onWeatherChange(type) {
    if (type === "sun") {
      // TODO: normalize (happy?) birb behaviour, normalize wind
    } else if (type === "snow") {
      // TODO: (tired?) birb behaviour, normalize wind
    } else if (type === "rain") {
      // TODO: (mostly still?) birb behaviour, normalize wind
    } else if (type === "thunderstorm") {
      // TODO: (extra still?) birb behaviour, exaggerate wind
    } else console.warn("Unknown world weather: ", type);
  }
  destroy() {
    this.events.clear();
  }
}
