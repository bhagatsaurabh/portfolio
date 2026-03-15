import { Vector } from "canvas-percept";
import { Simulation, TimeoutSchedule, Tween } from "./world";
import { Snow } from "./snow";

export class Weather extends Simulation {
  weight = 0;
  tween = null;

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
    this.step?.(dt);
  }
}

export class WeatherController extends Simulation {
  weathers = [];
  wind = new Vector(240, 0);
  gustTimeout = new TimeoutSchedule(750);

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
    for (const weather of this.weather) {
      weather.render?.(ctx);
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
    this.wind = new Vector(direction * 480, 0);
    this.gustTimeout.start();
  }
  onGustTimeout() {
    this.wind = new Vector(240, 0);
  }
}

export const mapWeatherType = (type) => {
  /* if (type === "sunny") return Sunny;
  if (type === "light_rain") return LightRain;
  if (type === "heavy_rain") return HeavyRain;
  if (type === "snow") return Snow;
  if (type === "foggy") return Foggy; */
  return Snow;
};
