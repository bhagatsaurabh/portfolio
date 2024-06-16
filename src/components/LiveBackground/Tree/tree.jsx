import { createRef, useEffect, useRef } from "react";
import * as Percept from "canvas-percept";
import PropTypes from "prop-types";

import classes from "./tree.module.css";
import { Tree as TreeC } from "@/utils/tree";
import usePrevious from "@/hooks/usePrevious";

const Tree = (props) => {
  const { onComplete } = props;
  const dimensions = useRef({ width: 0, height: 0 });
  const tree = useRef(null);
  const prevProps = usePrevious(props);
  const container = createRef();
  const canvas = createRef();
  const drawing = createRef();

  useEffect(() => {
    dimensions.current.width = container.current.clientWidth;
    dimensions.current.height = container.current.clientHeight;

    canvas.current = new Percept.Canvas(container.current);
    drawing.current = new Percept.Drawing(canvas.current, () =>
      tree.current.update()
    );
    tree.current = new TreeC(
      canvas.current,
      {
        color: getComputedStyle(
          document.querySelector("#App")
        ).getPropertyValue("--treeColor"),
      },
      onComplete
    );
    drawing.current.add(tree.current.root);
    canvas.current.draw(drawing.current);

    return () => {
      canvas.current.dispose();
    };
  }, []);

  useEffect(() => {
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
  }, [props]);

  return (
    <div
      style={{ ...props.customStyle }}
      className={classes.Tree}
      ref={(element) => (container.current = element)}
    ></div>
  );
};

Tree.propTypes = {
  customStyle: PropTypes.any,
  windDirection: PropTypes.bool,
  theme: PropTypes.string,
  onComplete: PropTypes.func,
};

export default Tree;
