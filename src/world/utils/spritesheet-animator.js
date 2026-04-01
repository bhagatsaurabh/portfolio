import { RepeatWrapping } from "three";

export class SpriteSheetAnimator {
  constructor(texture, { tilesX = 1, tilesY = 1, fps = 15, anims = {}, defaultAnim = null }) {
    this.texture = texture;
    this.tilesX = tilesX;
    this.tilesY = tilesY;
    this.totalFrames = tilesX * tilesY;
    this.fps = fps;
    this.at = 0;
    this.anims = anims;
    this.currentAnim = null;
    this.currentFrame = 0;
    this.startFrame = 0;
    this.endFrame = 0;
    this.loop = true;
    this.flipX = false;

    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(1 / tilesX, 1 / tilesY);

    if (defaultAnim) {
      this.play(defaultAnim);
    }
  }

  play(name, { loop = true } = {}) {
    const anim = this.anims[name];
    if (!anim) return;

    this.currentAnim = name;
    this.startFrame = anim.start;
    this.endFrame = anim.end;
    this.loop = anim.loop ?? loop;
    this.currentFrame = this.startFrame;
    this.updateUV(this.flipX);
  }
  setFlipX(flip) {
    this.flipX = flip;
    this.updateUV(this.flipX);
  }
  update(dt) {
    if (!this.currentAnim) return;
    if (this.startFrame === this.endFrame) return;
    this.at += dt;
    if (this.at < 1 / this.fps) return;

    this.at = 0;
    this.currentFrame++;
    if (this.currentFrame > this.endFrame) {
      if (this.loop) {
        this.currentFrame = this.startFrame;
      } else {
        this.currentFrame = this.endFrame;
      }
    }
    this.updateUV(this.flipX);
  }
  updateUV(flipX = false) {
    const col = this.currentFrame % this.tilesX;
    const row = Math.floor(this.currentFrame / this.tilesX);
    const frameWidth = 1 / this.tilesX;
    if (flipX) {
      this.texture.repeat.x = -frameWidth;
      this.texture.offset.x = (col + 1) * frameWidth;
    } else {
      this.texture.repeat.x = frameWidth;
      this.texture.offset.x = col * frameWidth;
    }
    this.texture.offset.y = 1 - (row + 1) / this.tilesY;
  }
}
