import { useEffect, useRef } from "react";
import { SimulatedWorld } from "@/world/world";

export const useWorld = (canvasEl, theme) => {
  const world = useRef(null);

  useEffect(() => {
    if (!canvasEl.current) {
      return;
    }
    if (!world.current) {
      world.current = new SimulatedWorld(canvasEl.current, { theme });
      world.current.start();
    }
    if (world.current.state.theme !== theme) {
      world.current.state = { ...world.current.state, theme };
    }
  }, [canvasEl, theme]);
  useEffect(() => () => world.current?.destroy(), []);

  return { world };
};

export default useWorld;
