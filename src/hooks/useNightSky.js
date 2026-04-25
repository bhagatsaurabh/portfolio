import { SimulatedCosmos } from "@/world/cosmos";
import { useEffect, useRef } from "react";

const useNightSky = (canvasFGEl, canvasBGEl) => {
  const cosmos = useRef(null);

  useEffect(() => {
    if (!canvasFGEl || !canvasBGEl) {
      return;
    }
    if (!cosmos.current) {
      cosmos.current = new SimulatedCosmos(canvasFGEl.current, canvasBGEl.current, () => {});
    }
  }, [canvasBGEl, canvasFGEl]);
  useEffect(
    () => () => {
      cosmos.current?.destroy();
      cosmos.current = null;
    },
    [],
  );

  return { cosmos };
};

export default useNightSky;
