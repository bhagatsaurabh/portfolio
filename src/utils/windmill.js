import { DirectionalLight, Vector3 } from "three";
import MeshStandardNodeMaterial from "three/src/materials/nodes/MeshStandardNodeMaterial";
import { degToRad } from "three/src/math/MathUtils";
import { lights } from "three/src/nodes/TSL";

export class Windmill {
  mesh = null;
  propMesh = null;
  baseScale = 0.08;
  maxAngle = degToRad(17.5);
  light = null;
  angularVel = 0;

  constructor(landscape, pos, onReady) {
    this.landscape = landscape;
    this.sandbox = landscape.sandbox;
    this.onReady = onReady;
    this.setup(pos);
  }

  setup(pos) {
    this.light = new DirectionalLight(0xffffff, 1);

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
    this.propMesh = this.mesh.children[0];

    this.mesh.receiveShadow = true;
    this.propMesh.castShadow = true;

    windmill.rotateOnAxis(new Vector3(0, 1, 0), degToRad(-35));
    this.baseQuat = this.mesh.quaternion.clone();

    this.setupLight();

    const material = new MeshStandardNodeMaterial({
      color: 0xbcbcbc,
      lightsNode: lights([this.landscape.lights.ambient, this.light]),
    });
    this.mesh.material = material;
    this.propMesh.material = material;

    this.onReady(windmill);
  }
  setupLight() {
    this.light.position.z += 15;
    this.light.position.y += 8;
    this.light.position.x -= 8;
    this.light.target = this.mesh;
    this.light.castShadow = true;
    this.light.shadow.camera.left = -0.4;
    this.light.shadow.camera.right = 0.4;
    this.light.shadow.camera.top = 0.4;
    this.light.shadow.camera.bottom = -0.1;
    this.light.shadow.camera.near = 0.6;
    this.light.shadow.camera.far = 1.15;
    this.light.shadow.mapSize.set(256, 256);
    this.landscape.world.scene.add(this.light, this.light.target);
    this.mesh.add(this.light);
  }
  update(dt) {
    if (!this.mesh) return;

    const ndcX = this.mesh.position.clone().project(this.landscape.world.orthoCam).x;
    const targetAngle = ndcX * this.maxAngle;

    this.mesh.quaternion.copy(this.baseQuat);
    this.mesh.rotateOnAxis(this.upAxis, targetAngle);

    const targetVelocity = this.landscape.wind.x * 2;
    const responsiveness = 0.85;
    this.angularVel += (targetVelocity - this.angularVel) * (1 - Math.exp(-responsiveness * dt));
    this.propMesh.rotation.z += this.angularVel * dt;
  }
}
