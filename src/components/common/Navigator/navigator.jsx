import { createRef, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import styles from "./navigator.module.css";
import { clamp } from "@/utils";
import { normalize } from "@/utils/graphics";

const Navigator = ({ checkpoints, index, onNavigate }) => {
  const thumbEl = createRef();
  const trackEl = createRef();
  const lock = useRef(false);

  let pointerId = -1;
  const moveThumb = useCallback(
    (amount) => {
      const newIdx = Math.round(amount * (checkpoints.length - 1));
      if (index !== newIdx) {
        if (window.matchMedia("(pointer: coarse)").matches) {
          navigator.vibrate(50);
        }
        onNavigate(newIdx);
      }
    },
    [checkpoints.length, thumbEl, index, onNavigate]
  );
  const handlePointerMove = useCallback(
    (e) => {
      e.preventDefault();
      if (!pointerId === e.pointerId) return;

      if (lock.current) {
        const { x: trackX, width: trackWidth } =
          trackEl.current?.getBoundingClientRect() ?? {};
        moveThumb(
          normalize(clamp(e.clientX - trackX, 0, trackWidth), 0, trackWidth)
        );
      }
    },
    [lock, moveThumb, trackEl, pointerId]
  );

  useEffect(() => {
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointercancel", handlePointerCancel);
    document.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("pointerout", handlePointerOut);
    document.addEventListener("pointerup", handlePointerUp);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointercancel", handlePointerCancel);
      document.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("pointerout", handlePointerOut);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    pointerId = e.pointerId;
    lock.current = true;
    thumbEl.current?.classList.add(styles.active);

    const { x: trackX, width: trackWidth } =
      trackEl.current?.getBoundingClientRect() ?? {};
    moveThumb(
      normalize(clamp(e.clientX - trackX, 0, trackWidth), 0, trackWidth)
    );
  };

  const cancel = (e) => {
    e.preventDefault();
    lock.current = false;
    pointerId = -1;
    thumbEl.current?.classList.remove(styles.active);
  };
  const handlePointerCancel = (e) => cancel(e);
  const handlePointerLeave = (e) => cancel(e);
  const handlePointerOut = (e) => cancel(e);
  const handlePointerUp = (e) => cancel(e);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerCancel={(e) => e.stopPropagation()}
      onPointerLeave={(e) => e.stopPropagation()}
      onPointerOut={(e) => e.stopPropagation()}
      onPointerUp={(e) => {
        e.stopPropagation();
        handlePointerUp(e);
      }}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      className={styles.Navigator}
    >
      <div
        ref={thumbEl}
        className={styles.Thumb}
        style={{
          left: `calc(${index * (100 / (checkpoints.length - 1))}% - 0.275rem)`,
        }}
      ></div>
      <div ref={trackEl} className={styles.Track}>
        <div className={styles.Checkpoints}>
          {checkpoints.map((checkpoint, idx) => (
            <div
              key={checkpoint.name}
              className={[
                styles.Checkpoint,
                idx === index ? styles.current : "",
              ].join(" ")}
              style={{ left: `${idx * (100 / (checkpoints.length - 1))}%` }}
            >
              {checkpoint.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Navigator.propTypes = {
  index: PropTypes.number,
  checkpoints: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
  onNavigate: PropTypes.func,
};

export default Navigator;
