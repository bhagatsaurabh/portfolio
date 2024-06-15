import { createRef, useEffect, useState } from "react";
import * as Percept from "canvas-percept";
import { v4 as uuid } from "uuid";
import PropTypes from "prop-types";

import classes from "./tree.module.css";
import { denormalize, quadraticEase, rand, normalize } from "@/utils/graphics";

const Tree = (props) => {
  const [config, setConfig] = useState({
    minIdleSway: 0.7,
    maxIdleSway: 2.8,
    minBranchLengthFactor: 0.75,
    maxBranchLengthFactor: 0.8,
    branchWidthFactor: 0.7,
    maxDepth: 0,
    minBranchRotation: 5,
    maxBranchRotation: 35,
    stormDuration: 350,
    steps: 100,
    preStormStepDelta: 9,
    stormStepDelta: 40,
    postStormStepDelta: 1,
  });
  const container = createRef();
  const canvasEl = createRef();
  const canvas = createRef();
  const rootNode = createRef();
  const drawing = createRef();
  const treeState = createRef();
  const dimensions = createRef();
  dimensions.current = { width: 0, height: 0 };
  treeState.current = {
    animation: "idle",
    stepDelta: 1,
    flip: true,
    direction: true,
    step: 0,
    color: "#000",
  };

  const setColor = (root) => {
    if (!root) return;
    root.node.props.color = treeState.current.color;
    root.childs.forEach((child) => setColor(child));
  };

  useEffect(() => {
    dimensions.current.width = container.current.clientWidth;
    dimensions.current.height = container.current.clientHeight;
    canvasEl.current.width = container.current.clientWidth;
    canvasEl.current.height = container.current.clientHeight;

    canvas.current = new Percept.Canvas(canvasEl.current);
    rootNode.current = new Percept.View.Empty(
      "root",
      new Percept.Vector(canvas.current.width * 0.8, canvas.current.height)
    );
    rootNode.current.length = 0;
    generateBranches(75, 5, rootNode.current);
    drawing.current = new Percept.Drawing(canvas.current, update);
    drawing.current.add(rootNode.current);
    canvas.current.draw(drawing.current);
    branchRotate(rootNode.current.transform.childs[0]);
    setConfig({
      ...config,
      maxDepth: getDepth(rootNode.current.transform.childs[0]),
    });
    assignTargetRotations(
      rootNode.current.transform.childs[0],
      1,
      rand(config.minIdleSway, config.maxIdleSway)
    );
    setConfig({
      ...config,
      color: getComputedStyle(document.getElementById("App")).getPropertyValue(
        "--treeColor"
      ),
    });
    setColor(rootNode.current.transform.childs[0]);

    return () => {};
  }, []);

  /* if (
    this.props.navigationOccured &&
    prevProps.navigationOccured !== this.props.navigationOccured
  ) {
    this.direction = this.props.navigationOccured.direction < 0;
    this.step = 0;
    this.stepDelta = this.preStormStepDelta;
    this.assignTargetRotations(this.root.transform.childs[0], 1, 20);
    this.animation = "pre-storm";
  }
  if (this.props.theme !== prevProps.theme) {
    this.color = getComputedStyle(
      document.getElementById("App")
    ).getPropertyValue("--treeColor");
    this.setColor(this.root.transform.childs[0]);
  } */

  const generateBranches = (length, width, parent) => {
    let branch = new Percept.View.Line(
      uuid(),
      new Percept.Vector(0, -parent.length),
      new Percept.Vector(0, -parent.length - length),
      0,
      { color: treeState.current.color, lineWidth: width }
    );
    if (parent) branch.parent = parent;
    branch.length = length;

    if (length < 15) {
      return;
    }

    generateBranches(
      length * rand(config.minBranchLengthFactor, config.maxBranchLengthFactor),
      width * config.branchWidthFactor,
      branch
    );
    generateBranches(
      length * rand(config.minBranchLengthFactor, config.maxBranchLengthFactor),
      width * config.branchWidthFactor,
      branch
    );
  };
  const getDepth = (root) => {
    if (!root.childs || root.childs.length < 2) return 0;
    let lDepth = getDepth(root.childs[0]);
    let rDepth = getDepth(root.childs[1]);
    if (lDepth > rDepth) return lDepth + 1;
    else return rDepth + 1;
  };
  const branchRotate = (root) => {
    if (!root.childs || root.childs.length < 2) return;

    let rotation = -rand(config.minBranchRotation, config.maxBranchRotation);
    root.childs[0].node.localRotation = rotation;
    root.childs[0].node.originalRotation = rotation;
    rotation = rand(config.minBranchRotation, config.maxBranchRotation);
    root.childs[1].node.localRotation = rotation;
    root.childs[1].node.originalRotation = rotation;

    branchRotate(root.childs[0]);
    branchRotate(root.childs[1]);
  };
  const assignTargetRotations = (root, depth, value) => {
    if (!root.childs || root.childs.length < 2) return;

    root.childs[0].node.initialRotation = root.childs[0].node.localRotation;
    root.childs[1].node.initialRotation = root.childs[1].node.localRotation;
    let targetRotation = denormalize(
      normalize(depth, 0, config.maxDepth),
      0,
      value
    );
    if (treeState.current.direction) {
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
    assignTargetRotations(root.childs[0], depth + 1, value);
    assignTargetRotations(root.childs[1], depth + 1, value);
  };
  const sway = (root) => {
    if (!root.childs || root.childs.length < 2) return;

    root.childs[0].node.localRotation = quadraticEase(
      treeState.current.step,
      root.childs[0].node.initialRotation,
      root.childs[0].node.targetRotation - root.childs[0].node.initialRotation,
      config.steps
    );
    root.childs[1].node.localRotation = quadraticEase(
      treeState.current.step,
      root.childs[1].node.initialRotation,
      root.childs[1].node.targetRotation - root.childs[1].node.initialRotation,
      config.steps
    );

    sway(root.childs[0]);
    sway(root.childs[1]);
  };
  const update = () => {
    switch (treeState.current.animation) {
      case "idle": {
        sway(rootNode.current.transform.childs[0]);
        if (treeState.current.step < config.steps) {
          treeState.current.step += treeState.current.stepDelta;
        } else {
          treeState.current.direction = !treeState.current.direction;
          treeState.current.step = 0;
          assignTargetRotations(
            rootNode.current.transform.childs[0],
            1,
            rand(config.minIdleSway, config.maxIdleSway)
          );
        }
        break;
      }
      case "pre-storm": {
        if (treeState.current.step < config.steps) {
          sway(rootNode.current.transform.childs[0]);
          treeState.current.step += treeState.current.stepDelta;
        } else {
          treeState.current.stepDelta = config.stormStepDelta;
          treeState.current.animation = "storm";
          setTimeout(() => {
            treeState.current.step = 0;
            treeState.current.stepDelta = config.postStormStepDelta;
            assignTargetRotations(rootNode.current.transform.childs[0], 1, 0);
            treeState.current.animation = "post-storm";
          }, config.stormDuration);
        }
        break;
      }
      case "storm": {
        sway(rootNode.current.transform.childs[0]);
        if (treeState.current.step < config.steps)
          treeState.current.step += treeState.current.stepDelta;
        else {
          treeState.current.step = 0;
          treeState.current.flip = !treeState.current.flip;
          assignTargetRotations(
            rootNode.current.transform.childs[0],
            1,
            treeState.current.flip ? rand(19.5, 20) : rand(17.5, 18)
          );
        }
        break;
      }
      case "post-storm": {
        if (treeState.current.step < config.steps) {
          sway(rootNode.current.transform.childs[0]);
          treeState.current.step += treeState.current.stepDelta;
        } else {
          treeState.current.step = 0;
          treeState.current.stepDelta = 1;
          treeState.current.direction = /* props.navigationOccured
            ? props.navigationOccured.direction < 0
            :  */ false;
          assignTargetRotations(
            rootNode.current.transform.childs[0],
            1,
            rand(config.minIdleSway, config.maxIdleSway)
          );
          treeState.current.animation = "idle";
        }
        break;
      }
      default:
        return;
    }
  };

  return (
    <div
      style={{ ...props.customStyle }}
      className={classes.Tree}
      ref={(element) => (container.current = element)}
    >
      <canvas
        width={dimensions.current.width}
        height={dimensions.current.height}
        ref={(element) => element && (canvasEl.current = element)}
      ></canvas>
    </div>
  );
};

Tree.propTypes = {
  customStyle: PropTypes.any,
};

export default Tree;
