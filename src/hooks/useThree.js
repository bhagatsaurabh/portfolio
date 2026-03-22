import { useCallback, useEffect, useRef } from "react";
import { Vector3 } from "three";

import { rescale } from "@/utils/graphics";
import { SimulatedThreeWorld } from "@/utils/three-world";
import { SmoothCamera } from "@/utils/smooth-camera";
import { Landscape } from "@/utils/landscape";

export const useThree = (containerEl, theme, routeOrder, noOfRoutes) => {
  const world = useRef(null);
  const smoothCamera = useRef(null);
  const landscape = useRef(null);
  const cameraDelta = useRef(0);

  const resetSmoothCamera = useCallback((routeOrder) => {
    smoothCamera.current.reset(
      new Vector3(rescale(routeOrder, 0, 4, 0, 1000), 0, 0),
      new Vector3(0, -rescale(routeOrder, 0, 4, 0, /* degToRad(5) */ 0), 0),
    );
  }, []);
  const resize = useCallback(
    (width, height) => {
      const wrld = world.current;
      if (!wrld) return;
      wrld.resize(width, height);
      resetSmoothCamera(routeOrder);
    },
    [resetSmoothCamera, routeOrder],
  );
  const pan = useCallback(
    (routeDirection) => {
      landscape.current.gust(routeDirection);
      smoothCamera.current.targetPos.setX(routeOrder * cameraDelta.current);
      // smoothCamera.current.targetRot.y = -rescale(routeOrder, 0, 4, 0, /* degToRad(5) */ 0.0872665);
    },
    [routeOrder],
  );

  useEffect(() => {
    if (!containerEl.current) {
      return;
    }

    if (!world.current) {
      const wrld = new SimulatedThreeWorld(containerEl.current, (dt) => {
        smoothCamera.current.update(dt);
      });
      world.current = wrld;

      smoothCamera.current = new SmoothCamera(wrld.camera);
      landscape.current = new Landscape(wrld);
      const sandbox = landscape.current.sandbox;
      cameraDelta.current = (sandbox.nearWidth - sandbox.orgNearWidth) / (noOfRoutes - 1);
      resetSmoothCamera(routeOrder);

      wrld.simulations.push(landscape.current);
      wrld.sync();
      wrld.start();
    }

    if (world.current.state.theme !== theme) {
      world.current.state = { ...world.current.state, theme };
    }
  }, [containerEl, noOfRoutes, resetSmoothCamera, routeOrder, theme]);
  useEffect(() => () => world.current?.destroy(), []);

  return { world, resize, pan };
};

export default useThree;
