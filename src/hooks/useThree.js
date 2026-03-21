import { useCallback, useEffect, useRef } from "react";
import { Vector3 } from "three";

// import { themes } from "@/utils/constants";
// import { degToRad } from "three/src/math/MathUtils";
import { denormalize, normalize } from "@/utils/graphics";
import { SimulatedThreeWorld } from "@/utils/three-world";
import { SmoothCamera } from "@/utils/smooth-camera";
import { Landscape } from "@/utils/landscape";

export const useThree = (containerEl, theme, routeOrder) => {
  const world = useRef(null);
  const targetPos = useRef(null);
  const targetRot = useRef(null);
  const smoothCamera = useRef(null);
  const landscape = useRef(null);

  const resize = useCallback(
    (width, height) => {
      const wrld = world.current;
      if (!wrld) return;
      wrld.resize(width, height);
      // smoothCamera.current.reset(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
      // trees.current.forEach((tree) => tree.resize({ width, height }));
    },
    [routeOrder],
  );
  const pan = useCallback(() => {
    // trees.current.forEach((tree) => tree.storm(routeDirection));
    targetPos.current.x = denormalize(normalize(routeOrder, 0, 4), 0, 1000);
    // targetRot.current.y = -denormalize(normalize(routeOrder, 0, 4), 0, degToRad(5));
  }, [routeOrder]);
  const render = useCallback(() => {
    // trees.current.forEach((tree) => tree.update(time));
  }, []);

  useEffect(() => {
    if (!containerEl.current) {
      return;
    }

    if (!world.current) {
      const wrld = new SimulatedThreeWorld(containerEl.current, (dt) => {
        smoothCamera.current.update(dt);
        landscape.current.update(dt);
      });
      world.current = wrld;

      // const width = wrld.width;
      // const height = wrld.height;

      targetPos.current = new Vector3(0, 0, 0);
      targetRot.current = new Vector3(0, 0, 0);

      smoothCamera.current = new SmoothCamera(wrld.camera, targetPos.current, targetRot.current);
      landscape.current = new Landscape(world.current);

      // Sync once
      world.current.start();
      // Start

      /* const map = new THREE.TextureLoader().load(
        `${import.meta.env.VITE_SB_CDN_URL}/images/me-under-tree.webp`,
      );
      const mapInv = new THREE.TextureLoader().load(
        `${import.meta.env.VITE_SB_CDN_URL}/images/me-under-tree-inv.webp`,
      );
      tex.current = map;
      texInv.current = mapInv;
      const material = new THREE.SpriteMaterial({ map: theme === themes.LIGHT ? map : mapInv });
      mat.current = material;
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(30 * 1.6879, 30, 1);
      sprite.position.set((width / 2) * 0.8 + 26, -height / 2 + 15, 0);
      scene.current.add(sprite); */

      // const matchMedia = window.matchMedia("(min-width: 768px)");
      // let noOfTrees = 25;
      /* if (matchMedia.matches) {
        noOfTrees = 50;
      } */
      /* for (let i = 0; i < noOfTrees; i += 1) {
        trees.current.push(
          new TreeWGL(
            scene.current,
            { width, height },
            {
              color: parseInt(
                getComputedStyle(document.querySelector("#App"))
                  .getPropertyValue("--treeColor")
                  .replace("#", ""),
                16,
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
            }),
          ),
        );
      } */
    }
    /* const texMap = theme === "Light" ? tex.current : texInv.current;
    if (mat.current.map !== texMap) {
      mat.current.map = texMap;
      trees.current.forEach(
        (tree) =>
          (tree.color = parseInt(
            getComputedStyle(document.querySelector("#App"))
              .getPropertyValue("--treeColor")
              .replace("#", ""),
            16,
          )),
      );
    } */

    return () => {
      world.current?.destroy();
    };
  }, [containerEl, routeOrder, theme]);

  return { world, resize, pan };
};

export default useThree;
