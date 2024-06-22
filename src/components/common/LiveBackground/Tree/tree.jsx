import { createRef, useEffect, useRef } from "react";
import * as Percept from "canvas-percept";
import PropTypes from "prop-types";
import { v4 as uuid } from "uuid";

import classes from "./tree.module.css";
import { Tree as TreeC } from "@/utils/tree";
import usePrevious from "@/hooks/usePrevious";
import me from "@/assets/images/me-under-tree.png";

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
      { x: canvas.current.width * 0.8, y: canvas.current.height },
      {
        color: getComputedStyle(
          document.querySelector("#App")
        ).getPropertyValue("--treeColor"),
      },
      onComplete
    );
    drawing.current.add(tree.current.root);
    const meWidth = 238 * 0.25;
    const meHeight = 141 * 0.25;
    drawing.current.add(
      new Percept.View.Image(
        uuid(),
        new Percept.Vector(
          canvas.current.width * 0.8 + meWidth / 2,
          canvas.current.height - meHeight / 2
        ),
        me,
        meWidth,
        meHeight,
        { filter: "brightness(0.5)" }
      )
    );
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
