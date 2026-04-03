import { Vector2 } from "three";
import { Weather } from "@/world/simulation/weather";
import { rand } from "@/utils";

export class RainDrop {
  position = new Vector2();
  velocity = new Vector2();
  length = rand(8, 18);
  thickness = rand(0.5, 1.5);
  alpha = rand(0.4, 0.7);
  inertia = rand(2.0, 4.5);
  gravity = rand(900, 1200);
  maxFallSpeed = rand(700, 1000);

  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
  }

  update(dt, wind) {
    this.velocity.y += this.gravity * dt;
    this.velocity.y = Math.min(this.velocity.y, this.maxFallSpeed);
    this.velocity.x += (wind.x - this.velocity.x) * this.inertia * dt;
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
  }
  render(ctx) {
    ctx.globalAlpha = this.alpha;

    const angle = Math.atan2(this.velocity.y, this.velocity.x);
    const dx = Math.cos(angle) * this.length;
    const dy = Math.sin(angle) * this.length;
    ctx.lineWidth = this.thickness;
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(this.position.x - dx, this.position.y - dy);
    ctx.stroke();
  }
}

export class Rain extends Weather {
  state = {
    baseEmitInterval: 0.015,
  };
  spawnPadding = 200;
  vyRange = [300, 500];

  drops = new Set();
  emitAccumulator = 0;

  constructor(world, type = "rain") {
    super(world, type);
  }

  step(dt) {
    if (this.cleared && this.drops.size === 0) {
      this.onClear(this);
      return;
    }

    this.emitAccumulator += dt;
    if (this.weight > 0.01) {
      const interval = this.state.baseEmitInterval / this.weight;
      while (this.emitAccumulator >= interval) {
        this.emitAccumulator -= interval;
        this.onEmit();
      }
    }
    for (const drop of this.drops) {
      if (this.isOutofBounds(drop)) {
        this.drops.delete(drop);
      } else {
        drop.update(dt, this.world.weather.wind);
      }
    }
  }
  isOutofBounds(drop) {
    const x = drop.position.x;
    const y = drop.position.y;
    return (
      y > this.world.height + 20 ||
      x < -20 - this.spawnPadding ||
      x > this.world.width + 20 + this.spawnPadding
    );
  }
  onEmit() {
    const wind = this.world.weather.wind;
    const vy = rand(this.vyRange[0], this.vyRange[1]);
    const vx = wind.x;
    const fallTime = this.world.height / vy;
    const hozDrift = Math.abs(vx * fallTime);
    const padding = hozDrift + 50;
    const position = new Vector2(rand(-padding, this.world.width + padding), -10);
    const velocity = new Vector2(vx, vy);
    this.drops.add(new RainDrop({ position, velocity }));
  }
  render(ctx) {
    ctx.strokeStyle = this.color;
    for (const drop of this.drops) {
      drop.render(ctx);
    }
    ctx.globalAlpha = 1;
  }
  onGustStart() {
    for (const drop of this.drops) {
      drop.velocity.x *= 1.5;
    }
  }
  clear(cb) {
    super.clear(cb);
  }
  destroy() {
    super.destroy();
  }
}
