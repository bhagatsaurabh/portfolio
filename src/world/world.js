import { themes } from "@/utils/constants";
import { WeatherController } from "./simulation/weather";
import { Tween } from "./utils/tween";
import { easeInOut } from "./utils";

export class SimulatedWorld {
  #width = 0;
  #height = 0;
  #state = { theme: themes.LIGHT };
  #weather = null;
  light = 0;
  lightTween = null;

  // To avoid large frame gaps causing sim explosion
  MAX_DT = 0.05; // 50ms
  lastTime = 0;
  simulations = [];
  frameId = -1;
  renderFn = undefined;

  get weather() {
    return this.#weather;
  }
  get width() {
    return this.#width;
  }
  get height() {
    return this.#height;
  }
  get state() {
    return this.#state;
  }
  set state(newState = {}) {
    if (typeof newState !== "object") {
      return;
    }
    if (Object.prototype.hasOwnProperty.call(newState, "theme")) {
      this.#state.theme = newState.theme;
    }
    this.sync();
  }

  constructor(canvas, theme, renderFn) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.renderFn = renderFn;
    this.#state.theme = theme;
    this.light = theme === themes.LIGHT ? 1 : 0;
    this.resize();
    this.#weather = new WeatherController(this);
    this.simulations.push(this.weather);
  }
  start() {
    this.frameId = requestAnimationFrame(this.loop.bind(this));
  }
  loop(now) {
    this.frameId = requestAnimationFrame(this.loop.bind(this));

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let dt = (now - this.lastTime) / 1000;
    dt = Math.min(dt, this.MAX_DT);
    this.lastTime = now;

    if (this.lightTween) {
      const lightTweenRes = this.lightTween.update(dt);
      this.light = lightTweenRes.value;
      if (lightTweenRes.finished) {
        this.lightTween = null;
      }
    }

    for (const simulation of this.simulations) {
      simulation.update?.(dt);
      simulation.render?.(this.context);
    }
    this.renderFn?.(dt);
  }
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const dpr = window.devicePixelRatio || 1;
    const dprWidth = rect.width * dpr;
    const dprHeight = rect.height * dpr;
    if (this.canvas.width === dprWidth && this.canvas.height === dprHeight) {
      return;
    }
    this.canvas.width = dprWidth;
    this.canvas.height = dprHeight;
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.#width = width;
    this.#height = height;
    for (const simulation of this.simulations) {
      simulation.resize?.(this.width, this.height);
    }
  }
  sync() {
    this.lightTween = new Tween(
      this.light,
      this.state.theme === themes.LIGHT ? 1 : 0,
      0.75,
      easeInOut,
    );
    this.lightTween.start();

    for (const simulation of this.simulations) {
      simulation.sync?.();
    }
  }
  destroy() {
    cancelAnimationFrame(this.frameId);
    for (const simulation of this.simulations) {
      simulation.destroy?.();
    }
  }
}
