import { Vector2, Vector3 } from "three";
import { landscapeThemes } from "./constants";
import { easeInOut, rand, rescale } from "./graphics";
import { ColorTween, Simulation } from "./simulation";
import { Tree } from "./tree";
import { Sprite } from "./sprite";

export class Landscape extends Simulation {
  color = "#363537";
  colorTween = null;
  originTree = null;
  meself = null;
  noOfTrees = 20;
  trees = [];
  sandbox = {
    extensionFactor: 1.25,
    bounds: {
      leftNear: null,
      leftFar: null,
      rightNear: null,
      rightFar: null,
      z: [15, 85],
    },
    nearWidth: 0,
    farWidth: 0,
    orgNearWidth: 0,
    orgFarWidth: 0,
    currBound: {
      leftNear: null, // from the camera's current x
      leftFar: null,
      rightNear: null,
      rightFar: null,
    },
  };
  wind = new Vector2(1, 0);

  constructor(world) {
    super(world);
    this.color = landscapeThemes[world.state.theme];
    this.setup();
  }

  setup() {
    this.calcBounds();

    const { leftNear, rightNear, leftFar, rightFar } = this.sandbox.bounds;
    const [nearZ, farZ] = [
      leftNear.clone().lerp(rightNear, 0.5).z,
      leftFar.clone().lerp(rightFar, 0.5).z,
    ];

    const pos = this.sandbox.bounds.leftNear.clone();
    pos.x = -(0.8 * (this.sandbox.orgNearWidth / 2));
    // pos.x = -(0.5 * (this.sandbox.orgNearWidth / 2));
    this.originTree = new Tree(this, pos, this.color);
    this.originTree.opacity = rescale(pos.z, farZ, nearZ, 0.4, 1);
    this.world.scene.add(this.originTree.mesh);
    this.trees.push(this.originTree);

    this.generateFoliage(nearZ, farZ);
    this.generateMeself();
  }
  generateFoliage(nearZ, farZ) {
    for (let i = 0; i < this.noOfTrees; i += 1) {
      const pos = this.getRandomPoint();
      const lod = rescale(pos.z, farZ, nearZ, 0.1, 1);
      const tree = new Tree(this, pos, this.color, {
        initialLength: rand(0.4, 1),
        initialWidth: rand(1.2, 1.7),
        branchLengthThreshold: rand(0.25, 0.35),
        branchLengthFactor: [0.75, 0.85],
        branchWidthFactor: 0.8,
        lod,
      });
      tree.opacity = rescale(pos.z, farZ, nearZ, 0.4, 1);
      this.trees.push(tree);
      this.world.scene.add(tree.mesh);
    }
  }
  generateMeself() {
    this.meself = new Sprite(
      `${import.meta.env.VITE_SB_CDN_URL}/images/me-under-tree-inv.webp`,
      this.originTree.mesh.position.clone(),
    );
    this.world.scene.add(this.meself.sprite);
  }
  calcBounds() {
    // normalized device coords
    const leftNear = new Vector3(-1, -1, 0.5);
    const leftFar = new Vector3(-1, -1, 0.5);
    const rightNear = new Vector3(1, -1, 0.5);
    const rightFar = new Vector3(1, -1, 0.5);

    const cam = this.world.camera;
    const camPos = this.world.camera.position;

    leftNear.unproject(cam);
    let dir = leftNear.sub(camPos).normalize();
    const leftNearPos = camPos.clone().add(dir.multiplyScalar(this.sandbox.bounds.z[0]));
    leftFar.unproject(cam);
    dir = leftFar.sub(camPos).normalize();
    const leftFarPos = camPos.clone().add(dir.multiplyScalar(this.sandbox.bounds.z[1]));
    rightNear.unproject(cam);
    dir = rightNear.sub(camPos).normalize();
    const rightNearPos = camPos.clone().add(dir.multiplyScalar(this.sandbox.bounds.z[0]));
    rightFar.unproject(cam);
    dir = rightFar.sub(camPos).normalize();
    const rightFarPos = camPos.clone().add(dir.multiplyScalar(this.sandbox.bounds.z[1]));

    const orgNearWidth = rightNearPos.x - leftNearPos.x;
    const orgFarWidth = rightFarPos.x - leftFarPos.x;

    const extRightNearPos = rightNearPos.clone();
    extRightNearPos.setX(rightNearPos.x + orgFarWidth * (this.sandbox.extensionFactor - 1));
    const extRightFarPos = rightFarPos.clone();
    extRightFarPos.setX(rightFarPos.x + orgFarWidth * (this.sandbox.extensionFactor - 1));

    const nearWidth = extRightNearPos.x - leftNearPos.x;
    const farWidth = extRightFarPos.x - leftFarPos.x;

    this.sandbox.bounds.leftNear = leftNearPos;
    this.sandbox.bounds.leftFar = leftFarPos;
    this.sandbox.bounds.rightNear = extRightNearPos;
    this.sandbox.bounds.rightFar = extRightFarPos;
    this.sandbox.orgNearWidth = orgNearWidth;
    this.sandbox.orgFarWidth = orgFarWidth;
    this.sandbox.nearWidth = nearWidth;
    this.sandbox.farWidth = farWidth;
  }
  getRandomPoint() {
    const t = rand(0, 1);
    const left = this.sandbox.bounds.leftFar.clone().lerp(this.sandbox.bounds.leftNear, t);
    const right = this.sandbox.bounds.rightFar.clone().lerp(this.sandbox.bounds.rightNear, t);
    return left.lerp(right, rand(0, 1));
  }
  gust(direction) {
    for (const tree of this.trees) {
      tree.gust(direction);
    }
  }
  update(dt) {
    const currCamPosX = this.world.camera.position.x;
    const { leftNear, leftFar } = this.sandbox.bounds;
    this.sandbox.currBound = {
      leftNear: leftNear.clone().setX(leftNear.x + currCamPosX),
      leftFar: leftFar.clone().setX(leftFar.x + currCamPosX),
      rightNear: leftNear.clone().add({ x: currCamPosX + this.sandbox.orgNearWidth, y: 0, z: 0 }),
      rightFar: leftFar.clone().add({ x: currCamPosX + this.sandbox.orgFarWidth, y: 0, z: 0 }),
    };

    if (this.colorTween) {
      const colorTweenRes = this.colorTween.update(dt);
      this.color = colorTweenRes.value;
      this.trees.forEach((tree) => (tree.color = this.color));
      this.meself.color = this.color;
      if (colorTweenRes.finished) {
        this.colorTween = null;
      }
    }

    let noOfTrees = 0;
    for (const tree of this.trees) {
      if (this.isTreeVisible(tree)) {
        noOfTrees += 1;
        tree.update(dt);
      }
    }
    this.world.metrics.noOfTrees = noOfTrees;
  }
  isTreeVisible(tree) {
    const { leftNear, leftFar, rightNear, rightFar } = this.sandbox.currBound;

    const pos = tree.root.position;
    const maxCrownReachHalf = tree.maxCrownReach / 2;

    const z = pos.z;
    const t = (z - leftNear.z) / (leftFar.z - leftNear.z);
    const leftX = leftNear.x + (leftFar.x - leftNear.x) * t;
    const rightX = rightNear.x + (rightFar.x - rightNear.x) * t;
    return pos.x + maxCrownReachHalf >= leftX && pos.x - maxCrownReachHalf <= rightX;
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
    for (const tree of this.trees) {
      tree.resize({ width, height });
    }
  }
  destroy() {}
}
