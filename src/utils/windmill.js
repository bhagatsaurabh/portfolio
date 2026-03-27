import { Color, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils";

export class Windmill {
  mesh = null;
  baseScale = 0.08;
  maxAngle = degToRad(17.5);

  constructor(landscape, pos, onReady) {
    this.landscape = landscape;
    this.sandbox = landscape.sandbox;
    this.onReady = onReady;
    this.setup(pos);
  }

  setup(pos) {
    this.landscape.world.gltfLoader.load(
      `${import.meta.env.VITE_SB_CDN_URL}/models/prop-windmill.glb`,
      (gltf) => this.onLoad(pos, gltf),
      () => {},
      (error) => console.error("Windmill: Loader error", error),
    );
  }
  onLoad(pos, gltf) {
    this.upAxis = new Vector3(0, 1, 0);

    const windmill = gltf.scene.children[0];
    windmill.position.copy(pos);
    windmill.scale.setScalar(this.baseScale);
    this.mesh = windmill;

    this.mesh.material.color = new Color(0xbcbcbc);

    this.mesh.geometry.computeVertexNormals();

    windmill.rotateOnAxis(new Vector3(1, 0, 0), degToRad(180));
    windmill.rotateOnAxis(new Vector3(0, 1, 0), degToRad(180 - 35));
    this.baseQuat = this.mesh.quaternion.clone();
    this.onReady(windmill);
  }
  update() {
    if (!this.mesh) return;

    const ndcX = this.mesh.position.clone().project(this.landscape.world.orthoCam).x;
    const targetAngle = ndcX * this.maxAngle;

    this.mesh.quaternion.copy(this.baseQuat);
    this.mesh.rotateOnAxis(this.upAxis, targetAngle);
  }
}
