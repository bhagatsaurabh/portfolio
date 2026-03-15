import { Vector } from "canvas-percept";
import { easeInOut, rand } from "@/utils/graphics";
import { Tween } from "@/utils/world";
import { snowColors } from "@/utils/constants";
import { Weather } from "@/utils/weather";

export class SnowFlake {
  position = new Vector(0, 0);
  radius = 1;
  velocity = new Vector(0, 0);
  shrinkFactor = 72;
  windInfluence = 1;
  windInfluenceRange = [0.75, 1.25];
  vyDurationRange = [50, 100];
  vyRange = [-240, 240];
  vyTween = null;

  constructor({ position, radius, velocity } = {}) {
    this.position = position ?? this.position;
    this.radius = radius ?? this.radius;
    this.velocity = velocity ?? this.velocity;

    this.windInfluence = rand(...this.windInfluenceRange);
    const targetVY = rand(...this.vyRange);
    this.vyTween = new Tween(0, targetVY, rand(...this.vyDurationRange, easeInOut));
    this.vyTween.start();
  }
  update(dt) {
    const vyTweenRes = this.vyTween.update(dt);
    this.velocity.y = vyTweenRes.value;
    if (vyTweenRes.finished) {
      const targetVY = rand(...this.vyRange);
      this.vyTween = new Tween(this.velocity.y, targetVY, rand(50, 100), easeInOut);
      this.vyTween.start();
    }

    this.position.x += this.velocity.x * this.windInfluence * dt;
    this.position.y += this.velocity.y * dt;
    const shrink = this.shrinkFactor / this.velocity.y;
    this.radius = Math.max(0.1, this.radius - shrink * dt);
  }
  render(ctx) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class Snow extends Weather {
  state = {
    color: "#000",
    baseEmitInterval: 135,
    minRadius: 0.1,
    maxRadius: 0.2,
  };
  flakes = new Set();
  emitAccumulator = 0;

  constructor(world) {
    super(world);
  }

  step(dt) {
    this.emitAccumulator += dt;
    if (this.weight > 0.01) {
      const interval = this.state.baseEmitInterval / this.weight;
      while (this.emitAccumulator >= interval) {
        this.emitAccumulator -= interval;
        this.onEmit();
      }
    }

    for (const flake of this.flakes) {
      flake.config.velocity.x = this.world.weather.wind.x;

      if (this.isOutofBounds(flake)) {
        this.flakes.delete(flake);
      } else {
        flake.update(dt);
      }
    }
  }
  isOutofBounds(flake) {
    const r = flake.radius;
    const x = flake.position.x;
    const y = flake.position.y;

    return x < -r || y < -r || y > this.world.height + r || x > this.world.width + r;
  }
  onEmit() {
    const radius = rand(this.state.minRadius, this.state.maxRadius);
    const velocity = this.world.weather.wind.clone();
    const position = new Vector(
      velocity.x < 0 ? this.world.width + radius : -radius,
      rand(0, this.world.height),
    );
    this.flakes.add(new SnowFlake({ position, radius, velocity }));
  }
  render(ctx) {
    ctx.fillStyle = this.state.color;

    for (const flake of this.flakes) {
      flake.render(ctx);
    }
  }
  sync() {
    this.state.color = snowColors[this.world.state.theme];
  }
  destroy() {}
}
