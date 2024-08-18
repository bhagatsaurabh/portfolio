import * as THREE from "three";
import { Line2, LineGeometry, LineMaterial } from "three/examples/jsm/Addons";
import { degToRad, radToDeg } from "three/src/math/MathUtils";

import { denormalize, normalize, quadraticEase, rand } from "./graphics";

export class TreeWGL {
  config = {
    minIdleSway: 0.7,
    maxIdleSway: 2.8,
    minBranchLengthFactor: 0.75,
    maxBranchLengthFactor: 0.8,
    branchWidthFactor: 0.7,
    minBranchRotation: 5,
    maxBranchRotation: 35,
    xBranchRotation: 40,
    yBranchRotation: 40,
    stormDuration: 350,
    steps: 100,
    preStormStepDelta: 9,
    stormStepDelta: 40,
    postStormStepDelta: 1,
    initialLength: 75,
    initialWidth: 5,
  };
  state = {
    animation: "idle",
    stepDelta: 1,
    flip: true,
    direction: true,
    step: 0,
    color: "#000",
    maxDepth: 0,
  };
  root = null;

  get color() {
    return this.state.color;
  }
  set color(c) {
    this.state.color = c;
    this.setColor(this.root.children[0]);
  }

  constructor(
    selector,
    { width, height },
    getPos,
    config,
    onComplete = () => {}
  ) {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    document.querySelector(selector).appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    this.camera.position.set(0, 200, (height / 3.464) * 3);
    this.camera.lookAt(0, 0, 0);
    this.camera.rotateX(0.102);

    this.scene = new THREE.Scene();

    this.renderer.setAnimationLoop((time) => this.update(time));

    this.config = { ...this.config, ...config };
    this.onComplete = onComplete;
    this.getPos = getPos;
    this.setup(width, height);
  }

  resize({ width, height }) {
    this.renderer.setSize(width, height);
    this.camera.position.set(0, 200, (height / 3.464) * 3);
    this.camera.aspect = width / height;
    const pos = this.getPos(width, height);
    pos.y -= this.config.initialLength;
    this.root.position.set(pos.x, pos.y);
    this.camera.updateProjectionMatrix();
  }
  dispose() {
    this.scene.clear();
    this.renderer.dispose();
  }
  setup(width, height) {
    this.root = new THREE.Group();
    const pos = this.getPos(width, height);
    this.root.position.set(pos.x, pos.y - this.config.initialLength, 0);
    this.root.length = this.config.initialLength;

    this.generateBranches(this.config.initialWidth, this.root);
    this.state.maxDepth = this.getDepth(this.root.children[0]);
    this.branchRotate(this.root.children[0], this.state.maxDepth);
    this.assignTargetRotations(
      this.root.children[0],
      1,
      rand(this.config.minIdleSway, this.config.maxIdleSway)
    );
    this.setColor(this.root.children[0]);

    this.scene.add(this.root);
  }
  generateBranches(width, parent) {
    // Slightly reduced length from parent
    const branchLength =
      parent.length *
      rand(
        this.config.minBranchLengthFactor,
        this.config.maxBranchLengthFactor
      );

    const geometry = new LineGeometry();
    geometry.setPositions([0, 0, 0, 0, branchLength, 0]);
    const branch = new Line2(
      geometry,
      new LineMaterial({
        color: this.state.color,
        linewidth: width,
      })
    );
    branch.computeLineDistances();
    branch.scale.set(1, 1, 1);

    branch.position.set(0, parent.length, 0);
    branch.length = branchLength;

    if (parent) {
      parent.add(branch);
    }

    if (branchLength < 15) {
      return;
    }

    this.generateBranches(width * this.config.branchWidthFactor, branch);
    this.generateBranches(width * this.config.branchWidthFactor, branch);
  }
  getDepth(root) {
    if (!root.children || root.children.length < 2) return 0;
    let lDepth = this.getDepth(root.children[0]);
    let rDepth = this.getDepth(root.children[1]);
    if (lDepth > rDepth) return lDepth + 1;
    else return rDepth + 1;
  }
  branchRotate(root, depth) {
    if (!root.children || root.children.length < 2) return;

    const xRot = denormalize(
      1 - normalize(depth, 0, this.state.maxDepth),
      0,
      this.config.xBranchRotation
    );
    const yRot = denormalize(
      1 - normalize(depth, 0, this.state.maxDepth),
      0,
      this.config.yBranchRotation
    );
    let zRot = -rand(
      this.config.minBranchRotation,
      this.config.maxBranchRotation
    );
    root.children[0].rotation.set(
      degToRad(rand(-xRot, xRot)),
      degToRad(rand(-yRot, yRot)),
      degToRad(zRot)
    );
    root.children[0].originalRotation = zRot;

    zRot = rand(this.config.minBranchRotation, this.config.maxBranchRotation);
    root.children[1].rotation.set(
      degToRad(rand(-xRot, xRot)),
      degToRad(rand(-yRot, yRot)),
      degToRad(zRot)
    );
    root.children[1].originalRotation = zRot;

    this.branchRotate(root.children[0], depth - 1);
    this.branchRotate(root.children[1], depth - 1);
  }
  assignTargetRotations(root, depth, value) {
    if (!root.children || root.children.length < 2) return;

    root.children[0].initialRotation = radToDeg(root.children[0].rotation.z);
    root.children[1].initialRotation = radToDeg(root.children[1].rotation.z);
    let targetRotation = denormalize(
      normalize(depth, 0, this.state.maxDepth),
      0,
      value
    );

    if (this.state.direction) {
      root.children[0].targetRotation =
        root.children[0].originalRotation + targetRotation;
      root.children[1].targetRotation =
        root.children[1].originalRotation + targetRotation;
    } else {
      root.children[0].targetRotation =
        root.children[0].originalRotation - targetRotation;
      root.children[1].targetRotation =
        root.children[1].originalRotation - targetRotation;
    }

    this.assignTargetRotations(root.children[0], depth + 1, value);
    this.assignTargetRotations(root.children[1], depth + 1, value);
  }
  setColor(root) {
    if (!root) return;
    root.material.color = new THREE.Color(this.state.color);
    root.material.needsUpdate = true;
    root.children.forEach((child) => this.setColor(child));
  }
  sway(root) {
    if (!root.children || root.children.length < 2) return;
    root.children[0].rotation.set(
      root.children[0].rotation.x,
      root.children[0].rotation.y,
      degToRad(
        quadraticEase(
          this.state.step,
          root.children[0].initialRotation,
          root.children[0].targetRotation - root.children[0].initialRotation,
          this.config.steps
        )
      )
    );
    root.children[1].rotation.set(
      root.children[1].rotation.x,
      root.children[1].rotation.y,
      degToRad(
        quadraticEase(
          this.state.step,
          root.children[1].initialRotation,
          root.children[1].targetRotation - root.children[1].initialRotation,
          this.config.steps
        )
      )
    );

    this.sway(root.children[0]);
    this.sway(root.children[1]);
  }
  storm(direction) {
    this.state.direction = !direction;
    this.state.step = 0;
    this.state.stepDelta = this.config.preStormStepDelta;
    this.assignTargetRotations(this.root.children[0], 1, 20);
    this.state.animation = "pre-storm";
    this.onComplete();
  }

