import { Vector3 } from "three";
import { randInt } from "three/src/math/MathUtils";
import { Birb } from "./birb.sprite";
import { randPick } from "./graphics";

export class Flock {
  offset = {
    x: [-1, 1],
    y: [-1, 1],
  };
  birbs = [];

  constructor(landscape, noOfBirbs, tree) {
    this.landscape = landscape;
    this.sandbox = landscape.sandbox;
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
        this.landscape.world.scene.add(brb.sprite);
        brb.animator.setFlipX(randPick(true, false));
      },
    );
    const spawnBranchIndices = tree.upperBranchIndices;
    const spawnBranchIdx = spawnBranchIndices[randInt(0, spawnBranchIndices.length - 1)];
    birb.rest(tree, tree.branches[spawnBranchIdx]);
    this.birbs.push(birb);
    return birb;
  }
  update(dt) {
    for (const birb of this.birbs) {
      birb.update(dt);
    }
  }
}
