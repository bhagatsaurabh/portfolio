import { SimulatedWorld } from "@/utils/world";
import { useEffect, useRef } from "react";

export const useWorld = (canvasEl, theme) => {
  const world = useRef(null);

  useEffect(() => {
    if (!canvasEl.current) {
      return;
    }
    if (!world.current) {
      world.current = new SimulatedWorld(canvasEl.current, { theme });
    }
    if (world.current.state.theme !== theme) {
      world.current.state = { ...world.current.state, theme };
    }
  }, [canvasEl, theme]);
  useEffect(() => () => world.current?.destroy(), []);

  return { world };
};

export default useWorld;
