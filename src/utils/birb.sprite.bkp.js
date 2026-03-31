import { Vector3, Sprite, Color, DoubleSide, Mesh, BoxGeometry, MeshBasicMaterial } from "three";
import SpriteNodeMaterial from "three/src/materials/nodes/SpriteNodeMaterial";
import { SpriteSheetAnimator } from "./spritesheet-animator";
import { rand } from "./graphics";
import { TimeoutSchedule } from "./simulation";

export class Birb {
  sprite = null;
  material = null;
  baseScale = 0.0875;
  baseX = 0;
  at = 0;
  animator = null;
  #rest = false;
  #tired = false;
  restTree = null;
  restBranch = null;
  restT = 0;
  restPos = new Vector3(0, 0, 0);
  restTimeout = new TimeoutSchedule(rand(2, 3));
  target = new Vector3();
  onReady = () => {};

  get color() {
    return this.material?.color.getHexString();
  }
  set color(c) {
    if (!this.material) return;
    this.material.color = new Color(c);
  }

  constructor(loader, flock, pos, color, onReady) {
    this.flock = flock;
    this.setup(loader, pos, color, onReady);

    this.box = new Mesh(
      new BoxGeometry(0.01, 0.01, 0.01),
      new MeshBasicMaterial({ color: 0xff0000 }),
    );
    this.flock.landscape.world.scene.add(this.box);
  }

  setup(loader, pos, color, onReady) {
    this.onReady = onReady;
    loader.load(
      `${import.meta.env.VITE_SB_CDN_URL}/spritesheets/birb.webp`,
      (tex) => this.onLoad(tex, pos, color),
      () => {},
      (err) => console.log("Birb: Loader error: ", err),
    );
  }
  onLoad(tex, pos, color) {
    const material = new SpriteNodeMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      color: new Color(color),
    });
    this.material = material;

    this.sprite = new Sprite(material);
    this.sprite.scale.set(this.baseScale, this.baseScale, 1);

    this.position = pos.clone();
    this.prevPosition = pos.clone();
    this.velocity = new Vector3();
    this.target = this.position.clone();

    this.speed = 0.8;
    this.steerStrength = 3.0;
    this.curveStrength = 0.6;
    this.wanderStrength = 0.2;

    this.phase = Math.random() * Math.PI * 2;

    this.sprite.position.copy(this.position);

    this.animator = new SpriteSheetAnimator(tex, {
      tilesX: 17,
      tilesY: 1,
      defaultAnim: "fly",
      fps: 80,
      anims: { fly: { start: 0, end: 15, loop: true }, sit: { start: 16, end: 16, loop: false } },
    });

    this.onReady(this);
  }
  setTarget() {
    const fTarget = this.flock.target;
    const fRadius = this.flock.radius;
    this.target.set(
      rand(fTarget.x - fRadius, fTarget.x + fRadius),
      rand(fTarget.y - fRadius, fTarget.y + fRadius),
      fTarget.z,
    );
  }
  rest(tree, branch) {
    this.#tired = true;
    this.restTree = tree;
    this.restBranch = branch;
    this.restT = rand(0.15, 0.85);
    this.updateRestPos(this.restT);
    this.target = this.restPos.clone();
    this.restTimeout.start();
  }
  unrest() {
    if (this.#rest) {
      this.onRestTimeout();
    }
  }
  update(dt) {
    if (!this.sprite) return;
    this.at += dt;

    if (this.restTimeout.update(dt)) {
      this.onRestTimeout();
    }

    if (!this.#rest || this.#tired) {
      this.prevPosition.copy(this.position);

      const toTarget = new Vector3().subVectors(this.target, this.position);
      const dist = toTarget.length();
      const dir = toTarget.normalize();
      const desiredVelocity = dir.clone().multiplyScalar(this.speed);
      const slowRadius = 0.2;
      const t = Math.min(dist / slowRadius, 1.0);
      const perp = new Vector3(-dir.y, dir.x, 0);
      const curve = Math.sin(this.at * 2.0 + this.phase) * this.curveStrength * t;
      desiredVelocity.addScaledVector(perp, curve);
      const wander = new Vector3(
        Math.sin(this.at * 0.6 + this.phase),
        Math.cos(this.at * 0.5 + this.phase),
        0,
      ).multiplyScalar(this.wanderStrength);
      desiredVelocity.add(wander);
      this.velocity.lerp(desiredVelocity, this.steerStrength * dt);
      this.position.addScaledVector(this.velocity, dt);
      const prevToTarget = new Vector3().subVectors(this.target, this.prevPosition);
      const currToTarget = new Vector3().subVectors(this.target, this.position);

      const crossed = prevToTarget.dot(currToTarget) < 0;
      const veryClose = dist < 0.04;
      if ((crossed || veryClose) && !this.#tired) {
        this.setTarget();
        if (!this.flock.reached.has(this)) {
          this.flock.reached.add(this);
        }
      }

      if (dist < 0.2) {
        desiredVelocity.addScaledVector(dir, 0.5);
      }

      if (dist < 0.02 && this.#tired) {
        this.#rest = true;
        this.#tired = false;
        this.animator.play("sit");
        return;
      }

      this.sprite.position.copy(this.position);

      if (this.velocity.lengthSq() > 0.0001) {
        const dir = this.velocity.clone().normalize();
        const angle = Math.atan2(dir.y, dir.x);
        const facingLeft = dir.x < 0;
        this.animator.setFlipX(facingLeft);
        this.material.rotation = facingLeft ? angle + Math.PI : angle;
      }
    } else {
      this.updateRestPos(this.restT);
      this.sprite.position.copy(this.restPos);
      this.sprite.position.y += 0.009;
    }

    this.animator.update(dt);

    this.baseX = this.sprite.position.x;
    this.box.position.copy(this.target);
  }
  updateRestPos(t) {
    const s = this.restBranch.worldStart;
    const e = this.restBranch.worldEnd;
    const offset = this.restTree.root.position;
    this.restPos.set(
      s.x + (e.x - s.x) * t + offset.x,
      s.y + (e.y - s.y) * t + offset.y,
      s.z + (e.z - s.z) * t + offset.z,
    );
    return this.restPos.multiplyScalar(this.restTree.mesh.scale.x).add(this.restTree.mesh.position);
  }
  onRestTimeout() {
    this.restTimeout.reset();
    this.#rest = false;
    this.#tired = false;
    this.position.copy(this.restPos);
    this.prevPosition.copy(this.restPos);
    this.setTarget();
    this.animator.play("fly");
  }
}