  targetX = 800;
  update(_time) {
    this.renderer.render(this.scene, this.camera);
    switch (this.state.animation) {
      case "idle": {
        this.sway(this.root.children[0]);

        if (this.state.step < this.config.steps) {
          this.state.step += this.state.stepDelta;
        } else {
          this.state.direction = !this.state.direction;
          this.state.step = 0;
          this.assignTargetRotations(
            this.root.children[0],
            1,
            rand(this.config.minIdleSway, this.config.maxIdleSway)
          );
        }
        break;
      }
      case "pre-storm": {
        if (this.state.step < this.config.steps) {
          this.sway(this.root.children[0], this.state, this.config);
          this.state.step += this.state.stepDelta;
        } else {
          this.state.stepDelta = this.config.stormStepDelta;
          this.state.animation = "storm";
          setTimeout(() => {
            this.state.step = 0;
            this.state.stepDelta = this.config.postStormStepDelta;
            this.assignTargetRotations(this.root.children[0], 1, 0);
            this.state.animation = "post-storm";
          }, this.config.stormDuration);
        }
        break;
      }
      case "storm": {
        this.sway(this.root.children[0], this.state, this.config);
        if (this.state.step < this.config.steps)
          this.state.step += this.state.stepDelta;
        else {
          this.state.step = 0;
          this.state.flip = !this.state.flip;
          this.assignTargetRotations(
            this.root.children[0],
            1,
            this.state.flip ? rand(19.5, 20) : rand(17.5, 18),
            this.state
          );
        }
        break;
      }
      case "post-storm": {
        if (this.state.step < this.config.steps) {
          this.sway(this.root.children[0], this.state, this.config);
          this.state.step += this.state.stepDelta;
        } else {
          this.state.step = 0;
          this.state.stepDelta = 1;
          this.assignTargetRotations(
            this.root.children[0],
            1,
            rand(this.config.minIdleSway, this.config.maxIdleSway),
            this.state
          );
          this.state.animation = "idle";
        }
        break;
      }
      default:
        return;
    }

    /* if (Math.abs(this.targetX - this.camera.position.x) > 2) {
      this.camera.position.lerp(
        new THREE.Vector3(
          this.targetX,
          this.camera.position.y,
          this.camera.position.z
        ),
        0.01
      );
    } else {
      if (this.targetX > 0) this.targetX = 0;
      else this.targetX = 800;
    } */
  }
}
