import { createRef, useEffect, useRef } from "react";
import * as Percept from "canvas-percept";
import PropTypes from "prop-types";

import styles from "./self-cover.module.css";
import { Tree as TreeC } from "@/utils/tree";
import usePrevious from "@/hooks/usePrevious";
import { init } from "@/utils/phaser";

const SelfCover = (props) => {
  const { onComplete, theme, windDirection } = props;
  const dimensions = useRef({ width: 0, height: 0 });
  const tree = useRef(null);
  const prevProps = usePrevious(props);
  const container = createRef();
  const canvas = createRef();
  const drawing = createRef();

  useEffect(() => {
    const game = init();
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
      },
      onComplete
    );
    drawing.current.add(tree.current.root);
    canvas.current.draw(drawing.current);

    return () => {
      canvas.current.dispose();
      game.destroy(true);
    };
  }, []);

  useEffect(() => {
    if (
      typeof windDirection === "boolean" &&
      prevProps &&
      prevProps.windDirection !== windDirection
    ) {
      tree.current.storm(windDirection);
    }
    if (theme !== prevProps?.theme) {
      tree.current.color = getComputedStyle(
        document.querySelector("#App")
      ).getPropertyValue("--treeColor");
    }
  }, [props]);

  return (
    <div
      id="selfcover"
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
