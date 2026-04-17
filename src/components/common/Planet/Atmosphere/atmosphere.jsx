import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

import classes from "./atmosphere.module.css";
import useResizeObserver from "@/hooks/useResizeObserver";
import { mapWeatherType } from "@/world/utils/weather-utils";
import useWeather from "@/hooks/useWeather";
import useWorld from "@/hooks/useWorld";

const Atmosphere = ({ theme, routeDirection, currRoute, onWorldWeatherChange = () => {} }) => {
  const canvasEl = useRef(null);
  const { world } = useWorld(canvasEl, theme, onWorldWeatherChange);
  const { weather: currWeather, pending } = useWeather();
  useResizeObserver(() => world.current?.resize());

  useEffect(() => {
    if (pending || !world.current) return;

    const weathers = world.current?.weather.weathers;
    const lastWeather = weathers?.[weathers?.length - 1];
    const weatherClass = mapWeatherType(currWeather);
    if (!(lastWeather instanceof weatherClass)) {
      world.current?.weather.transitionTo(weatherClass);
    }
  }, [currWeather, pending, world]);
  useEffect(() => {
    if (routeDirection !== 0) {
      world.current?.weather.gust(routeDirection);
    }
  }, [currRoute.handle.routeOrder, routeDirection, world]);

  return (
    <div
      className={classNames(classes.Atmosphere, { [classes.blur]: currRoute?.handle.globalBlur })}
    >
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
