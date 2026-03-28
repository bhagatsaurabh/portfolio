import { Color, DoubleSide, Sprite as ThreeSprite } from "three";
import SpriteNodeMaterial from "three/src/materials/nodes/SpriteNodeMaterial";

export class Sprite {
  sprite = null;
  material = null;
  baseScale = 0.075;
  #color = "#000";
  onReady = () => {};

  get color() {
    return this.#color;
  }
  set color(c) {
    this.#color = c;
    if (!this.sprite) return;

    this.material.color = new Color(c);
  }

  constructor(loader, path, pos, onReady) {
    this.setup(loader, path, pos, onReady);
  }

  setup(loader, path, pos, onReady) {
    this.onReady = onReady;
    loader.load(
      path,
      (tex) => this.onLoad(tex, pos),
      () => {},
      (err) => console.log("Meself: Loader error: ", err),
    );
  }
  onLoad(tex, pos) {
    this.material = new SpriteNodeMaterial({
      map: tex,
      transparent: true,
      color: new Color(this.color),
      side: DoubleSide,
      depthWrite: false,
    });

    const sprite = new ThreeSprite(this.material);
    sprite.scale.set(tex.width / tex.height, 1, 1).multiplyScalar(this.baseScale);
    sprite.position.copy(pos);
    sprite.position.y += sprite.scale.y / 2;
    sprite.position.x += sprite.scale.x / 2;
    this.sprite = sprite;

    this.onReady(sprite);
  }
  update() {}
}
