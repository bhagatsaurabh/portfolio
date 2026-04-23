import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

import classes from "./atmosphere.module.css";
import useResizeObserver from "@/hooks/useResizeObserver";
import useWeather from "@/hooks/useWeather";
import useWorld from "@/hooks/useWorld";

const Atmosphere = ({ theme, routeDirection, currRoute, onWorldWeatherChange = () => {} }) => {
  const canvasEl = useRef(null);
  const { world } = useWorld(canvasEl, theme, onWorldWeatherChange);
  const { weather: currWeather, pending } = useWeather();
  useResizeObserver(() => world.current?.resize());

  useEffect(() => {
    if (pending || !world.current) return;
    world.current?.weather.transitionTo(currWeather);
  }, [currWeather, pending, world]);

  useEffect(() => {
    if (routeDirection !== 0) {
      world.current?.weather.gust(routeDirection);
    }
  }, [currRoute.handle.routeOrder, routeDirection, world]);

  return (
    <div className={classes.Atmosphere}>
      <canvas
        className={classes.canvas}
        ref={(element) => element && (canvasEl.current = element)}
      ></canvas>
    </div>
  );
};

Atmosphere.propTypes = {
  routedDirection: PropTypes.number,
  theme: PropTypes.string,
  currRoute: PropTypes.object,
};

export default Atmosphere;
