import { createRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Vector } from "canvas-percept";

import { ease, rand } from "@/utils/graphics";
import classes from "./particles.module.css";
import { Particle } from "@/utils/particle";

const Particles = (props) => {
  const [config, setConfig] = useState({
    minRadius: 1,
    maxRadius: 2,
    minXVelocity: -3,
    maxXVelocity: -5,
    stormDuration: 1000,
    radiusDegrade: 0.005,
    offset: 10,
    steps: 150,
  });
  const particlesState = createRef();
  const dimensions = createRef();
  dimensions.current = { width: 0, height: 0 };
  const appEl = createRef();
  const ctx = createRef();
  const container = createRef();
  const canvasEl = createRef();
  const particles = createRef();
  particlesState.current = {
    generationInterval: 135,
    color: "#000",
    startX: 0,
  };

  useEffect(() => {
    appEl.current = document.getElementById("App");
    dimensions.current.width = container.current.clientWidth;
    dimensions.current.height = container.current.clientHeight;
    canvasEl.current.width = container.current.clientWidth;
    canvasEl.current.height = container.current.clientHeight;

    particlesState.current.startX = dimensions.current.width + config.offset;
    ctx.current = canvasEl.current.getContext("2d");
    particles.current = new Set();
    setColor();
    generateParticle();
    animloop();

    return () => {};
  }, []);

  const setColor = () => {
    particlesState.current.color = getComputedStyle(
      document.getElementById("App")
    ).getPropertyValue("--particlesColor");
    particles.current.forEach(
      (particle) => (particle.color = particlesState.current.color)
    );
  };
  const generateParticle = () => {
    particles.current.add(
      new Particle(
        new Vector(
          particlesState.current.startX,
          rand(0, dimensions.current.height)
        ),
        rand(config.minRadius, config.maxRadius),
        particlesState.current.color,
        new Vector(rand(config.minXVelocity, config.maxXVelocity), 0),
        config.radiusDegrade
      )
    );
    setTimeout(generateParticle, particlesState.current.generationInterval);
  };
  const animloop = () => {
    requestAnimationFrame(animloop.bind(this), canvasEl.current);
    if (!canvasEl.current) return;
    ctx.current.clearRect(
      0,
      0,
      canvasEl.current.width,
      canvasEl.current.height
    );
    particles.current.forEach((particle) => {
      if (
        particle.position.x < -config.offset ||
        particle.position.y < -config.offset ||
        particle.position.y > canvasEl.current.height + config.offset ||
        particle.position.x > canvasEl.current.width + config.offset
      )
        particles.current.delete(particle);
      particle.velocity.y = ease(
        particle.currStep,
        particle.initialYVelocity,
        particle.targetYVelocity - particle.initialYVelocity,
        config.steps
      );
      if (particle.currStep < config.steps) particle.currStep += 3;
      else {
        particle.currStep = 0;
        particle.initialYVelocity = particle.velocity.y;
        particle.targetYVelocity = rand(rand(-4, -3), rand(3, 4));
      }
      particle.update();
      particle.draw(ctx.current);
    });
  };

  /* if (
    this.props.navigationOccured &&
    prevProps.navigationOccured !== this.props.navigationOccured
  ) {
    this.direction = this.props.navigationOccured.direction < 0;
    if (this.direction) {
      this.generationInterval = 10;
      this.minXVelocity = 7;
      this.maxXVelocity = 9;
      this.radiusDegrade = 0.01;
      this.startX = -5;
    } else {
      this.generationInterval = 10;
      this.minXVelocity = -7;
      this.maxXVelocity = -9;
      this.radiusDegrade = 0.01;
    }

    this.particles.forEach((particle) => {
      particle.velocity.x = rand(this.minXVelocity, this.maxXVelocity);
    });
    setTimeout(() => {
      this.generationInterval = 135;
      this.minXVelocity = -3;
      this.maxXVelocity = -5;
      this.radiusDegrade = 0.005;
      this.startX = this.state.width + this.offset;
    }, this.stormDuration);
  }
  if (this.props.theme !== prevProps.theme) {
    this.setColor();
  } */

  return (
    <div
      style={{ ...props.customStyle }}
      className={classes.Particles}
      ref={(element) => (container.current = element)}
    >
      <canvas
        width={dimensions.current.width}
        height={dimensions.current.height}
        ref={(element) => element && (canvasEl.current = element)}
      ></canvas>
    </div>
  );
};

Particles.propTypes = {
  customStyle: PropTypes.any,
};

export default Particles;
