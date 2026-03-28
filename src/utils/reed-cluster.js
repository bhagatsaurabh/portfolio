import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";

import MeshBasicNodeMaterial from "three/src/materials/nodes/MeshBasicNodeMaterial";
import {
  positionLocal,
  attribute,
  uniform,
  sin,
  vec3,
  add,
  mul,
  pow,
  instanceIndex,
} from "three/src/nodes/TSL";

import { rand } from "./graphics";

export class ReedCluster {
  params = {};
  time = 0;
  timeUniform = null;
  windUniform = null;
  mesh = null;
  count = 0;
  geometry = null;
  // baseScale = 0.25;
  baseScale = 0.5;
  material = null;

  get color() {
    return this.material.color.getHexString();
  }
  set color(hex) {
    this.material.color = new Color(hex);
  }

  constructor(landscape, pos, count = 15, color, options = {}) {
    this.landscape = landscape;
    this.count = count;

    this.params = {
      segments: 6,
      height: 1.2,
      width: 0.015,
      clusterSpread: 0.5,
      windScale: 0.25,
      stiffness: 2.0,
      ...options,
    };

    this.time = 0;

    this.setup(pos, color);
  }

  setup(pos, color) {
    this.geometry = this.buildGeometry();
    this.material = this.buildMaterial(color);

    this.mesh = new InstancedMesh(this.geometry, this.material, this.count);
    const matrix = new Matrix4();

    for (let i = 0; i < this.count; i++) {
      const offsetX = (Math.random() - 0.5) * this.params.clusterSpread * this.baseScale;
      const scale = rand(0.8, 1.3) * this.baseScale;
      matrix.compose(
        new Vector3(offsetX, 0, 0),
        new Quaternion(),
        new Vector3(scale, scale, scale),
      );
      this.mesh.setMatrixAt(i, matrix);
    }

    // this.mesh.frustumCulled = false;
    this.mesh.position.copy(pos);
    if (this.landscape.props.originTree) {
      this.mesh.position.y = this.landscape.props.originTree.mesh.position.y;
    }
    this.mesh.scale.setScalar(this.baseScale);
    this.landscape.world.scene.add(this.mesh);
  }
  buildGeometry() {
    const { segments, height, width } = this.params;

    const verts = [];
    const indices = [];
    const heightFactors = [];

    for (let i = 0; i <= segments; i++) {
      const y = (i / segments) * height;
      const h = i / segments;
      const taper = 1 - h;
      const shaped = Math.pow(taper, 1.5);
      const minWidth = width * 0.1;
      const w = minWidth + (width - minWidth) * shaped;

      verts.push(-w, y, 0);
      heightFactors.push(h);
      verts.push(w, y, 0);
      heightFactors.push(h);
    }

    for (let i = 0; i < segments; i++) {
      const base = i * 2;

      indices.push(base, base + 1, base + 2);
      indices.push(base + 2, base + 1, base + 3);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(verts), 3));
    geometry.setAttribute("heightFactor", new BufferAttribute(new Float32Array(heightFactors), 1));
    geometry.setIndex(indices);

    return geometry;
  }
  buildMaterial(color) {
    const material = new MeshBasicNodeMaterial({
      color: new Color(color),
      side: DoubleSide,
      transparent: false,
      lights: false,
    });

    const h = attribute("heightFactor");
    const time = uniform(0);
    const wind = uniform(0);

    this.timeUniform = time;
    this.windUniform = wind;

    // const phase = mul(attribute("instanceIndex"), 1.37);
    const phase = instanceIndex.mul(1.37);
    const sway = sin(add(add(time.mul(2.0), phase), positionLocal.x.mul(0.5)));
    const bend = mul(sway, mul(wind, pow(h, 2.0)));
    const micro = mul(sin(add(time.mul(8.0), phase.mul(3.0))), mul(0.05, h));
    const finalBend = add(bend, micro);
    material.positionNode = positionLocal.add(vec3(finalBend.mul(this.params.windScale), 0, 0));

    return material;
  }

  update(dt) {
    this.time += dt;

    const wind = -this.landscape.wind.x;

    this.timeUniform.value = this.time;
    this.windUniform.value = wind;
  }
}
