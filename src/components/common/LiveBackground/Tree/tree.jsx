import { createRef, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import classes from "./tree.module.css";
import { TreeWGL } from "@/utils/tree-wgl";
import { throttle } from "@/utils";
import usePrevious from "@/hooks/usePrevious";

const Tree = (props) => {
  const { onComplete } = props;
  const prevProps = usePrevious(props);
  const dimensions = useRef({ width: 0, height: 0 });
  const tree = useRef(null);
  const container = createRef();

  useEffect(() => {
    dimensions.current.width = container.current.clientWidth;
    dimensions.current.height = container.current.clientHeight;

    tree.current = new TreeWGL(
      "#landscape",
      dimensions.current,
      {
        x: (dimensions.current.width / 2) * 0.8,
        y: -dimensions.current.height / 2,
      },
      {
        color: parseInt(
          getComputedStyle(document.querySelector("#App"))
            .getPropertyValue("--treeColor")
            .replace("#", ""),
          16
        ),
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

    const throttledCB = throttle((entries) => {
      if (entries[0]) {
        dimensions.current.width = entries[0].contentRect.width;
        dimensions.current.height = entries[0].contentRect.height;
        tree.current?.resize(dimensions.current);
      }
    }, 150);
    const observer = new ResizeObserver(throttledCB);
    observer.observe(container.current);

    return () => {
      observer.disconnect();
      tree.current.dispose();
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
      tree.current.color = parseInt(
        getComputedStyle(document.querySelector("#App"))
          .getPropertyValue("--treeColor")
          .replace("#", ""),
        16
      );
    }
  }, [props]);

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
