import { createRef, useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import styles from "./navigator.module.css";
import { clamp } from "@/utils";
import { normalize } from "@/utils/graphics";
import Icon from "../Icon/icon";
import { routes } from "@/router";

const Navigator = ({ checkpoints, index, onNavigate }) => {
  const thumbEl = createRef();
  const trackEl = createRef();
  const titlesContainer = createRef();
  const lock = useRef(false);
  const pointerId = useRef(-1);

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
      if (pointerId.current !== e.pointerId || !trackEl.current) return;

      if (lock.current) {
        const { x: trackX, width: trackWidth } =
          trackEl.current.getBoundingClientRect();
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
    const handle = setTimeout(
      () => titlesContainer.current?.classList.remove(styles.titlehidden),
      500
    );
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointercancel", handlePointerCancel);
      document.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("pointerout", handlePointerOut);
      document.removeEventListener("pointerup", handlePointerUp);
      clearTimeout(handle);
    };
  }, [handlePointerMove]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    pointerId.current = e.pointerId;
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
    pointerId.current = -1;
    thumbEl.current?.classList.remove(styles.active);
  };
  const handlePointerCancel = (e) => cancel(e);
  const handlePointerLeave = (e) => cancel(e);
  const handlePointerOut = (e) => cancel(e);
  const handlePointerUp = (e) => cancel(e);
  const handleClick = (direction) => {
    const newIdx = clamp(index + direction, 0, routes.length - 1);
    if (newIdx === index) return;
    onNavigate(newIdx);
  };

  return (
    <>
      <aside
        ref={titlesContainer}
        className={[styles.SectionTitles, styles.titlehidden].join(" ")}
      >
        {checkpoints.map((checkpoint, idx) => (
          <h2
            key={checkpoint.name}
            className={[
              styles.SectionTitle,
              idx === index ? styles.titleactive : "",
              idx === 0 || idx === checkpoints.length - 1
                ? styles.titleignore
                : "",
            ].join(" ")}
          >
            {checkpoint.title}
          </h2>
        ))}
      </aside>
      <nav
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
            left: `calc(${
              index * (100 / (checkpoints.length - 1))
            }% - 0.275rem)`,
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
      </nav>
      <div className={styles.NavigationButtons}>
        <button
          onClick={() => handleClick(-1)}
          className={[styles.Left, index === 0 ? styles.hidden : ""].join(" ")}
        >
          <Icon name="leftArrow" />
        </button>
        <button
          onClick={() => handleClick(1)}
          className={[
            styles.Right,
            index === routes.length - 1 ? styles.hidden : "",
          ].join(" ")}
        >
          <Icon name="rightArrow" />
        </button>
      </div>
    </>
  );
};

Navigator.propTypes = {
  index: PropTypes.number,
  checkpoints: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
  onNavigate: PropTypes.func,
};

export default Navigator;
