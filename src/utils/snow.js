import { ease, rand } from "@/utils/graphics";
import { Vector } from "canvas-percept";

export class SnowFlake {
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

export class Snow {
  config = {
    minRadius: 1,
    maxRadius: 2,
    stormDuration: 1000,
    offset: 10,
    steps: 150,
  };
  state = {
    generationInterval: 135,
    color: "#000",
    startX: 0,
    direction: true,
    minXVelocity: -3,
    maxXVelocity: -5,
    radiusDegrade: 0.005,
  };
  snow = new Set();
  snowGeneratorHandle = -1;
  context = null;

  get color() {
    return this.state.color;
  }
  set color(c) {
    this.state.color = c;
    this.setColor();
  }

  constructor(canvas, config) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.config = { ...this.config, ...config };

    this.setup();
  }

  setup() {
    this.state.startX = this.canvas.width + this.config.offset;
    this.setColor();
    this.snowGeneratorHandle = setInterval(
      () => this.generateSnowFlakes(this.snow),
      this.state.generationInterval
    );
    this.animloop(this.snow);
  }
  setColor() {
    this.snow.forEach((flake) => (flake.color = this.state.color));
  }
  generateSnowFlakes(snow) {
    snow.add(
      new SnowFlake(
        new Vector(this.state.startX, rand(0, this.canvas.height)),
        rand(this.config.minRadius, this.config.maxRadius),
        this.state.color,
        new Vector(rand(this.state.minXVelocity, this.state.maxXVelocity), 0),
        this.state.radiusDegrade
      )
    );
  }
  animloop(snow) {
    if (!this.canvas) return;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    snow.forEach((flake) => {
      if (
        flake.position.x < -this.config.offset ||
        flake.position.y < -this.config.offset ||
        flake.position.y > this.canvas.height + this.config.offset ||
        flake.position.x > this.canvas.width + this.config.offset
      ) {
        snow.delete(flake);
      }
      flake.velocity.y = ease(
        flake.currStep,
        flake.initialYVelocity,
        flake.targetYVelocity - flake.initialYVelocity,
        this.config.steps
      );
      if (flake.currStep < this.config.steps) flake.currStep += 3;
      else {
        flake.currStep = 0;
        flake.initialYVelocity = flake.velocity.y;
        flake.targetYVelocity = rand(rand(-4, -3), rand(3, 4));
      }
      flake.update();
      flake.draw(this.context);
    });
    requestAnimationFrame(this.animloop.bind(this, snow));
  }
  storm(direction) {
    this.state.direction = direction;
    if (this.state.direction) {
      this.state.generationInterval = 10;
      this.state.minXVelocity = 7;
      this.state.maxXVelocity = 9;
      this.state.radiusDegrade = 0.01;
      this.state.startX = -5;
    } else {
      this.state.generationInterval = 10;
      this.state.minXVelocity = -7;
      this.state.maxXVelocity = -9;
      this.state.radiusDegrade = 0.01;
    }

    this.snow.forEach((flake) => {
      flake.velocity.x = rand(this.state.minXVelocity, this.state.maxXVelocity);
    });
    setTimeout(() => {
      this.state.generationInterval = 135;
      this.state.minXVelocity = -3;
      this.state.maxXVelocity = -5;
      this.state.radiusDegrade = 0.005;
      this.state.startX = this.canvas.width + this.config.offset;
    }, this.config.stormDuration);
  }
}
