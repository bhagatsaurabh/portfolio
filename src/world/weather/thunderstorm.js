import { Rain } from "./rain";
import { rand } from "@/utils";

export class Thunderstorm extends Rain {
  lightningAlpha = 0;
  lightningTimer = 0;
  lightningSequence = [];
  lightningIndex = 0;

  constructor(world) {
    super(world);
  }

  render(ctx) {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(0, 0, this.world.width, this.world.height);
    ctx.strokeStyle = this.color;
    for (const drop of this.drops) {
      const speed = drop.velocity.length();
      const originalLength = drop.length;
      drop.length = originalLength * (1 + speed / 1200);
      if (Math.random() < 0.05) {
        drop.length *= 1.5;
        ctx.lineWidth = drop.thickness * 1.5;
      } else {
        ctx.lineWidth = drop.thickness;
      }
      drop.render(ctx);
      drop.length = originalLength;
    }

    /* for (const s of this.splashes) {
      s.render(ctx);
    } */

    if (this.lightningAlpha > 0.01) {
      ctx.fillStyle = `rgba(255,255,255,${this.lightningAlpha})`;
      ctx.fillRect(0, 0, this.world.width, this.world.height);
    }
    ctx.globalAlpha = 1;
  }
  step(dt) {
    super.step(dt);
    this.updateLightning(dt);
    this.applyWindTurbulence(dt);
  }
  updateLightning(dt) {
    if (this.lightningSequence.length === 0 && Math.random() < 0.002) {
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
          this.lightningAlpha = this.lightningSequence[this.lightningIndex];
          this.lightningTimer = rand(0.02, 0.06);
        }
      }
    }
  }
  startLightning() {
    this.lightningSequence = [1, 0.4, 0.8, 0.2, 1, 0.3];
    this.lightningIndex = 0;
    this.lightningAlpha = this.lightningSequence[0];
    this.lightningTimer = 0.03;
  }
  applyWindTurbulence(dt) {
    const wind = this.world.weather.wind;
    wind.x += rand(-40, 40) * dt;
  }
}
