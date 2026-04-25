import { useEffect, useRef } from "react";
import { SimulatedWorld } from "@/world/world";
import { TimeoutSchedule } from "@/world/utils/schedule";
import { rand } from "@/utils";
import { randPickExc } from "@/world/utils";
import { weathers } from "@/utils/constants";

export const useWorld = (canvasEl, theme, onWorldWeatherChange = () => {}) => {
  const world = useRef(null);
  const weatherTimeout = useRef(new TimeoutSchedule(rand(20, 35)));

  useEffect(() => {
    const render = (dt) => {
      if (!world.current) {
        return;
      }
      if (weatherTimeout.current.update(dt)) {
        const nextWeather = randPickExc(weathers, world.current.weather.lastWeather);
        world.current.weather.transitionTo(nextWeather);
        weatherTimeout.current.reset(rand(20, 35));
        weatherTimeout.current.start();
      }
    };

    if (!canvasEl) {
      return;
    }
    if (!world.current) {
      world.current = new SimulatedWorld(canvasEl.current, theme, render);
      world.current.sync();
      world.current.start();
      weatherTimeout.current.start();
    }
    if (world.current) {
      world.current.weather.onChange = onWorldWeatherChange;
    }
    if (world.current.state.theme !== theme) {
      world.current.state = { ...world.current.state, theme };
    }
  }, [canvasEl, onWorldWeatherChange, theme]);
  useEffect(
    () => () => {
      world.current?.destroy();
      world.current = null;
    },
    [],
  );

  return { world };
};

export default useWorld;
