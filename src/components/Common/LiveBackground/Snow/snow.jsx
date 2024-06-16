import { createRef, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import classes from "./snow.module.css";
import { Snow as SnowC } from "@/utils/snow";
import usePrevious from "@/hooks/usePrevious";

const Snow = (props) => {
  const prevProps = usePrevious(props);
  const container = createRef();
  const canvasEl = createRef();
  const dimensions = useRef({ width: 0, height: 0 });
  const snow = useRef(null);

  useEffect(() => {
    dimensions.current.width = container.current.clientWidth;
    dimensions.current.height = container.current.clientHeight;
    canvasEl.current.width = container.current.clientWidth;
    canvasEl.current.height = container.current.clientHeight;
    snow.current = new SnowC(canvasEl.current, {
      color: getComputedStyle(document.querySelector("#App")).getPropertyValue(
        "--snowColor"
      ),
    });

    return () => {
      snow.current && clearInterval(snow.current.snowGeneratorHandle);
    };
  }, []);

  useEffect(() => {
    if (
      typeof props.windDirection === "boolean" &&
      prevProps &&
      prevProps.windDirection !== props.windDirection
    ) {
      snow.current.storm(props.windDirection);
    }
    if (props.theme !== prevProps?.theme) {
      snow.current.color = getComputedStyle(
        document.querySelector("#App")
      ).getPropertyValue("--snowColor");
    }
  }, [props]);

  return (
    <div
      style={{ ...props.customStyle }}
      className={classes.Snow}
      ref={(element) => (container.current = element)}
    >
      <canvas
        width={dimensions.current.width}
        height={dimensions.current.height}
        ref={(element) => element && (canvasEl.current = element)}
      ></canvas>
    </div>
  );
};

Snow.propTypes = {
  customStyle: PropTypes.any,
  windDirection: PropTypes.bool,
  theme: PropTypes.string,
};

export default Snow;
