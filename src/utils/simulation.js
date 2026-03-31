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
  reset(newDelay) {
    this.running = false;
    this.accumulator = 0;
    if (typeof newDelay === "number") {
      this.delay = newDelay;
    }
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
  reset() {
    this.start();
  }
  stop() {
    this.elapsed = 0;
    this.running = false;
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

export class ColorTween {
  constructor(fromHex, toHex, duration, easingFn = (t) => t) {
    this.fromHex = ColorTween.hexToRgb(fromHex);
    this.toHex = ColorTween.hexToRgb(toHex);
    this.duration = duration;
    this.easingFn = easingFn;
    this.elapsed = 0;
    this.value = fromHex;
    this.running = false;
  }

  start() {
    if (this.fromHex === this.toHex) return;
    this.elapsed = 0;
    this.running = true;
  }
  update(dt) {
    if (!this.running) return { value: this.value, finished: false };

    this.elapsed += dt;
    const t = Math.min(this.elapsed / this.duration, 1);
    const k = this.easingFn(t);
    const r = this.fromHex.r + (this.toHex.r - this.fromHex.r) * k;
    const g = this.fromHex.g + (this.toHex.g - this.fromHex.g) * k;
    const b = this.fromHex.b + (this.toHex.b - this.fromHex.b) * k;
    this.value = ColorTween.rgbToHex(r, g, b);

    if (t === 1) {
      this.running = false;
      return { value: this.value, finished: true };
    }
    return { value: this.value, finished: false };
  }

  static hexToRgb(hex) {
    hex = hex.replace("#", "");

    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  }
  static rgbToHex(r, g, b) {
    return (
      "#" +
      Math.round(r).toString(16).padStart(2, "0") +
      Math.round(g).toString(16).padStart(2, "0") +
      Math.round(b).toString(16).padStart(2, "0")
    );
  }
}
