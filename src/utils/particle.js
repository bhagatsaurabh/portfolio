import { rand } from "@/utils/graphics";

export class Particle {
  constructor(position, radius, color, velocity, radiusDegrade) {
    this.position = position;
    this.color = color;
    this.velocity = velocity;
    this.radius = radius;
    this.radiusDegrade = radiusDegrade;
    this.currStep = 0;
    this.targetYVelocity = rand(rand(-4, -3), rand(3, 4));
    this.initialYVelocity = 0;
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  update() {
    this.position.addInPlace(this.velocity);
    this.radius -= this.radiusDegrade;
    if (this.radius <= 0.1) this.radius = 0.1;
  }
}
