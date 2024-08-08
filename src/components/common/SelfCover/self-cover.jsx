import { createRef, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import styles from "./self-cover.module.css";
import { currTheme } from "@/store/reducers/preferences";
import { TreeWGL } from "@/utils/tree-wgl";

const SelfCover = () => {
  const dimensions = useRef({ width: 0, height: 0 });
  const tree = useRef(null);
  const container = createRef();
  const theme = useSelector(currTheme);

  useEffect(() => {
    dimensions.current.width = container.current.clientWidth;
    dimensions.current.height = container.current.clientHeight;

    tree.current = new TreeWGL(
      "#selfcover",
      dimensions.current,
      {
        x: (dimensions.current.width / 2) * 0.45,
        y: -dimensions.current.height / 2,
      },
      {
        color: parseInt(
          getComputedStyle(document.querySelector("#App"))
            .getPropertyValue("--treeColor")
            .replace("#", ""),
          16
        ),
        initialLength: 45,
        initialWidth: 3,
        minBranchLengthFactor: 0.675,
        maxBranchLengthFactor: 0.75,
        branchWidthFactor: 0.7,
        minBranchRotation: 5,
        maxBranchRotation: 35,
      }
    );

    if (!container.current.querySelector("#selfcover")) {
      container.current.appendChild(document.querySelector("#selfcover"));
    }

    return () => {
      tree.current.dispose();
    };
  }, []);

  useEffect(() => {
    tree.current.color = parseInt(
      getComputedStyle(document.querySelector("#App"))
        .getPropertyValue("--treeColorInverse")
        .replace("#", ""),
      16
    );
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
