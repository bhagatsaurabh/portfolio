import { Vector3, Sprite, Color, DoubleSide } from "three";
import SpriteNodeMaterial from "three/src/materials/nodes/SpriteNodeMaterial";
import { SpriteSheetAnimator } from "./spritesheet-animator";
import { rand } from "./graphics";

export class Birb {
  sprite = null;
  material = null;
  baseScale = 0.09;
  at = 0;
  animator = null;
  #rest = false;
  #tired = false;
  restTree = null;
  restBranch = null;
  restT = 0;
  restPos = new Vector3(0, 0, 0);
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
    this.position = pos.clone();
    this.velocity = new Vector3();

    this.stiffness = 3.0; // pull strength toward target
    this.damping = 2.2; // resistance
    this.phase = Math.random() * Math.PI * 2;
    this.wanderRadius = 0.3;
    this.prevVelocity = new Vector3();
    this.sprite.position.copy(this.position);
    this.target = this.position.clone();

    this.animator = new SpriteSheetAnimator(tex, {
      tilesX: 17,
      tilesY: 1,
      defaultAnim: "fly",
      fps: 80,
      anims: { fly: { start: 0, end: 15, loop: true }, sit: { start: 16, end: 16, loop: false } },
    });

    this.onReady(this);
  }
  setTarget(vec) {
    this.target = vec;
  }
  rest(tree, branch) {
    this.#tired = true;
    this.restTree = tree;
    this.restBranch = branch;
    this.restT = rand(0.15, 0.85);
    this.updateRestPos(this.restT);
    this.target = this.restPos.clone();
  }
  unrest() {}
  update(dt) {
    if (!this.sprite) return;
    this.at += dt;

    if (!this.#rest || this.#tired) {
      const dist = this.sprite.position.distanceTo(this.target);
      if (dist < 0.001 && this.#tired) {
        this.#rest = true;
        this.#tired = false;
        this.animator.play("sit");
        return;
      }

      const toTarget = this.target.clone().sub(this.position);
      const force = toTarget
        .multiplyScalar(this.stiffness)
        .sub(this.velocity.clone().multiplyScalar(this.damping));
      this.velocity.add(force.multiplyScalar(dt));
      this.position.add(this.velocity.clone().multiplyScalar(dt));
      const wanderX = Math.sin(this.at * 0.6 + this.phase) * this.wanderRadius;
      const wanderY = Math.cos(this.at * 0.5 + this.phase) * this.wanderRadius * 0.5;
      this.target.x += wanderX * dt;
      this.target.y += wanderY * dt;
      this.sprite.position.copy(this.position);
      if (this.velocity.lengthSq() > 0.001) {
        const dir = this.velocity.clone().normalize();
        const angle = Math.atan2(dir.y, dir.x);
        const facingLeft = dir.x < 0;
        this.animator.setFlipX(facingLeft);
        this.material.rotation = facingLeft ? angle + Math.PI : angle;
      }
      this.prevVelocity.copy(this.velocity);
    } else {
      this.updateRestPos(this.restT);
      this.sprite.position.copy(this.restPos);
      this.sprite.position.y += 0.009;
    }

    this.animator.update(dt);
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
}
