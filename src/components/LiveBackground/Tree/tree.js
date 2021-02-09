import React, { Component } from 'react';
import * as Percept from 'canvas-percept';

import classes from './tree.module.css';
import { denormalize, getGUID, getQuadraticEase, getRandom, normalize } from '../../../utils/graphics';

class Tree extends Component {
  state = {
    width: 0,
    height: 0
  }

  color = '#000';
  minIdleSway = .7;
  maxIdleSway = 2.8;
  minBranchLengthFactor = .75;
  maxBranchLengthFactor = .8;
  branchWidthFactor = .7;
  maxDepth = 0;
  minBranchRotation = 5;
  maxBranchRotation = 35;
  stormDuration = 350;
  currAnimation = 'idle';

  steps = 100;
  currStep = 0;
  stepDelta = 1;
  direction = true;
  flip = true;

  preStormStepDelta = 9;
  stormStepDelta = 40;
  postStormStepDelta = 1;

  setColor(root) {
    if (!root) return;
    root.node.props.color = this.color;
    root.childs.forEach(child => this.setColor(child));
  }
  componentDidMount() {
    this.setState({ width: this.container.clientWidth, height: this.container.clientHeight }, () => {
      this.canvas = new Percept.Canvas(this.canvasEl);
      this.root = new Percept.View.Empty('root', new Percept.Vector2(this.canvas.width * .8, this.canvas.height));
      this.root.length = 0;

      this.generateBranches(75, 5, this.root);
      this.drawing = new Percept.Drawing(this.canvas, this.update);

      this.drawing.add(this.root);
      this.canvas.draw(this.drawing);

      this.branchRotate(this.root.transform.childs[0]);
      this.maxDepth = this.getDepth(this.root.transform.childs[0]);
      this.assignTargetRotations(this.root.transform.childs[0], 1, getRandom(this.minIdleSway, this.maxIdleSway));
      this.color = getComputedStyle(document.getElementById('App')).getPropertyValue('--treeColor');
      this.setColor(this.root.transform.childs[0]);
    });
  }
  componentDidUpdate(prevProps) {
    if (this.props.navigationOccured && prevProps.navigationOccured !== this.props.navigationOccured) {
      this.direction = this.props.navigationOccured.direction < 0;
      this.currStep = 0;
      this.stepDelta = this.preStormStepDelta;
      this.assignTargetRotations(this.root.transform.childs[0], 1, 20);
      this.currAnimation = 'pre-storm';
    }
    if (this.props.theme !== prevProps.theme) {
      this.color = getComputedStyle(document.getElementById('App')).getPropertyValue('--treeColor');
      this.setColor(this.root.transform.childs[0]);
    }
  }
  generateBranches = (length, width, parent) => {
    let branch = new Percept.View.Line(
      getGUID(),
      new Percept.Vector2(0, -parent.length),
      new Percept.Vector2(0, -parent.length - length),
      0,
      { color: this.color, lineWidth: width }
    );
    if (parent) branch.parent = parent;
    branch.length = length;

    if (length < 15) {
      return;
    }

    this.generateBranches(length * getRandom(this.minBranchLengthFactor, this.maxBranchLengthFactor), width * this.branchWidthFactor, branch);
    this.generateBranches(length * getRandom(this.minBranchLengthFactor, this.maxBranchLengthFactor), width * this.branchWidthFactor, branch);
  }
  getDepth = (root) => {
    if (!root.childs || root.childs.length < 2) return 0;
    let lDepth = this.getDepth(root.childs[0]);
    let rDepth = this.getDepth(root.childs[1]);
    if (lDepth > rDepth)
      return (lDepth + 1);
    else
      return (rDepth + 1);
  }
  branchRotate = (root) => {
    if (!root.childs || root.childs.length < 2) return;

    let rotation = -getRandom(this.minBranchRotation, this.maxBranchRotation);
    root.childs[0].node.localRotation = rotation;
    root.childs[0].node.originalRotation = rotation;
    rotation = getRandom(this.minBranchRotation, this.maxBranchRotation);
    root.childs[1].node.localRotation = rotation;
    root.childs[1].node.originalRotation = rotation;

    this.branchRotate(root.childs[0]);
    this.branchRotate(root.childs[1]);
  }
  assignTargetRotations = (root, depth, value) => {
    if (!root.childs || root.childs.length < 2) return;

    root.childs[0].node.initialRotation = root.childs[0].node.localRotation;
    root.childs[1].node.initialRotation = root.childs[1].node.localRotation;
    let targetRotation = (denormalize(normalize(depth, 0, this.maxDepth), 0, value));
    if (this.direction) {
      root.childs[0].node.targetRotation = root.childs[0].node.originalRotation + targetRotation;
      root.childs[1].node.targetRotation = root.childs[1].node.originalRotation + targetRotation;
    } else {
      root.childs[0].node.targetRotation = root.childs[0].node.originalRotation - targetRotation;
      root.childs[1].node.targetRotation = root.childs[1].node.originalRotation - targetRotation;
    }
    this.assignTargetRotations(root.childs[0], depth + 1, value);
    this.assignTargetRotations(root.childs[1], depth + 1, value);
  }
  sway(root) {
    if (!root.childs || root.childs.length < 2) return;

    root.childs[0].node.localRotation = getQuadraticEase(this.currStep, root.childs[0].node.initialRotation, root.childs[0].node.targetRotation - root.childs[0].node.initialRotation, this.steps);
    root.childs[1].node.localRotation = getQuadraticEase(this.currStep, root.childs[1].node.initialRotation, root.childs[1].node.targetRotation - root.childs[1].node.initialRotation, this.steps);

    this.sway(root.childs[0]);
    this.sway(root.childs[1]);
  }
  update = () => {
    switch (this.currAnimation) {
      case 'idle': {
        this.sway(this.root.transform.childs[0]);
        if (this.currStep < this.steps) this.currStep += this.stepDelta;
        else {
          this.direction = !this.direction;
          this.currStep = 0;
          this.assignTargetRotations(this.root.transform.childs[0], 1, getRandom(this.minIdleSway, this.maxIdleSway));
        }
        break;
      }
      case 'pre-storm': {
        if (this.currStep < this.steps) {
          this.sway(this.root.transform.childs[0]);
          this.currStep += this.stepDelta;
        } else {
          this.stepDelta = this.stormStepDelta;
          this.currAnimation = 'storm';
          setTimeout(() => {
            this.currStep = 0;
            this.stepDelta = this.postStormStepDelta;
            this.assignTargetRotations(this.root.transform.childs[0], 1, 0);
            this.currAnimation = 'post-storm';
          }, this.stormDuration);
        }
        break;
      }
      case 'storm': {
        this.sway(this.root.transform.childs[0]);
        if (this.currStep < this.steps) this.currStep += this.stepDelta;
        else {
          this.currStep = 0;
          this.flip = !this.flip;
          this.assignTargetRotations(this.root.transform.childs[0], 1, this.flip ? getRandom(19.5, 20) : getRandom(17.5, 18));
        }
        break;
      }
      case 'post-storm': {
        if (this.currStep < this.steps) {
          this.sway(this.root.transform.childs[0]);
          this.currStep += this.stepDelta;
        } else {
          this.currStep = 0;
          this.stepDelta = 1;
          this.direction = this.props.navigationOccured ? this.props.navigationOccured.direction < 0 : false;
          this.assignTargetRotations(this.root.transform.childs[0], 1, getRandom(this.minIdleSway, this.maxIdleSway));
          this.currAnimation = 'idle';
        }
        break;
      }
      default: return;
    }
  }

  render() {
    return (
      <div style={{ ...this.props.customStyle }} className={classes.Tree} ref={(element => this.container = element)}>
        <canvas width={this.state.width} height={this.state.height} ref={element => element && (this.canvasEl = element)}></canvas>
      </div>
    );
  }
};
export default Tree;