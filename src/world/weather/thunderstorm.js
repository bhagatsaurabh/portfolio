import { Rain } from "./rain";
import { denorm, rand } from "@/utils";

export class Thunderstorm extends Rain {
  params = {
    baseLightningSequence: [0.5, 0.2, 0.4, 0.1, 0.5, 0.15],
  };
  lightningAlpha = 0;
  lightningTimer = 0;
  lightningSequence = [];
  lightningIndex = 0;
  darknessAlpha = 0;
  alphaStrength = 1;

  constructor(world) {
    super(world, "thunderstorm");
  }

  step(dt) {
    super.step(dt);
    this.alphaStrength = denorm(this.world.light, 0.3, 1); // reduced contrast at night

    this.updateLightning(dt);
    this.applyWindTurbulence(dt);
  }
  render(ctx) {
    this.darknessAlpha = 0.12 * this.weight;
    ctx.fillStyle = `rgba(0,0,0,${this.darknessAlpha})`;
    ctx.fillRect(0, 0, this.world.width, this.world.height);
    ctx.strokeStyle = this.color;
    for (const drop of this.drops) {
      const speed = drop.velocity.length();
      const originalLength = drop.length;
      drop.length = originalLength * (1 + speed / 1200);
      if (rand(0, 1) < 0.05) {
        drop.length *= 1.5;
        ctx.lineWidth = drop.thickness * 1.5;
      } else {
        ctx.lineWidth = drop.thickness;
      }
      drop.render(ctx);
      drop.length = originalLength;
    }

    if (this.lightningAlpha > 0.01) {
      ctx.fillStyle = `rgba(255,255,255,${this.lightningAlpha})`;
      ctx.fillRect(0, 0, this.world.width, this.world.height);
    }
    ctx.globalAlpha = 1;
  }
  updateLightning(dt) {
    if (this.lightningSequence.length === 0 && rand(0, 1) < 0.0015) {
      this.startLightning();
    }

    if (this.lightningSequence.length > 0) {
      this.lightningTimer -= dt;

      if (this.lightningTimer <= 0) {
        this.lightningIndex++;

        if (this.lightningIndex >= this.lightningSequence.length) {
          this.lightningSequence = [];
          this.lightningAlpha = 0;
        } else {
          this.lightningAlpha = this.lightningSequence[this.lightningIndex] * this.alphaStrength;
          this.lightningTimer = rand(0.02, 0.06);
        }
      }
    }
  }
  startLightning() {
    this.lightningSequence = [...this.params.baseLightningSequence];
    this.lightningIndex = 0;
    this.lightningAlpha = this.lightningSequence[0] * this.alphaStrength;
    this.lightningTimer = 0.03;
  }
  applyWindTurbulence(dt) {
    const wind = this.world.weather.wind;
    wind.x += rand(-40, 40) * dt;
  }
  clear(cb) {
    super.clear(cb);
  }
  destroy() {
    super.destroy();
  }
}
