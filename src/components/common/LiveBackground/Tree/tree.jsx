import { createRef, useEffect, useRef } from "react";
import * as THREE from "three";
import PropTypes from "prop-types";

import classes from "./tree.module.css";
import { TreeWGL } from "@/utils/tree-wgl";
import { throttle } from "@/utils";
import usePrevious from "@/hooks/usePrevious";
import { denormalize, normalize, rand } from "@/utils/graphics";

const Tree = (props) => {
  const { onComplete, routeOrder } = props;
  const prevProps = usePrevious(props);
  const dimensions = useRef({ width: 0, height: 0 });
  const trees = useRef([]);
  const container = createRef();
  const cameraRef = useRef(null);
  const targetX = useRef(0);

  useEffect(() => {
    dimensions.current.width = container.current.clientWidth;
    dimensions.current.height = container.current.clientHeight;
    targetX.current = denormalize(
      1 - normalize(routeOrder, 0, 4),
      0,
      dimensions.current.width * 0.8
    );

    const width = dimensions.current.width;
    const height = dimensions.current.height;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    document.querySelector("#landscape").appendChild(renderer.domElement);
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 2000);
    cameraRef.current = camera;
    camera.position.set(0, 0, (height / 3.464) * 3);
    camera.lookAt(0, 0, 0);
    camera.position.setX(targetX.current);
    // camera.rotateX(-0.102);
    const scene = new THREE.Scene();

    const update = (time) => {
      renderer.render(scene, camera);
      trees.current.forEach((tree) => tree.update(time));

      if (Math.abs(targetX.current - camera.position.x) > 2) {
        camera.position.lerp(
          new THREE.Vector3(
            targetX.current,
            camera.position.y,
            camera.position.z
          ),
          0.025
        );
      }
    };
    renderer.setAnimationLoop((time) => update(time));

    trees.current.push(
      new TreeWGL(
        scene,
        dimensions.current,
        {
          color: parseInt(
            getComputedStyle(document.querySelector("#App"))
              .getPropertyValue("--treeColor")
              .replace("#", ""),
            16
          ),
          initialLength: 70,
          initialWidth: 3,
          minBranchLengthFactor: 0.75,
          maxBranchLengthFactor: 0.85,
          branchWidthFactor: 0.8,
          minBranchRotation: 5,
          maxBranchRotation: 35,
        },
        (width, height) => ({ x: (width / 2) * 0.8, y: -height / 2, z: 0 }),
        onComplete
      )
    );
    for (let i = 0; i < 50; i += 1) {
      trees.current.push(
        new TreeWGL(
          scene,
          dimensions.current,
          {
            color: parseInt(
              getComputedStyle(document.querySelector("#App"))
                .getPropertyValue("--treeColor")
                .replace("#", ""),
              16
            ),
            initialLength: 35,
            initialWidth: 2,
            minBranchLengthFactor: 0.75,
            maxBranchLengthFactor: 0.85,
            branchWidthFactor: 0.8,
            minBranchRotation: 5,
            maxBranchRotation: 35,
            opacityNearBound: 0,
            opacityFarBound: -500,
          },
          (width, height) => ({
            x: (width / 2) * rand(-1, 5),
            y: -height / 2,
            z: rand(0, -500),
          })
        )
      );
    }

    const throttledCB = throttle((entries) => {
      if (entries[0]) {
        dimensions.current.width = entries[0].contentRect.width;
        dimensions.current.height = entries[0].contentRect.height;

        renderer.setSize(width, height);
        camera.position.set(
          denormalize(1 - normalize(routeOrder, 0, 4), 0, width * 0.8),
          0,
          (height / 3.464) * 3
        );
        camera.aspect = width / height;

        trees.current.forEach((tree) => tree.resize(dimensions.current));

        camera.updateProjectionMatrix();
      }
    }, 150);
    const observer = new ResizeObserver(throttledCB);
    observer.observe(container.current);

    return () => {
      observer.disconnect();
      scene.clear();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (
      typeof props.windDirection === "boolean" &&
      prevProps &&
      prevProps.windDirection !== props.windDirection
    ) {
      trees.current.forEach((tree) => tree.storm(props.windDirection));
      targetX.current = denormalize(
        1 - normalize(routeOrder, 0, 4),
        0,
        dimensions.current.width * 0.8
      );
    }
    if (props.theme !== prevProps?.theme) {
      trees.current.forEach(
        (tree) =>
          (tree.color = parseInt(
            getComputedStyle(document.querySelector("#App"))
              .getPropertyValue("--treeColor")
              .replace("#", ""),
            16
          ))
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
  routeOrder: PropTypes.number,
};

export default Tree;
