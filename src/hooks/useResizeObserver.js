import { throttle } from "@/utils";
import { useEffect, useRef } from "react";

const subscribers = new Set();
const observer = new ResizeObserver((entries) => {
  if (!entries[0]) return;
  const { width, height } = entries[0].contentRect;
  subscribers.forEach((cb) => cb(width, height));
});
const subscribe = (el, cb, throttleMs) => {
  if (subscribers.size === 0) {
    observer.observe(el);
  }
  const throttled = throttle(cb, throttleMs);
  subscribers.add(throttled);
  const unsubscribe = () => {
    subscribers.delete(throttled);
    if (subscribers.size === 0) {
      observer.disconnect();
    }
  };
  return unsubscribe;
};

export const useResizeObserver = (el, callback, throttleMs = 150) => {
  const callbackRef = useRef(callback);
  // eslint-disable-next-line react-hooks/refs
  callbackRef.current = callback;

  useEffect(() => {
    if (!el) return;

    return subscribe(el, (width, height) => callbackRef.current(width, height), throttleMs);
  }, [el, throttleMs]);
};

export default useResizeObserver;
