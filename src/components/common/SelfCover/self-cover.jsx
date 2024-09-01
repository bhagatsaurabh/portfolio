import { createRef, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import * as THREE from "three";
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

    const width = dimensions.current.width;
    const height = dimensions.current.height;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    document.querySelector("#selfcover").appendChild(renderer.domElement);
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.set(0, 200, (height / 3.464) * 3);
    camera.lookAt(0, 0, 0);
    camera.rotateX(0.102);
    const scene = new THREE.Scene();
    const update = (time) => {
      renderer.render(scene, camera);
      tree.current.update(time);
    };
    renderer.setAnimationLoop((time) => update(time));

    tree.current = new TreeWGL(
      scene,
      dimensions.current,
      {
        color: parseInt(
          getComputedStyle(document.querySelector("#App"))
            .getPropertyValue("--treeColor")
            .replace("#", ""),
          16
        ),
        initialLength: 75,
        initialWidth: 3,
        minBranchLengthFactor: 0.66,
        maxBranchLengthFactor: 0.76,
        branchWidthFactor: 0.7,
        minBranchRotation: 5,
        maxBranchRotation: 35,
      },
      (width, height) => ({ x: (width / 2) * 0.45, y: -height / 2, z: 0 })
    );

    if (!container.current.querySelector("#selfcover")) {
      container.current.appendChild(document.querySelector("#selfcover"));
    }

    return () => {
      scene.clear();
      renderer.dispose();
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
