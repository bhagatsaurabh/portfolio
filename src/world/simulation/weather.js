import { Vector2 } from "three";
import { weatherThemes } from "@/utils/constants";
import { ColorTween, Tween } from "../utils/tween";
import { easeInOut } from "../utils";
import { TimeoutSchedule } from "../utils/schedule";
import { Simulation } from "./simulation";
import { Snow } from "../weather/snow";

export class Weather extends Simulation {
  weight = 0;
  tween = null;
  color = "#363537";
  colorTween = null;

  constructor(world) {
    super(world);
    this.color = weatherThemes[world.state.theme];
  }

  fadeTo(target, duration) {
    this.tween = new Tween(this.weight, target, duration);
    this.tween.start();
  }
  update(dt) {
    if (this.tween) {
      const res = this.tween.update(dt);
      this.weight = res.value;
      if (res.finished) {
        this.tween = null;
      }
    }
    if (this.colorTween) {
      const colorTweenRes = this.colorTween.update(dt);
      this.color = colorTweenRes.value;
      if (colorTweenRes.finished) {
        this.colorTween = null;
      }
    }
    this.step?.(dt);
  }
  sync() {
    this.colorTween = new ColorTween(
      this.color,
      weatherThemes[this.world.state.theme],
      0.75,
      easeInOut,
    );
    this.colorTween.start();
  }
}

export class WeatherController extends Simulation {
  weathers = [];
  wind = new Vector2(-180, 0);
  gustTimeout = new TimeoutSchedule(0.75);

  constructor(world) {
    super(world);
  }

  update(dt) {
    if (this.gustTimeout.update(dt)) {
      this.onGustTimeout();
    }

    for (let i = this.weathers.length - 1; i >= 0; i--) {
      const weather = this.weathers[i];

      weather.update(dt);

      if (weather.weight <= 0 && !weather.tween) {
        weather.destroy?.();
        this.weather.splice(i, 1);
      }
    }
  }
  render(ctx) {
    for (const weather of this.weathers) {
      weather.render?.(ctx);
    }
  }
  sync() {
    for (const weather of this.weathers) {
      weather.sync?.();
    }
  }
  transitionTo(WeatherClass, duration = 3) {
    const weather = new WeatherClass(this.world);
    weather.fadeTo(1, duration);
    this.weathers.push(weather);

    for (const w of this.weathers) {
      if (w !== weather) {
        w.fadeTo(0, duration);
      }
    }
  }
  gust(direction) {
    this.wind = new Vector2(-direction * 480, 0);
    this.gustTimeout.start();
  }
  onGustTimeout() {
    this.wind = new Vector2(-180, 0);
  }
}

export const mapWeatherType = (/* type */) => {
  /* if (type === "sunny") return Sunny;
  if (type === "light_rain") return LightRain;
  if (type === "heavy_rain") return HeavyRain;
  if (type === "snow") return Snow;
  if (type === "foggy") return Foggy; */
  return Snow;
};
