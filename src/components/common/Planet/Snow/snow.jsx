import { createRef, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import classes from "./snow.module.css";
import { Snow as SnowC } from "@/utils/snow";
import usePrevious from "@/hooks/usePrevious";
import { SimulatedWorld } from "@/utils/world";
import useResizeObserver from "@/hooks/useResizeObserver";

const Snow = (props) => {
  const prevProps = usePrevious();
  const canvasEl = createRef();
  const world = useRef(null);
  const dimensions = useRef({ width: 0, height: 0 });
  useResizeObserver((width, height) => {
    dimensions.current.width = width;
    dimensions.current.height = height;
    canvasEl.current.width = dimensions.current.width;
    canvasEl.current.height = dimensions.current.height;
  });

  useEffect(() => {
    world.current = new SimulatedWorld(canvasEl.current);
    world.current.simulations.push(
      new SnowC(canvasEl.current, {
        color: getComputedStyle(
          document.querySelector("#App"),
        ).getPropertyValue("--snowColor"),
      }),
    );

    return () => {
      snow.current && clearInterval(snow.current.snowGeneratorHandle);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const windDirection =
      props.windDirection !== 0 ? props.windDirection < 0 : null;
    const prevWindDirection =
      prevProps.windDirection !== 0 ? prevProps.windDirection < 0 : null;
    if (
      windDirection !== null &&
      prevProps &&
      prevWindDirection !== windDirection
    ) {
      snow.current.storm(windDirection);
    }
    if (props.theme !== prevProps?.theme) {
      snow.current.color = getComputedStyle(
        document.querySelector("#App"),
      ).getPropertyValue("--snowColor");
    }
  }, [props]);

  return (
    <div
      style={{ ...props.customStyle }}
      className={[classes.Snow, props.blur ? classes.blur : ""].join(" ")}
    >
      <canvas
        ref={(element) => element && (canvasEl.current = element)}
      ></canvas>
    </div>
  );
};

Snow.propTypes = {
  customStyle: PropTypes.any,
  windDirection: PropTypes.bool,
  theme: PropTypes.string,
  blur: PropTypes.bool,
};

export default Snow;
