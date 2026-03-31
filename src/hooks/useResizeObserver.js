import { throttle } from "@/utils";
import { useEffect, useRef } from "react";

const subscribers = new Set();
const observer = new ResizeObserver((entries) => {
  if (!entries[0]) return;
  const { width, height } = entries[0].contentRect;
  subscribers.forEach((cb) => cb(width, height));
});
const subscribe = (cb, throttleMs) => {
  if (subscribers.size === 0) {
    observer.observe(document.body);
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

export const useResizeObserver = (callback, throttleMs = 150) => {
  const callbackRef = useRef(callback);
  // eslint-disable-next-line react-hooks/refs
  callbackRef.current = callback;

  useEffect(() => {
    return subscribe((width, height) => callbackRef.current(width, height), throttleMs);
  }, [throttleMs]);
};

export default useResizeObserver;
