import * as THREE from "three";
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

  constructor(selector, { width, height }, pos, config, onComplete = () => {}) {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    document.querySelector(selector).appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    this.camera.position.set(0, 0, (width / 3.464) * 2);
    this.camera.lookAt(0, 0, 0);

    this.scene = new THREE.Scene();

    this.renderer.setAnimationLoop(() => this.update());

    this.config = { ...this.config, ...config };
    this.onComplete = onComplete;
    this.setup(pos);
  }

  resize({ width, height }) {
    this.renderer.setSize(width, height);
    this.camera.position.set(0, 0, (width / 3.464) * 2);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
  dispose() {
    this.scene.clear();
    this.renderer.dispose();
  }
  setup(pos) {
    this.root = new THREE.Group();
    this.root.position.set(pos.x, pos.y - this.config.initialLength, 0);
    this.root.length = this.config.initialLength;

    this.generateBranches(this.config.initialWidth, this.root);

    this.branchRotate(this.root.children[0]);
    this.state.maxDepth = this.getDepth(this.root.children[0]);
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

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, branchLength, 0),
    ]);
    const branch = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: this.state.color, linewidth: width })
    );
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
  branchRotate(root) {
    if (!root.children || root.children.length < 2) return;

    let rotation = -rand(
      this.config.minBranchRotation,
      this.config.maxBranchRotation
    );
    root.children[0].rotateZ(degToRad(rotation));
    root.children[0].originalRotation = rotation;

    rotation = rand(
      this.config.minBranchRotation,
      this.config.maxBranchRotation
    );
    root.children[1].rotateZ(degToRad(rotation));
    root.children[1].originalRotation = rotation;

    this.branchRotate(root.children[0]);
    this.branchRotate(root.children[1]);
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
      0,
      0,
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
      0,
      0,
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

  update() {
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
  }
}
