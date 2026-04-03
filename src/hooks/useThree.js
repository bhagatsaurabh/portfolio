import { useCallback, useEffect, useRef } from "react";
import { Vector3 } from "three";

import { rescale } from "@/world/utils";
import { SimulatedThreeWorld } from "@/world/three-world";
import { Landscape } from "@/world/simulation/landscape";

export const useThree = (containerEl, theme, routeOrder, noOfRoutes, perfEl, weather) => {
  const world = useRef(null);
  const landscape = useRef(null);
  const panDelta = useRef(0);

  const resetPanPosition = useCallback((routeOrder) => {
    landscape.current.resetWorldPos(
      new Vector3(rescale(routeOrder, 0, 4, 0, 4 * panDelta.current), 0, 0),
    );
  }, []);
  const resize = useCallback(
    (width, height) => {
      const wrld = world.current;
      if (!wrld) return;
      wrld.resize(width, height);
      resetPanPosition(routeOrder);
    },
    [resetPanPosition, routeOrder],
  );
  const pan = useCallback(
    (routeDirection) => {
      let currentPos = landscape.current.targetPos.clone();
      currentPos.setX(routeOrder * panDelta.current);
      landscape.current.targetPos = currentPos;

      landscape.current.gust(routeDirection);
    },
    [routeOrder],
  );

  useEffect(() => {
    if (weather) {
      landscape.current?.onWeatherChange(weather);
    }
  }, [weather]);
  useEffect(() => {
    if (!containerEl.current) {
      return;
    }

    if (!world.current) {
      const wrld = new SimulatedThreeWorld(containerEl.current, () => {}, perfEl.current);
      world.current = wrld;

      landscape.current = new Landscape(wrld);
      panDelta.current = landscape.current.maxWorldX / (noOfRoutes - 1);
      resetPanPosition(routeOrder);

      setTimeout(() => {
        // wrld.activeCamera = wrld.debugCam;
        // wrld.debugCam.position.copy(landscape.current.props.windmill.mesh.position);
        // // wrld.debugCam.position.y += 10;
        // // wrld.debugCam.position.x = 0;
        // wrld.debugCam.position.x += 10;
        // wrld.debugCam.quaternion.copy(new Quaternion().setFromEuler(new Euler(0, 90, 0)));
        /* landscape.current.props.trees.forEach((tree) => {
          const rBox = new Mesh(
            new BoxGeometry(1, 1, 1),
            new LineBasicMaterial({ color: 0xff0000 }),
          );
          rBox.position.copy(tree.mesh.position);
          wrld.scene.add(rBox);

          const rBoxDyn = new Mesh(
            new BoxGeometry(5, 5, 5),
            new LineBasicMaterial({ color: 0x0000ff }),
          );
          rBox.position.copy(tree.mesh.position);
          tree.mesh.add(rBoxDyn);
        }); */
      }, 2000);

      wrld.simulations.push(landscape.current);
      wrld.sync();
      wrld.start();
    }

    if (world.current.state.theme !== theme) {
      world.current.state = { ...world.current.state, theme };
    }
  }, [containerEl, noOfRoutes, perfEl, resetPanPosition, routeOrder, theme]);
  useEffect(() => () => world.current?.destroy(), []);

  return { world, resize, pan };
};

export default useThree;
