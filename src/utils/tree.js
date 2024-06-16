import { View, Vector } from "canvas-percept";
import { v4 as uuid } from "uuid";
import { denormalize, normalize, quadraticEase, rand } from "./graphics";

export class Tree {
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

  constructor(canvas, config, onComplete) {
    this.config = { ...this.config, ...config };
    this.canvas = canvas;
    this.onComplete = onComplete;

    this.setup();
  }

  setup() {
    this.root = new View.Empty(
      "root",
      new Vector(this.canvas.width * 0.8, this.canvas.height)
    );
    this.root.length = 0;
    this.generateBranches(75, 5, this.root);

    this.branchRotate(this.root.transform.childs[0]);
    this.state.maxDepth = this.getDepth(this.root.transform.childs[0]);
    this.assignTargetRotations(
      this.root.transform.childs[0],
      1,
      rand(this.config.minIdleSway, this.config.maxIdleSway)
    );
    this.setColor(this.root.transform.childs[0]);
  }

  generateBranches(length, width, parent) {
    let branch = new View.Line(
      uuid(),
      new Vector(0, -parent.length),
      new Vector(0, -parent.length - length),
      0,
      { color: this.state.color, lineWidth: width }
    );
    if (parent) branch.parent = parent;
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
    if (!root.childs || root.childs.length < 2) return 0;
    let lDepth = this.getDepth(root.childs[0]);
    let rDepth = this.getDepth(root.childs[1]);
    if (lDepth > rDepth) return lDepth + 1;
    else return rDepth + 1;
  }
  branchRotate(root) {
    if (!root.childs || root.childs.length < 2) return;

    let rotation = -rand(
      this.config.minBranchRotation,
      this.config.maxBranchRotation
    );
    root.childs[0].node.localRotation = rotation;
    root.childs[0].node.originalRotation = rotation;
    rotation = rand(
      this.config.minBranchRotation,
      this.config.maxBranchRotation
    );
    root.childs[1].node.localRotation = rotation;
    root.childs[1].node.originalRotation = rotation;

    this.branchRotate(root.childs[0]);
    this.branchRotate(root.childs[1]);
  }
  assignTargetRotations(root, depth, value) {
    if (!root.childs || root.childs.length < 2) return;

    root.childs[0].node.initialRotation = root.childs[0].node.localRotation;
    root.childs[1].node.initialRotation = root.childs[1].node.localRotation;
    let targetRotation = denormalize(
      normalize(depth, 0, this.state.maxDepth),
      0,
      value
    );
    if (this.state.direction) {
      root.childs[0].node.targetRotation =
        root.childs[0].node.originalRotation + targetRotation;
      root.childs[1].node.targetRotation =
        root.childs[1].node.originalRotation + targetRotation;
    } else {
      root.childs[0].node.targetRotation =
        root.childs[0].node.originalRotation - targetRotation;
      root.childs[1].node.targetRotation =
        root.childs[1].node.originalRotation - targetRotation;
    }
    this.assignTargetRotations(root.childs[0], depth + 1, value);
    this.assignTargetRotations(root.childs[1], depth + 1, value);
  }
  setColor(root) {
    if (!root || !root.node) return;
    root.node.props.color = this.state.color;
    root.childs.forEach((child) => this.setColor(child));
  }
  sway(root) {
    if (!root.childs || root.childs.length < 2) return;

    root.childs[0].node.localRotation = quadraticEase(
      this.state.step,
      root.childs[0].node.initialRotation,
      root.childs[0].node.targetRotation - root.childs[0].node.initialRotation,
      this.config.steps
    );
    root.childs[1].node.localRotation = quadraticEase(
      this.state.step,
      root.childs[1].node.initialRotation,
      root.childs[1].node.targetRotation - root.childs[1].node.initialRotation,
      this.config.steps
    );

    this.sway(root.childs[0]);
    this.sway(root.childs[1]);
  }
  storm(direction) {
    this.state.direction = direction;
    this.state.step = 0;
    this.state.stepDelta = this.config.preStormStepDelta;
    this.assignTargetRotations(this.root.transform.childs[0], 1, 20);
    this.state.animation = "pre-storm";
  }

  update() {
    switch (this.state.animation) {
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
    }
  }
}
