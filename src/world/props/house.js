import { PointLight, PointLightHelper, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils";
import MeshStandardNodeMaterial from "three/src/materials/nodes/MeshStandardNodeMaterial";
import { lights } from "three/src/nodes/lighting/LightsNode";
import { denorm } from "@/utils";

export class House {
  mesh = null;
  material = null;
  baseScale = 0.00016;
  maxAngle = degToRad(17.5);
  lights = {
    night: [],
  };
  lightIntensity = {
    night: [0, 1],
  };

  constructor(landscape, pos, onReady) {
    this.landscape = landscape;
    this.sandbox = landscape.sandbox;
    this.onReady = onReady;
    this.setup(pos);
  }

  setup(pos) {
    this.landscape.world.gltfLoader.load(
      `${import.meta.env.VITE_SB_CDN_URL}/models/prop-house.glb`,
      (gltf) => this.onLoad(pos, gltf),
      () => {},
      (error) => console.error("House: Loader error", error),
    );
  }
  onLoad(pos, gltf) {
    this.upAxis = new Vector3(0, 1, 0);

    const house = gltf.scene.children[0];
    house.position.copy(pos);
    house.scale.setScalar(this.baseScale);
    this.mesh = house;

    this.mesh.geometry = mergeVertices(this.mesh.geometry, 1);
    this.mesh.geometry.computeVertexNormals();

    house.rotateOnAxis(new Vector3(0, 1, 0), degToRad(135));
    this.baseQuat = this.mesh.quaternion.clone();

    this.setupNightLights();

    this.material = new MeshStandardNodeMaterial({
      color: 0xdddddd,
      lightsNode: lights([
        this.landscape.lights.ambient,
        this.landscape.lights.sun,
        ...this.lights.night,
      ]),
    });
    this.mesh.material = this.material;

    this.onReady(house);
  }
  setupNightLights() {
    this.lights.night.push(
      new PointLight(
        0xffffc5,
        denorm(this.landscape.light, ...this.lightIntensity.night),
        0.25,
        0.3,
      ),
    );

    const light = this.lights.night[0];
    light.position.z -= 500;
    light.position.y += 1250;
    light.position.x -= 650;
    this.landscape.world.scene.add(light);
    this.mesh.add(light);
    // const helper = new PointLightHelper(light, 500, 0xffffff);
    // this.landscape.world.scene.add(helper);
  }
  update() {
    if (!this.mesh) return;

    const ndcX = this.mesh.position.clone().project(this.landscape.world.orthoCam).x;
    const targetAngle = ndcX * this.maxAngle;

    this.mesh.quaternion.copy(this.baseQuat);
    this.mesh.rotateOnAxis(this.upAxis, targetAngle);
  }
}
