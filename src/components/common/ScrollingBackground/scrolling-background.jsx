import { useRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import classes from "./scrolling-background.module.css";
import useNightSky from "@/hooks/useNightSky";
import useResizeObserver from "@/hooks/useResizeObserver";

const ScrollingBackground = ({ activeRoute, disabled }) => {
  const canvasFGEl = useRef(null);
  const canvasBGEl = useRef(null);
  const containerEl = useRef(null);

  const { cosmos } = useNightSky(canvasFGEl, canvasBGEl);
  // eslint-disable-next-line react-hooks/refs
  useResizeObserver(containerEl.current, () => cosmos.current?.resize(), 1000);

  return (
    <div
      ref={(element) => element && (containerEl.current = element)}
      className={classNames(
        classes.ScrollingBackground,
        classes[`Position${disabled ? 0 : activeRoute.handle.routeOrder}`],
      )}
      style={{
        background: `url("${import.meta.env.VITE_SB_CDN_URL}/textures/cardboard-flat.webp") var(--background-0)`,
      }}
    >
      <canvas
        className={classes.NightSky}
        ref={(element) => element && (canvasFGEl.current = element)}
      />
      <canvas
        className={classes.NightSky}
        ref={(element) => element && (canvasBGEl.current = element)}
      />
    </div>
  );
};

ScrollingBackground.propTypes = {
  activeRoute: PropTypes.object,
  disabled: PropTypes.bool,
};

export default ScrollingBackground;
