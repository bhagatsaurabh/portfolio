import { createRef, useEffect, useRef } from "react";
import * as THREE from "three";
import PropTypes from "prop-types";

import classes from "./trees.module.css";
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
  const mat = useRef(null);
  const tex = useRef(null);
  const texInv = useRef(null);

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
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 2500);
    cameraRef.current = camera;
    camera.position.set(0, -height / 2, (height / 3.464) * 3);
    camera.lookAt(0, -height / 2, 0);
    camera.setViewOffset(width, height, 0, -height / 2, width, height);
    camera.position.setX(targetX.current);
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
          0.04
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

    const map = new THREE.TextureLoader().load("./sprites/me-under-tree.png");
    const mapInv = new THREE.TextureLoader().load(
      "./sprites/me-under-tree-inv.png"
    );
    tex.current = map;
    texInv.current = mapInv;
    const material = new THREE.SpriteMaterial({ map });
    mat.current = material;
    material.map = props.theme === "Light" ? map : mapInv;
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(30 * 1.6879, 30, 1);
    sprite.position.set((width / 2) * 0.8 + 26, -height / 2 + 15, 0);
    scene.add(sprite);

    const matchMedia = window.matchMedia("(min-width: 768px)");
    let noOfTrees = 25;
    if (matchMedia.matches) {
      noOfTrees = 50;
    }
    for (let i = 0; i < noOfTrees; i += 1) {
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
            initialLength: rand(25, 40),
            initialWidth: rand(1, 2),
            minBranchLengthFactor: 0.75,
            maxBranchLengthFactor: 0.85,
            branchWidthFactor: 0.8,
            minBranchRotation: 5,
            maxBranchRotation: 35,
            opacityNearBound: 0,
            opacityFarBound: -1000,
          },
          (width, height) => ({
            x: (width / 2) * rand(-3, 3),
            y: -height / 2,
            z: rand(0, -1000),
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
          -height / 2,
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
      mat.current.map = props.theme === "Light" ? tex.current : texInv.current;
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
