import * as THREE from "three";

import { denormalize, normalize, quadraticEase, rand } from "./graphics";
import { degToRad, radToDeg } from "three/src/math/MathUtils";

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
    this.setColor(this.root.transform.childs[0]);
  }

  constructor(pos, config, onComplete = () => {}) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.querySelector("#landscape").appendChild(this.renderer.domElement);

    this.camera.position.z = 5;
    this.renderer.setAnimationLoop(() => this.update());

    this.config = { ...this.config, ...config };
    this.onComplete = onComplete;
    this.setup(pos);
  }

  setup(pos) {
    this.root = new THREE.Group();
    this.root.position.set(new THREE.Vector3(pos.x, pos.y));
    this.root.length = 0;

    this.generateBranches(
      this.config.initialLength,
      this.config.initialWidth,
      this.root
    );

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
  generateBranches(length, width, parent) {
    new THREE.Line();
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -parent.length),
      new THREE.Vector3(0, -parent.length - length),
    ]);
    const branch = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: this.state.color, linewidth: width })
    );

    if (parent) {
      // branch.parent = parent;
      parent.add(branch);
    }
    branch.length = length;

    if (length < 15) {
      return;
    }

    this.generateBranches(
      length *
        rand(
          this.config.minBranchLengthFactor,
          this.config.maxBranchLengthFactor
        ),
      width * this.config.branchWidthFactor,
      branch
    );
    this.generateBranches(
      length *
        rand(
          this.config.minBranchLengthFactor,
          this.config.maxBranchLengthFactor
        ),
      width * this.config.branchWidthFactor,
      branch
    );
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
    root.material.color = this.state.color;
    root.children.forEach((child) => this.setColor(child));
  }
  sway(root) {
    if (!root.children || root.children.length < 2) return;

    root.children[0].rotateZ(
      quadraticEase(
        this.state.step,
        root.children[0].initialRotation,
        root.children[0].targetRotation - root.children[0].initialRotation,
        this.config.steps
      )
    );
    root.children[1].rotateZ(
      quadraticEase(
        this.state.step,
        root.children[1].initialRotation,
        root.children[1].targetRotation - root.children[1].initialRotation,
        this.config.steps
      )
    );

    this.sway(root.children[0]);
    this.sway(root.children[1]);
  }
  storm(direction) {
    this.state.direction = direction;
    this.state.step = 0;
    this.state.stepDelta = this.config.preStormStepDelta;
    this.assignTargetRotations(this.root.transform.childs[0], 1, 20);
    this.state.animation = "pre-storm";
  }

  update() {
    this.renderer.render(this.scene, this.camera);
    /* switch (this.state.animation) {
      case "idle": {
        this.sway(this.root.transform.childs[0]);

        if (this.state.step < this.config.steps) {
          this.state.step += this.state.stepDelta;
        } else {
          this.state.direction = !this.state.direction;
          this.state.step = 0;
          this.assignTargetRotations(
            this.root.transform.childs[0],
            1,
            rand(this.config.minIdleSway, this.config.maxIdleSway)
          );
        }
        break;
      }
      case "pre-storm": {
        if (this.state.step < this.config.steps) {
          this.sway(this.root.transform.childs[0], this.state, this.config);
          this.state.step += this.state.stepDelta;
        } else {
          this.state.stepDelta = this.config.stormStepDelta;
          this.state.animation = "storm";
          setTimeout(() => {
            this.state.step = 0;
            this.state.stepDelta = this.config.postStormStepDelta;
            this.assignTargetRotations(this.root.transform.childs[0], 1, 0);
            this.state.animation = "post-storm";
          }, this.config.stormDuration);
        }
        break;
      }
      case "storm": {
        this.sway(this.root.transform.childs[0], this.state, this.config);
        if (this.state.step < this.config.steps)
          this.state.step += this.state.stepDelta;
        else {
          this.state.step = 0;
          this.state.flip = !this.state.flip;
          this.assignTargetRotations(
            this.root.transform.childs[0],
            1,
            this.state.flip ? rand(19.5, 20) : rand(17.5, 18),
            this.state
          );
        }
        break;
      }
      case "post-storm": {
        if (this.state.step < this.config.steps) {
          this.sway(this.root.transform.childs[0], this.state, this.config);
          this.state.step += this.state.stepDelta;
        } else {
          this.state.step = 0;
          this.state.stepDelta = 1;
          this.assignTargetRotations(
            this.root.transform.childs[0],
            1,
            rand(this.config.minIdleSway, this.config.maxIdleSway),
            this.state
          );
          this.state.animation = "idle";
          this.onComplete();
        }
        break;
      }
      default:
        return;
    } */
  }
}
