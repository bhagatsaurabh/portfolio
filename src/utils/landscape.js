import { Tree } from "./tree";
import { TreeNew } from "./tree-new";

export class Landscape {
  originTree = null;
  trees = [];

  constructor(world) {
    this.world = world;
    this.setup();
  }

  setup() {
    this.originTree = new TreeNew(this.world, {
      color: parseInt(
        getComputedStyle(document.querySelector("#App"))
          .getPropertyValue("--treeColor")
          .replace("#", ""),
        16,
      ),
      minBranchLengthFactor: 0.75,
      maxBranchLengthFactor: 0.85,
      branchWidthFactor: 0.8,
      minBranchRotation: 5,
      maxBranchRotation: 35,
    });
    this.trees.push(this.originTree);
  }
  update(dt) {
    for (const tree of this.trees) {
      tree.update(dt);
    }
  }
  sync() {}
}
