import React, { Component } from 'react';
import { getEase, getRandom } from '../../../utils/graphics';
import { Vector2 } from 'canvas-percept';

import classes from './particles.module.css';

class Particle {
  constructor(position, radius, color, velocity, radiusDegrade) {
    this.position = position;
    this.color = color;
    this.velocity = velocity;
    this.radius = radius;
    this.radiusDegrade = radiusDegrade;
    this.currStep = 0;
    this.targetYVelocity = getRandom(getRandom(-4, -3), getRandom(3, 4))
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

class Particles extends Component {
  state = {
    width: 0,
    height: 0
  }

  minRadius = 1;
  maxRadius = 2;
  minXVelocity = -3;
  maxXVelocity = -5;
  stormDuration = 1000;
  radiusDegrade = .005;

  generationInterval = 135;
  offset = 10;
  steps = 150;
  color = '#000';

  setColor() {
    this.color = getComputedStyle(document.getElementById('App')).getPropertyValue('--particlesColor');
    this.particles.forEach(particle => particle.color = this.color);
  }
  componentDidMount() {
    this.appEl = document.getElementById('App');
    this.setState({ width: this.container.clientWidth, height: this.container.clientHeight }, () => {
      this.startX = this.state.width + this.offset;
      this.ctx = this.canvas.getContext('2d');
      this.particles = new Set();
      this.setColor();
      this.generateParticle();
      this.animloop();
    });
  }
  componentDidUpdate(prevProps) {
    if (this.props.navigationOccured && prevProps.navigationOccured !== this.props.navigationOccured) {
      this.direction = this.props.navigationOccured.direction < 0;
      if (this.direction) {
        this.generationInterval = 10;
        this.minXVelocity = 7;
        this.maxXVelocity = 9;
        this.radiusDegrade = .01;
        this.startX = -5;
      } else {
        this.generationInterval = 10;
        this.minXVelocity = -7;
        this.maxXVelocity = -9;
        this.radiusDegrade = .01;
      }

      this.particles.forEach(particle => {
        particle.velocity.x = getRandom(this.minXVelocity, this.maxXVelocity);
      });
      setTimeout(() => {
        this.generationInterval = 135;
        this.minXVelocity = -3;
        this.maxXVelocity = -5;
        this.radiusDegrade = .005;
        this.startX = this.state.width + this.offset;
      }, this.stormDuration);
    }
    if (this.props.theme !== prevProps.theme) {
      this.setColor();
    }
  }
  generateParticle = () => {
    this.particles.add(new Particle(
      new Vector2(this.startX, getRandom(0, this.state.height)),
      getRandom(this.minRadius, this.maxRadius),
      this.color,
      new Vector2(getRandom(this.minXVelocity, this.maxXVelocity), 0),
      this.radiusDegrade
    ));
    setTimeout(this.generateParticle, this.generationInterval);
  }
  animloop() {
    requestAnimationFrame(this.animloop.bind(this), this.canvas);
    if (!this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach(particle => {
      if (particle.position.x < -this.offset || particle.position.y < -this.offset || particle.position.y > this.canvas.height + this.offset || particle.position.x > this.canvas.width + this.offset) this.particles.delete(particle);
      particle.velocity.y = getEase(particle.currStep, particle.initialYVelocity, particle.targetYVelocity - particle.initialYVelocity, this.steps);
      if (particle.currStep < this.steps) particle.currStep += 3;
      else {
        particle.currStep = 0;
        particle.initialYVelocity = particle.velocity.y;
        particle.targetYVelocity = getRandom(getRandom(-4, -3), getRandom(3, 4));
      }
      particle.update();
      particle.draw(this.ctx);
    });
  }

  render() {
    return (
      <div style={{ ...this.props.customStyle }} className={classes.Particles} ref={(element => this.container = element)}>
        <canvas width={this.state.width} height={this.state.height} ref={element => element && (this.canvas = element)}></canvas>
      </div>
    );
  }
};

export default Particles;