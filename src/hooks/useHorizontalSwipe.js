import { useRef, useCallback } from "react";

export function useHorizontalSwipe({ onSwipe, threshold = 50 }) {
  const gesture = useRef(null);

  const onTouchStart = useCallback((event) => {
    const t = event.touches[0];

    gesture.current = {
      startX: t.clientX,
      startY: t.clientY,
      lastX: t.clientX,
      lastY: t.clientY,
    };
  }, []);

  const onTouchMove = useCallback((event) => {
    if (!gesture.current) return;

    const t = event.touches[0];

    gesture.current.lastX = t.clientX;
    gesture.current.lastY = t.clientY;
  }, []);

  const onTouchEnd = useCallback(() => {
    const g = gesture.current;
    if (!g) return;

    const dx = g.lastX - g.startX;
    const dy = g.lastY - g.startY;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX > absY && absX > threshold) {
      if (dx < 0) onSwipe?.(true);
      else onSwipe?.(false);
    }

    gesture.current = null;
  }, [onSwipe, threshold]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
