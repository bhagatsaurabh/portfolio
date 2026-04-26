import { denorm, norm } from "@/utils";
import { Color, DirectionalLight, PointLight, PointLightHelper, Vector3 } from "three";
import MeshStandardNodeMaterial from "three/src/materials/nodes/MeshStandardNodeMaterial";
import { degToRad } from "three/src/math/MathUtils";
import { lights } from "three/src/nodes/TSL";

export class Windmill {
  mesh = null;
  material = null;
  propMesh = null;
  baseScale = 0.08;
  maxAngle = degToRad(17.5);
  lights = {
    shadowCast: null,
    night: [],
  };
  lightIntensity = {
    shadowCast: [0.5, 1],
    night: [0, 0.5],
  };
  angularVel = 0;
  baseX = 0;
  normZ = 0;
  normX = 0;

  constructor(landscape, pos, onReady) {
    this.landscape = landscape;
    this.sandbox = landscape.sandbox;
    this.onReady = onReady;
    this.setup(pos);
  }

  setup(pos) {
    this.lights.shadowCast = new DirectionalLight(
      0xffffff,
      denorm(this.landscape.light, ...this.lightIntensity.shadowCast),
    );

    this.landscape.world.gltfLoader.load(
      `${import.meta.env.VITE_SB_CDN_URL}/models/prop-windmill.glb`,
      (gltf) => this.onLoad(pos, gltf),
      () => {},
      (error) => console.error("Windmill: Loader error", error),
    );

    const [nearZ, farZ] = this.landscape.sandbox.bounds.z;
    this.normZ = norm(pos.z, nearZ, farZ);
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

    this.setupShadowLight();
    this.setupNightLights();

    this.material = new MeshStandardNodeMaterial({
      color: 0xbcbcbc,
      lightsNode: lights([
        this.landscape.lights.ambient,
        this.lights.shadowCast,
        ...this.lights.night,
      ]),
    });
    this.mesh.material = this.material;
    this.propMesh.material = this.material;

    this.onReady(windmill);
  }
  setupShadowLight() {
    const light = this.lights.shadowCast;
    light.position.z += 15;
    light.position.y += 15;
    light.position.x -= 8;
    light.target = this.mesh;
    light.castShadow = true;
    light.shadow.camera.left = -0.4;
    light.shadow.camera.right = 0.4;
    light.shadow.camera.top = 0.4;
    light.shadow.camera.bottom = -0.1;
    light.shadow.camera.near = 0.6;
    light.shadow.camera.far = 1.15;
    light.shadow.mapSize.set(256, 256);
    this.landscape.world.scene.add(light, light.target);
    this.mesh.add(light);
  }
  setupNightLights() {
    this.lights.night.push(
      new PointLight(
        0xffffc5,
        denorm(this.landscape.light, ...this.lightIntensity.night),
        0.175,
        0.75,
      ),
    );

    const light = this.lights.night[0];
    light.position.z += 2.5;
    light.position.y += 0.5;
    light.position.x += -0.2;
    this.landscape.world.scene.add(light);
    this.mesh.add(light);
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
  resize() {
    const left = this.landscape.sandbox.bounds.leftNear
      .clone()
      .lerp(this.landscape.sandbox.bounds.leftFar, Math.abs(this.normZ));
    const right = this.landscape.sandbox.bounds.rightNear
      .clone()
      .lerp(this.landscape.sandbox.bounds.rightFar, Math.abs(this.normZ));

    this.baseX = denorm(this.normX, left.x, right.x);
  }
}
