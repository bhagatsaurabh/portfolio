import { Vector3, Sprite, SpriteMaterial } from "three";

export class Bird {
  constructor({
    texture,
    frames = 6,
    fps = 12,
    position = new Vector3(),
    target = new Vector3(),
    scale = 0.5,
  }) {
    texture.wrapS = texture.wrapT = 1000;
    texture.repeat.set(1 / frames, 1);

    const material = new SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });

    this.mesh = new Sprite(material);
    this.mesh.scale.set(scale, scale, 1);

    this.position = position.clone();
    this.velocity = new Vector3();
    this.target = target.clone();

    // dynamics
    this.stiffness = 3.0; // pull strength toward target
    this.damping = 2.2; // resistance

    this.frames = frames;
    this.fps = fps;
    this.animTime = 0;

    this.phase = Math.random() * Math.PI * 2;
    this.wanderRadius = 0.3;

    this.prevVelocity = new Vector3();

    this.mesh.position.copy(this.position);
  }

  update(dt, time) {
    const toTarget = this.target.clone().sub(this.position);

    const force = toTarget
      .multiplyScalar(this.stiffness)
      .sub(this.velocity.clone().multiplyScalar(this.damping));

    this.velocity.add(force.multiplyScalar(dt));
    this.position.add(this.velocity.clone().multiplyScalar(dt));

    const wanderX = Math.sin(time * 0.6 + this.phase) * this.wanderRadius;
    const wanderY = Math.cos(time * 0.5 + this.phase) * this.wanderRadius * 0.5;

    this.target.x += wanderX * dt;
    this.target.y += wanderY * dt;

    this.mesh.position.copy(this.position);

    if (this.velocity.lengthSq() > 0.0001) {
      const dir = this.velocity.clone().normalize();
      this.mesh.rotation.z = Math.atan2(dir.y, dir.x);
    }

    /* const turn = this.velocity.clone().sub(this.prevVelocity).length();
    this.mesh.rotation.y = Math.min(turn * 2.0, 0.5); */

    this.prevVelocity.copy(this.velocity);

    this.animTime += dt;
    const frame = Math.floor(this.animTime * this.fps) % this.frames;

    this.mesh.material.map.offset.x = frame / this.frames;
  }
}
