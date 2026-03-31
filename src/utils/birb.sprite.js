import { Vector3, Sprite, Color, DoubleSide, Mesh, BoxGeometry, MeshBasicMaterial } from "three";
import SpriteNodeMaterial from "three/src/materials/nodes/SpriteNodeMaterial";
import { SpriteSheetAnimator } from "./spritesheet-animator";
import { rand, randInt, randPick } from "./graphics";
import { TimeoutSchedule } from "./simulation";
import { lerp } from "three/src/math/MathUtils";

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
  restGT = 0;
  restPos = new Vector3(0, 0, 0);
  restGroundBaseX = 0;
  restingOn = "";
  restTimeout = new TimeoutSchedule(rand(4, 6));
  flyTimeout = new TimeoutSchedule(rand(5, 10));
  target = new Vector3();
  ndc = new Vector3();
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

    this.prevPosition = pos.clone();
    this.velocity = new Vector3();
    this.target = pos.clone();

    this.speed = 0.8;
    this.steerStrength = 3.0;
    this.curveStrength = 0.6;
    this.wanderStrength = 0.2;

    this.phase = Math.random() * Math.PI * 2;

    this.sprite.position.copy(pos);

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
  rest() {
    this.#tired = true;
    this.target = this.restPos.clone();
    this.restTimeout.start();
  }
  restOnTree(tree, immediate = false) {
    const spawnBranchIndices = tree.upperBranchIndices;
    const spawnBranchIdx = spawnBranchIndices[randInt(0, spawnBranchIndices.length - 1)];
    const branch = tree.branches[spawnBranchIdx];
    this.restTree = tree;
    this.restBranch = branch;

    this.restT = rand(0.15, 0.85);
    this.updateRestPosTree(this.restT);
    this.restingOn = "tree";

    if (immediate) {
      this.#rest = true;
    }
    this.rest();
  }
  restOnGround() {
    this.restGT = rand(-0.75, 0.75);

    const left = this.flock.landscape.sandbox.bounds.currLeftNear;
    const right = this.flock.landscape.sandbox.bounds.currRightNear;
    const x = left.x + (right.x - left.x) * 0.5;

    this.restGroundBaseX = x + this.flock.landscape.position.x + this.restGT;
    this.restPos.y = -1;
    this.updateRestPosGround();
    this.restingOn = "ground";

    this.rest();
  }
  unrest() {
    if (this.#rest) {
      this.onRestTimeout();
    }
  }
  update(dt) {
    if (!this.sprite) return;
    this.at += dt;

    if (this.#rest && this.isOutsideView()) {
      this.unrest();
      return;
    }

    if (this.restTimeout.update(dt)) {
      this.onRestTimeout();
    }
    if (this.flyTimeout.update(dt)) {
      this.onFlyTimeout();
    }

    if (!this.#rest || this.#tired) {
      if (this.#tired) {
        this.restingOn === "tree" && this.updateRestPosTree(this.restT);
        this.target.copy(this.restPos);
      }
      this.prevPosition.copy(this.sprite.position);

      const toTarget = new Vector3().subVectors(this.target, this.sprite.position);
      const dist = toTarget.length();
      const dir = toTarget.normalize();
      const desiredVelocity = dir.clone().multiplyScalar(this.speed);

      const groundY = -1;
      const groundBuffer = 0.15;
      let groundForce = 1.3;
      if (this.sprite.position.y < groundY + groundBuffer) {
        const downVel = Math.abs(this.velocity.y);
        groundForce = downVel * 4;
        const pushUp = (groundY + groundBuffer - this.sprite.position.y) / groundBuffer;
        desiredVelocity.y += pushUp * groundForce;
      }

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
      this.sprite.position.addScaledVector(this.velocity, dt);
      const prevToTarget = new Vector3().subVectors(this.target, this.prevPosition);
      const currToTarget = new Vector3().subVectors(this.target, this.sprite.position);

      const crossed = prevToTarget.dot(currToTarget) < 0;
      const veryClose = dist < (this.#tired ? 0.01 : 0.04);
      if (crossed || veryClose) {
        if (!this.#tired) {
          this.setTarget();
          this.flock.reached.add(this);
        } else {
          this.animator.setFlipX(randPick(true, false));
          this.sprite.position.copy(this.restPos);
          this.prevPosition.copy(this.restPos);
          this.target.copy(this.restPos);
          this.#rest = true;
          this.#tired = false;
          this.animator.play("sit");

          // recompute restGroundBaseX ?
          const left = this.flock.landscape.sandbox.bounds.currLeftNear;
          const right = this.flock.landscape.sandbox.bounds.currRightNear;
          const x = left.x + (right.x - left.x) * 0.5;
          this.restGroundBaseX = x + this.flock.landscape.position.x + this.restGT;

          this.material.rotation = 0;
          return;
        }
      }

      if (dist < 0.2) {
        desiredVelocity.addScaledVector(dir, 0.5);
      }

      if (this.velocity.lengthSq() > 0.0001) {
        const dir = this.velocity.clone().normalize();
        const angle = Math.atan2(dir.y, dir.x);
        const facingLeft = dir.x < 0;
        this.animator.setFlipX(facingLeft);
        this.material.rotation = facingLeft ? angle + Math.PI : angle;
      }
    } else {
      if (this.restingOn === "tree") {
        this.updateRestPosTree(this.restT);
        this.sprite.position.copy(this.restPos);
        this.sprite.position.y += 0.009;
      } else {
        this.updateRestPosGround();
        this.sprite.position.copy(this.restPos);
        this.sprite.position.y += 0.012;
      }
    }

    this.animator.update(dt);

    this.baseX = this.sprite.position.x + this.flock.landscape.position.x;

    if (this.sprite.position.y < -1) {
      this.sprite.position.y = -1;
    }
  }
  isOutsideView() {
    const margin = 0.2;
    this.ndc.copy(this.sprite.position).project(this.flock.landscape.world.orthoCam);
    return (
      this.ndc.x < -1 - margin ||
      this.ndc.x > 1 + margin ||
      this.ndc.y < -1 - margin ||
      this.ndc.y > 1 + margin
    );
  }
  updateRestPosTree(t) {
    const s = this.restBranch.worldStart;
    const e = this.restBranch.worldEnd;
    const offset = this.restTree.root.position;
    this.restPos.set(
      s.x + (e.x - s.x) * t + offset.x,
      s.y + (e.y - s.y) * t + offset.y,
      s.z + (e.z - s.z) * t + offset.z,
    );
    this.restPos.multiplyScalar(this.restTree.mesh.scale.x).add(this.restTree.mesh.position);
  }
  updateRestPosGround(/* t */) {
    const [nearZ, farZ] = this.flock.landscape.sandbox.bounds.z;
    let t = (this.sprite.position.z - nearZ) / (farZ - nearZ);
    const factor = lerp(1.0, this.flock.landscape.minPaxFactor, t);
    const pX = this.restGroundBaseX + -this.flock.landscape.position.x * factor;

    this.restPos.x = pX;
    this.target.copy(this.restPos);
  }
  onRestTimeout() {
    this.restTimeout.reset(rand(10, 15));
    this.#rest = false;
    this.#tired = false;
    this.sprite.position.copy(this.restPos);
    this.prevPosition.copy(this.restPos);
    this.setTarget();
    this.animator.play("fly");
    this.flyTimeout.start();
  }
  onFlyTimeout() {
    this.flyTimeout.reset(rand(5, 10));
    if (this.flock.landscape.position.x < 0.1) {
      // rest only on the originTree for now
      this.restOnTree(this.flock.landscape.props.originTree);
    } else {
      this.restOnGround();
    }
  }
}
