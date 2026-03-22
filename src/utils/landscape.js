import { BoxGeometry, Mesh, MeshBasicMaterial, TextureLoader, Vector3 } from "three";
import { landscapeThemes } from "./constants";
import { easeInOut, rand } from "./graphics";
import { ColorTween, Simulation } from "./simulation";
import { TreeNew as Tree } from "./tree-new";
import { Sprite } from "./sprite";

export class Landscape extends Simulation {
  color = "#363537";
  colorTween = null;
  originTree = null;
  meself = null;
  noOfTrees = 20;
  trees = [];
  sandbox = {
    extensionFactor: 2,
    bounds: {
      leftNear: null,
      leftFar: null,
      rightNear: null,
      rightFar: null,
      z: [15, 135],
    },
    nearWidth: 0,
    farWidth: 0,
    orgNearWidth: 0,
    orgFarWidth: 0,
  };

  constructor(world) {
    super(world);
    this.color = landscapeThemes[world.state.theme];
    this.setup();
  }

  setup() {
    this.calcBounds();

    const pos = this.sandbox.bounds.leftNear.clone();
    pos.x = -(0.8 * (this.sandbox.orgNearWidth / 2));
    this.originTree = new Tree(pos, {
      color: parseInt(
        getComputedStyle(document.querySelector("#App"))
          .getPropertyValue("--treeColor")
          .replace("#", ""),
        16,
      ),
    });
    this.world.scene.add(this.originTree.root);
    this.trees.push(this.originTree);
    this.generateFoilage();
    this.generateMeself();

    this.debug(false);
  }
  generateFoilage() {
    // perf tweaking needed
    for (let i = 0; i < this.noOfTrees; i += 1) {
      const tree = new Tree(this.sampleSandboxBounds(), {
        color: parseInt(
          getComputedStyle(document.querySelector("#App"))
            .getPropertyValue("--treeColor")
            .replace("#", ""),
          16,
        ),
        initialLength: rand(0.4, 1),
        initialWidth: rand(1.2, 1.7),
        branchLengthThreshold: rand(0.25, 0.35),
        branchLengthFactor: [0.75, 0.85],
        branchWidthFactor: 0.8,
      });
      this.world.scene.add(tree.root);
      this.trees.push(tree);
    }
  }
  generateMeself() {
    this.meself = new Sprite(
      `${import.meta.env.VITE_SB_CDN_URL}/images/me-under-tree-inv.webp`,
      this.originTree.root.position.clone(),
    );
    this.world.scene.add(this.meself.sprite);
  }
  calcBounds() {
    // ndc: normalized device coords
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
  sampleSandboxBounds() {
    const t = rand(0, 1);
    const left = this.sandbox.bounds.leftFar.clone().lerp(this.sandbox.bounds.leftNear, t);
    const right = this.sandbox.bounds.rightFar.clone().lerp(this.sandbox.bounds.rightNear, t);
    return left.lerp(right, rand(0, 1));
  }
  debug(sample) {
    let minX = Infinity,
      minZ = Infinity,
      maxX = -Infinity,
      maxZ = -Infinity;
    for (const tree of this.trees) {
      if (tree.root.position.x < minX) minX = tree.root.position.x;
      if (tree.root.position.z < minZ) minZ = tree.root.position.z;
      if (tree.root.position.x > maxX) maxX = tree.root.position.x;
      if (tree.root.position.z > maxZ) maxZ = tree.root.position.z;
    }

    let edge;
    edge = new Mesh(new BoxGeometry(0.75, 0.75, 0.75), new MeshBasicMaterial({ color: 0xff0000 }));
    edge.position.copy(this.sandbox.bounds.leftNear);
    this.world.scene.add(edge);
    edge = new Mesh(new BoxGeometry(0.75, 0.75, 0.75), new MeshBasicMaterial({ color: 0xff0000 }));
    edge.position.copy(this.sandbox.bounds.leftFar);
    this.world.scene.add(edge);
    edge = new Mesh(new BoxGeometry(0.75, 0.75, 0.75), new MeshBasicMaterial({ color: 0xff0000 }));
    edge.position.copy(this.sandbox.bounds.rightNear);
    this.world.scene.add(edge);
    edge = new Mesh(new BoxGeometry(0.75, 0.75, 0.75), new MeshBasicMaterial({ color: 0xff0000 }));
    edge.position.copy(this.sandbox.bounds.rightFar);
    this.world.scene.add(edge);

    if (sample) {
      for (let i = 0; i < 300; i += 1) {
        const cube = new Mesh(
          new BoxGeometry(0.75, 0.75, 0.75),
          new MeshBasicMaterial({ color: 0x000000 }),
        );
        cube.position.copy(this.sampleSandboxBounds());
        this.world.scene.add(cube);
      }
    }

    console.log(this.sandbox);
  }
  gust(direction) {
    for (const tree of this.trees) {
      tree.gust(direction);
    }
  }
  update(dt) {
    if (this.colorTween) {
      const colorTweenRes = this.colorTween.update(dt);
      this.color = colorTweenRes.value;
      this.trees.forEach((tree) => (tree.color = this.color));
      this.meself.color = this.color;
      if (colorTweenRes.finished) {
        this.colorTween = null;
      }
    }

    for (const tree of this.trees) {
      tree.update(dt);
    }
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
