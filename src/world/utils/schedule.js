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
