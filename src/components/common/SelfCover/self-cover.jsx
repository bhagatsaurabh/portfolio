import { createRef, useEffect, useRef } from "react";
import * as Percept from "canvas-percept";
import PropTypes from "prop-types";

import styles from "./self-cover.module.css";
import { Tree as TreeC } from "@/utils/tree";
import { useSelector } from "react-redux";
import { currTheme } from "@/store/reducers/preferences";

const SelfCover = () => {
  const dimensions = useRef({ width: 0, height: 0 });
  const tree = useRef(null);
  const container = createRef();
  const canvas = useRef(null);
  const drawing = createRef();
  const theme = useSelector(currTheme);

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
        initialLength: 60,
        initialWidth: 3,
        minBranchLengthFactor: 0.675,
        maxBranchLengthFactor: 0.75,
        branchWidthFactor: 0.7,
        minBranchRotation: 5,
        maxBranchRotation: 35,
      }
    );
    drawing.current.add(tree.current.root);
    canvas.current.draw(drawing.current);

    if (!container.current.querySelector("#selfcover")) {
      container.current.appendChild(document.querySelector("#selfcover"));
    }

    return () => {
      canvas.current.dispose();
    };
  }, []);

  useEffect(() => {
    tree.current.color = getComputedStyle(
      document.querySelector("#App")
    ).getPropertyValue("--treeColor");
  }, [theme]);

  return (
    <div
      className={styles.SelfCover}
      ref={(element) => (container.current = element)}
    ></div>
  );
};
SelfCover.propTypes = {
  onComplete: PropTypes.func,
  theme: PropTypes.string,
  windDirection: PropTypes.bool,
};

export default SelfCover;
