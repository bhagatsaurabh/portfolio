import { createRef, useEffect, useRef } from "react";
import * as Percept from "canvas-percept";
import PropTypes from "prop-types";

import classes from "./tree.module.css";
import { Tree as TreeC } from "@/utils/tree";
import usePrevious from "@/hooks/usePrevious";
import { TreeWGL } from "@/utils/tree-wgl";

const Tree = (props) => {
  const { onComplete } = props;
  const dimensions = useRef({ width: 0, height: 0 });
  const tree = useRef(null);
  const prevProps = usePrevious(props);
  const container = createRef();
  const canvas = createRef();
  const drawing = createRef();

  useEffect(() => {
    /* dimensions.current.width = container.current.clientWidth;
    dimensions.current.height = container.current.clientHeight;

    canvas.current = new Percept.Canvas(container.current);
    drawing.current = new Percept.Drawing(canvas.current, () =>
      tree.current.update()
    ); */
    /* tree.current = new TreeC(
      { x: canvas.current.width * 0.8, y: canvas.current.height },
      {
        color: getComputedStyle(
          document.querySelector("#App")
        ).getPropertyValue("--treeColor"),
        initialLength: 60,
        initialWidth: 3,
        minBranchLengthFactor: 0.675,
        maxBranchLengthFactor: 0.75,
        branchWidthFactor: 0.7,
        minBranchRotation: 5,
        maxBranchRotation: 35,
      },
      onComplete
    ); */
    tree.current = new TreeWGL(
      { x: window.innerWidth * 0.8, y: window.innerHeight },
      {
        color: /* getComputedStyle(
          document.querySelector("#App")
        ).getPropertyValue("--treeColor") */ 0x000000,
        initialLength: 60,
        initialWidth: 3,
        minBranchLengthFactor: 0.675,
        maxBranchLengthFactor: 0.75,
        branchWidthFactor: 0.7,
        minBranchRotation: 5,
        maxBranchRotation: 35,
      },
      onComplete
    );
    /* drawing.current.add(tree.current.root);
    canvas.current.draw(drawing.current);

    return () => {
      canvas.current.dispose();
    }; */
  }, []);

  /* useEffect(() => {
    if (
      typeof props.windDirection === "boolean" &&
      prevProps &&
      prevProps.windDirection !== props.windDirection
    ) {
      tree.current.storm(props.windDirection);
    }
    if (props.theme !== prevProps?.theme) {
      tree.current.color = getComputedStyle(
        document.querySelector("#App")
      ).getPropertyValue("--treeColor");
    }
  }, [props]); */

  return (
    <div
      id="landscape"
      style={{ ...props.customStyle }}
      className={[classes.Tree, props.blur ? classes.blur : ""].join(" ")}
      ref={(element) => (container.current = element)}
    ></div>
  );
};

Tree.propTypes = {
  customStyle: PropTypes.any,
  windDirection: PropTypes.bool,
  theme: PropTypes.string,
  onComplete: PropTypes.func,
  blur: PropTypes.bool,
};

export default Tree;
