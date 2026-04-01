import { Vector2 } from "three";
import { Weather } from "@/world/simulation/weather";
import { rand } from "@/utils";
import { easeInOut } from "@/world/utils";
import { Tween } from "../utils/tween";

export class SnowFlake {
  position = new Vector2(0, 0);
  radius = 1;
  velocity = new Vector2(0, 0);
  shrinkFactor = 60;
  windInfluence = 1;
  windInfluenceRange = [0.65, 1.35];
  vyDurationRange = [0.5, 0.7];
  vyRange = [-180, 180];
  vyTween = null;

  constructor({ position, radius, velocity } = {}) {
    this.position = position ?? this.position;
    this.radius = radius ?? this.radius;
    this.velocity = velocity ?? this.velocity;

    this.windInfluence = rand(...this.windInfluenceRange);
    this.vyTween = new Tween(0, rand(...this.vyRange), rand(...this.vyDurationRange), easeInOut);
    this.vyTween.start();
  }
  update(dt) {
    const vyTweenRes = this.vyTween.update(dt);
    this.velocity.y = vyTweenRes.value;
    if (vyTweenRes.finished) {
      this.vyTween = new Tween(
        this.velocity.y,
        rand(...this.vyRange),
        rand(...this.vyDurationRange),
        easeInOut,
      );
      this.vyTween.start();
    }

    const effectiveVX = this.velocity.x * this.windInfluence * dt;
    const effectiveVY = this.velocity.y * dt;
    this.position.x += effectiveVX;
    this.position.y += effectiveVY;
    const shrink = this.shrinkFactor / (Math.abs(this.velocity.x) * this.windInfluence);
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
    baseEmitInterval: 0.135,
    minRadius: 1.2,
    maxRadius: 1.8,
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
      flake.velocity.x = this.world.weather.wind.x;

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
    const position = new Vector2(
      velocity.x < 0 ? this.world.width + radius : -radius,
      rand(0, this.world.height),
    );
    this.flakes.add(new SnowFlake({ position, radius, velocity }));
  }
  render(ctx) {
    ctx.fillStyle = this.color;

    for (const flake of this.flakes) {
      flake.render(ctx);
    }
  }
  destroy() {}
}
