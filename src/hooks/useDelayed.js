import { useEffect, useRef } from "react";

export const useDelayed = (callback, delay = 1000, active = false) => {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  useEffect(() => {
    if (!active) return;
    const handle = setTimeout(() => callbackRef.current(), delay);
    return () => clearTimeout(handle);
  }, [active, delay]);
};

export default useDelayed;
