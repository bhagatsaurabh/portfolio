import { Vector2 } from "three";
import { weatherThemes } from "@/utils/constants";
import { ColorTween, Tween } from "../utils/tween";
import { easeInOut } from "../utils";
import { TimeoutSchedule } from "../utils/schedule";
import { Simulation } from "./simulation";
import { mapWeatherType } from "../utils/weather-utils";

export class Weather extends Simulation {
  weight = 0;
  tween = null;
  color = "#363537";
  colorTween = null;
  cleared = false;
  destroyed = false;
  type = "";
  onClear = () => {};

  constructor(world, type) {
    super(world);
    this.type = type;
    this.color = weatherThemes[world.state.theme];
  }

  fadeTo(target, duration) {
    this.tween = new Tween(this.weight, target, duration);
    this.tween.start();
  }
  update(dt) {
    if (this.destroyed) {
      return;
    }

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
  clear(cb) {
    this.cleared = true;
    this.onClear = cb;
  }
  destroy() {
    this.destroyed = true;
  }
}

export class WeatherController extends Simulation {
  weathers = [];
  wind = new Vector2(-180, 0);
  gustTimeout = new TimeoutSchedule(0.75);
  onChange = () => {};

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
      if (weather.weight <= 0 && !weather.tween && !weather.cleared) {
        weather.clear?.((w) => this.onWeatherClear(w));
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
  onWeatherClear(weather) {
    const idx = this.weathers.findIndex((w) => w === weather);
    if (idx > -1) {
      weather.destroy?.();
      this.weathers.splice(idx, 1);
    }
  }
  transitionTo(weatherName, duration = 3) {
    const WeatherClass = mapWeatherType(weatherName);
    if (this.lastWeather === weatherName) {
      return;
    }

    const weather = new WeatherClass(this.world);
    this.onChange?.(weather.type);
    weather.fadeTo(1, duration);
    this.weathers.push(weather);

    for (const w of this.weathers) {
      if (w !== weather) {
        w.fadeTo(0, duration);
      }
    }
    this.lastWeather = weatherName;
  }
  gust(direction) {
    this.wind = new Vector2(-direction * 480, 0);
    this.gustTimeout.start();
    for (const weather of this.weathers) {
      weather.onGustStart?.();
    }
  }
  onGustTimeout() {
    this.wind = new Vector2(-180, 0);
    for (const weather of this.weathers) {
      weather.onGustEnd?.();
    }
  }
}
