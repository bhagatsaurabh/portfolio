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
