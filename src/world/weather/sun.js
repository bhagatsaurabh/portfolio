import { Vector2 } from "three";
import { Weather } from "@/world/simulation/weather";
import { rand } from "@/utils";

class SunDust {
  position;
  velocity;
  life = 0;
  duration;
  radius;
  alpha;

  constructor(x, y) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2(rand(-10, 10), rand(-20, -5));
    this.duration = rand(4, 8);
    this.radius = rand(0.5, 1.5);
    this.alpha = rand(0.2, 0.6);
  }

  update(dt, wind) {
    this.life += dt;
    const t = this.life / this.duration;
    if (t >= 1) return false;
    this.velocity.x += (wind.x * 0.05 - this.velocity.x) * 0.5 * dt;
    this.velocity.x += Math.sin(this.life * 2) * 2 * dt;
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.alpha *= 0.995;
    return true;
  }
  render(ctx) {
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class Sun extends Weather {
  dust = new Set();
  emitAccumulator = 0;
  state = {
    baseEmitInterval: 0.08,
  };

  step(dt) {
    this.emitAccumulator += dt;
    if (this.weight > 0.01) {
      const interval = this.state.baseEmitInterval / this.weight;
      while (this.emitAccumulator >= interval) {
        this.emitAccumulator -= interval;
        this.onEmit();
      }
    }
    for (const p of this.dust) {
      if (!p.update(dt, this.world.weather.wind)) {
        this.dust.delete(p);
      }
    }
  }
  onEmit() {
    const x = rand(0, this.world.width);
    const y = rand(0, this.world.height);
    this.dust.add(new SunDust(x, y));
  }
  render(ctx) {
    const { width, height } = this.world;
    ctx.fillStyle = "rgba(255, 220, 150, 0.06)";
    ctx.fillRect(0, 0, width, height);
    const x = width * 0.8;
    const y = height * 0.2;
    const pulse = 1 + Math.sin(performance.now() * 0.0015) * 0.05;
    const radius = 100 * pulse;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, "rgba(255,245,200,1)");
    gradient.addColorStop(0.25, "rgba(255,220,150,0.7)");
    gradient.addColorStop(1, "rgba(255,200,120,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.color;
    for (const p of this.dust) {
      p.render(ctx);
    }
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }
}
