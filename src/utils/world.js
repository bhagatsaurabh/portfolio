import { WeatherController } from "./weather";

export class SimulatedWorld {
  #width = 0;
  #height = 0;
  #state = { theme: "#000" };
  #weather = null;

  // To avoid large frame gaps causing sim explosion
  MAX_DT = 0.05; // 50ms
  lastTime = 0;
  simulations = [];
  frameId = -1;

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

  constructor(canvas) {
    this.canvas = canvas;
    this.resize();
    this.context = canvas.getContext("2d");
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

    for (const simulation of this.simulations) {
      simulation.update?.(dt);
      simulation.render?.(this.context);
    }
  }
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width * dpr;
    const height = rect.height * dpr;
    if (this.canvas.width === width && this.canvas.height === height) {
      return;
    }

    this.#width = width;
    this.#height = height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const simulation of this.simulations) {
      simulation.resize?.(this.width, this.height);
    }
  }
  sync() {
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

export class Simulation {
  constructor(world) {
    this.world = world;
  }
}

export class IntervalSchedule {
  constructor(interval) {
    this.interval = interval;
    this.accumulator = 0;
    this.running = false;
  }

  start() {
    this.accumulator = 0;
    this.running = true;
  }
  stop() {
    this.running = false;
  }
  update(dt) {
    if (!this.running) return false;

    this.accumulator += dt;
    if (this.accumulator >= this.interval) {
      this.accumulator -= this.interval;
      return true;
    }
    return false;
  }
}

export class TimeoutSchedule {
  constructor(delay) {
    this.delay = delay;
    this.accumulator = 0;
    this.running = false;
  }

  start() {
    this.accumulator = 0;
    this.running = true;
  }
  stop() {
    this.running = false;
  }
  reset() {
    this.running = false;
    this.accumulator = 0;
  }
  update(dt) {
    if (!this.running) return false;

    this.accumulator += dt;
    if (this.accumulator >= this.delay) {
      this.running = false;
      return true;
    }
    return false;
  }
}

export class Tween {
  constructor(from, to, duration, easingFn = (t) => t) {
    this.from = from;
    this.to = to;
    this.duration = duration;
    this.easingFn = easingFn;
    this.elapsed = 0;
    this.running = false;
  }

  start() {
    this.elapsed = 0;
    this.running = true;
  }
  update(dt) {
    if (!this.running) return { value: this.to, finished: false };

    this.elapsed += dt;
    const t = Math.min(this.elapsed / this.duration, 1);
    const k = this.easingFn(t);
    const value = this.from + (this.to - this.from) * k;
    if (t === 1) {
      this.running = false;
      return { value, finished: true };
    }
    return { value, finished: false };
  }
}
