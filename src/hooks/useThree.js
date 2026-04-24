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
    if (!containerEl) {
      return;
    }

    if (!world.current) {
      const wrld = new SimulatedThreeWorld(containerEl.current, theme, () => {}, perfEl.current);
      world.current = wrld;

      landscape.current = new Landscape(wrld);
      panDelta.current = landscape.current.maxWorldX / (noOfRoutes - 1);
      resetPanPosition(routeOrder);

      wrld.simulations.push(landscape.current);
      wrld.sync();
      wrld.start();
    }

    if (world.current.state.theme !== theme) {
      world.current.state = { ...world.current.state, theme };
    }
  }, [containerEl, noOfRoutes, perfEl, resetPanPosition, routeOrder, theme]);
  useEffect(
    () => () => {
      world.current?.destroy();
      const renderer = world.current.renderer;
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      world.current = null;
    },
    [],
  );

  return { world, resize, pan };
};

export default useThree;
