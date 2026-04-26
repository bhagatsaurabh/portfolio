import { denorm, norm } from "@/utils";
import { Color, DoubleSide, Sprite } from "three";
import SpriteNodeMaterial from "three/src/materials/nodes/SpriteNodeMaterial";

export class MeSprite {
  sprite = null;
  material = null;
  baseScale = 0.075;
  onReady = () => {};
  baseX = 0;
  normZ = 0;
  normX = 0;

  get color() {
    return this.material?.color.getHexString();
  }
  set color(c) {
    if (!this.material) return;
    this.material.color = new Color(c);
  }

  constructor(landscape, pos, color, onReady) {
    this.landscape = landscape;
    this.setup(landscape.world.texLoader, pos, color, onReady);
  }

  setup(loader, pos, color, onReady) {
    this.onReady = onReady;
    loader.load(
      `${import.meta.env.VITE_SB_CDN_URL}/images/me-under-tree.webp`,
      (tex) => this.onLoad(tex, pos, color),
      () => {},
      (err) => console.log("Meself: Loader error: ", err),
    );

    const [nearZ, farZ] = this.landscape.sandbox.bounds.z;
    this.normZ = norm(pos.z, nearZ, farZ);
  }
  onLoad(tex, pos, color) {
    this.material = new SpriteNodeMaterial({
      map: tex,
      transparent: true,
      color: new Color(color),
      side: DoubleSide,
      depthWrite: false,
    });

    const sprite = new Sprite(this.material);
    sprite.center.set(0, 0);
    sprite.scale.set(tex.width / tex.height, 1, 1).multiplyScalar(this.baseScale);
    sprite.position.copy(pos);
    this.sprite = sprite;

    this.onReady(sprite);
  }
  update() {}
  resize() {
    const left = this.landscape.sandbox.bounds.leftNear
      .clone()
      .lerp(this.landscape.sandbox.bounds.leftFar, Math.abs(this.normZ));
    const right = this.landscape.sandbox.bounds.rightNear
      .clone()
      .lerp(this.landscape.sandbox.bounds.rightFar, Math.abs(this.normZ));

    this.baseX = denorm(this.normX, left.x, right.x);
  }
}
