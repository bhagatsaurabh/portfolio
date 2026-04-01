import { Vector3 } from "three";
import { randPick } from "@/world/utils";
import { rand } from "@/utils";
import { Birb } from "../sprite/birb.sprite";

export class Flock {
  offset = {
    x: [-1, 1],
    y: [-1, 1],
  };
  birbs = [];
  target = null;
  reached = new Set();
  radius = 0.2;
  high = 0.25;
  saturation = 0.75;
  baseX = 0;
  baseScale = 1;

  constructor(landscape, noOfBirbs, tree) {
    this.landscape = landscape;
    this.sandbox = landscape.sandbox;
    this.target = new Vector3(
      rand(-1 + this.radius, 1 - this.radius),
      rand(-1 + this.radius + this.high, 1 - this.radius),
      this.landscape.sandbox.bounds.z[0],
    );

    this.setup(noOfBirbs, tree);
  }

  setup(noOfBirbs, tree) {
    for (let i = 0; i < noOfBirbs; i++) {
      this.spawnBirb(tree);
    }
  }
  spawnBirb(tree) {
    const birb = new Birb(
      this.landscape.world.texLoader,
      this,
      new Vector3(-2, 0, 0), // offscreen
      this.landscape.color,
      (brb) => {
        brb.animator.setFlipX(randPick(true, false));
        brb.sprite.position.copy(brb.restPos);
        brb.prevPosition.copy(brb.restPos);
        brb.target.copy(brb.restPos);
        brb.baseX = brb.sprite.position.x;
        this.landscape.world.scene.add(brb.sprite);
      },
    );

    birb.restOnTree(tree, true);
    this.birbs.push(birb);
    return birb;
  }
  update(dt) {
    for (const birb of this.birbs) {
      birb.update(dt);
    }

    if (this.reached.size > this.saturation * this.birbs.length) {
      this.reached.clear();
      this.target.set(
        rand(-1 + this.radius, 1 - this.radius),
        rand(-1 + this.radius + this.high, 1 - this.radius),
        this.landscape.sandbox.bounds.z[0],
      );
      this.baseX = this.target.x;
      this.birbs.forEach((birb) => birb.setTarget());
    }
  }
}
