import { Color, DoubleSide, Sprite } from "three";
import SpriteNodeMaterial from "three/src/materials/nodes/SpriteNodeMaterial";

export class MeSprite {
  sprite = null;
  material = null;
  baseScale = 0.075;
  onReady = () => {};

  get color() {
    return this.material?.color.getHexString();
  }
  set color(c) {
    if (!this.material) return;
    this.material.color = new Color(c);
  }

  constructor(loader, pos, color, onReady) {
    this.setup(loader, pos, color, onReady);
  }

  setup(loader, pos, color, onReady) {
    this.onReady = onReady;
    loader.load(
      `${import.meta.env.VITE_SB_CDN_URL}/images/me-under-tree.webp`,
      (tex) => this.onLoad(tex, pos, color),
      () => {},
      (err) => console.log("Meself: Loader error: ", err),
    );
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
    sprite.scale.set(tex.width / tex.height, 1, 1).multiplyScalar(this.baseScale);
    sprite.position.copy(pos);
    sprite.position.y += sprite.scale.y / 2;
    sprite.position.x += sprite.scale.x / 2;
    this.sprite = sprite;

    this.onReady(sprite);
  }
  update() {}
}
