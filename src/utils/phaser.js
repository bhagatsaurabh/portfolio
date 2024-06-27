import * as Phaser from "phaser";

import { InvertPipeline } from "./invert-pipeline";
import { themes } from "./constants";

class Boot extends Phaser.Scene {
  constructor() {
    super("boot");
  }
  preload() {}
  create() {
    this.scene.start("preloader");
  }
}
class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }
  init() {}
  preload() {
    this.load.setPath("spritesheets");
    this.load.spritesheet("bird", "bird.png", {
      frameWidth: 56,
      frameHeight: 56,
    });
  }
  create() {
    this.scene.start("game");
  }
}
class Bird {
  constructor(game, id) {
    this.game = game;
    this.id = id;
    this.create();
  }

  generateRandomPath() {
    this.birdPath = new Phaser.Curves.Path(this.sprite.x, this.sprite.y);
    const points = [];
    for (let i = 0; i < 4; i++) {
      const pos = this.getRandomPosition();
      points.push(pos);
    }
    this.birdPath.splineTo(points);
  }
  getRandomPosition() {
    const x = Phaser.Math.Between(0, this.game.sys.game.canvas.width);
    const y = Phaser.Math.Between(0, this.game.sys.game.canvas.height);
    return { x, y };
  }
  create() {
    this.sprite = this.game.add.sprite(100, 100, "bird");
    this.sprite.anims.create({
      key: "fly",
      frames: this.sprite.anims.generateFrameNumbers("bird", {
        start: 0,
        end: 4,
      }),
      frameRate: 16,
      repeat: -1,
    });
    this.sprite.anims.play("fly");

    this.generateRandomPath();
    this.birdTween = this.game.tweens.add({
      targets: { t: 0 },
      t: 1,
      duration: Phaser.Math.Between(4000, 6000),
      repeat: -1,
      yoyo: false,
      onUpdate: (tween) => {
        const t = tween.getValue();
        const point = this.birdPath.getPoint(t);
        this.sprite.setPosition(point.x, point.y);

        const prevPoint = this.birdPath.getPoint(Math.max(t - 0.01, 0));
        if (prevPoint) {
          let angle = Phaser.Math.Angle.BetweenPoints(prevPoint, point);
          const maxRotation = Phaser.Math.DegToRad(90);
          if (angle < -maxRotation) {
            angle += Math.PI;
            this.sprite.setFlipX(true);
          } else if (angle > maxRotation) {
            angle -= Math.PI;
            this.sprite.setFlipX(true);
          } else {
            this.sprite.setFlipX(false);
          }
          this.sprite.rotation = angle;
        }
      },
      onRepeat: () => {
        this.generateRandomPath();
      },
    });
  }
}
class MainGame extends Phaser.Scene {
  constructor() {
    super("game");
    this.noOfBirds = 2;
    this.birds = [];
  }
  create() {
    this.setCamera();
    this.createBirds();
  }
  createBirds() {
    this.pipeline = this.renderer.pipelines.add(
      "InvertPipeline",
      new InvertPipeline(this.game)
    );
    for (let i = 0; i < this.noOfBirds; i += 1) {
      this.birds.push(new Bird(this, i));
    }
    if (this.game.theme === themes.LIGHT) this.enablePipeline(true);
  }
  enablePipeline(enable) {
    if (enable) {
      this.birds.forEach((bird) => {
        bird.sprite.setPipeline(this.pipeline);
      });
    } else {
      this.birds.forEach((bird) => {
        bird.sprite.resetPipeline();
      });
    }
  }
  setCamera() {
    this.camera = this.cameras.main;
    this.camera.setBounds(
      0,
      0,
      this.sys.game.canvas.width,
      this.sys.game.canvas.height
    );
  }
  update() {}
}

const config = {
  type: Phaser.WEBGL,
  stableSort: false,
  width: 1024,
  height: 715,
  parent: "selfcover",
  backgroundColor: "#00000000",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  transparent: true,
  disableContextMenu: true,
  scene: [Boot, Preloader, MainGame],
};

export const init = (theme) => {
  const game = new Phaser.Game(config);
  game.theme = theme;
  return game;
};
