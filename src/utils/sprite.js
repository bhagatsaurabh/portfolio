import { Color, SpriteMaterial, TextureLoader, Sprite as ThreeSprite } from "three";

export class Sprite {
  sprite = null;
  material = null;
  #color = "#000";

  constructor(path, pos) {
    this.setup(path, pos);
  }

  get color() {
    return this.#color;
  }
  set color(c) {
    this.material.color = new Color(c);
  }

  setup(path, pos) {
    this.texture = new TextureLoader().load(path);

    this.material = new SpriteMaterial({
      map: this.texture,
      transparent: true,
      color: new Color(0xffffff),
    });

    const sprite = new ThreeSprite(this.material);
    sprite.scale.set(1.6879, 1, 1).multiplyScalar(0.45);
    sprite.position.copy(pos);
    sprite.position.y += sprite.scale.y / 2;
    sprite.position.x += sprite.scale.x / 2;
    this.sprite = sprite;
  }
}
