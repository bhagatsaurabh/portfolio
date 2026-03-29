import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";

import MeshBasicNodeMaterial from "three/src/materials/nodes/MeshBasicNodeMaterial";
import { positionLocal, attribute, uniform, sin, vec3, pow, cos, abs } from "three/src/nodes/TSL";

import { rand } from "./graphics";

export class ReedCluster {
  params = {};
  at = 0;
  timeUniform = null;
  windUniform = null;
  waveUniform = null;
  mesh = null;
  count = 0;
  geometry = null;
  baseScale = 0.25;
  material = null;
  instances = [];
  instanceAngles = [];
  freqScale = 0.5;
  ampScale = 0.5;
  swayScale = 2;
  normX = 0;
  waveSpeed = 3;
  waveScale = 0.05;
  waveAmp = 2;
  responsiveness = 8;
  flutterAmp = 0.03;

  get color() {
    return this.material.color.getHexString();
  }
  set color(hex) {
    this.material.color = new Color(hex);
  }

  constructor(landscape, pos, baseScale, count = 15, color, options = {}) {
    this.landscape = landscape;
    this.count = count;
    this.baseScale = baseScale;
    this.at = 0;
    this.params = {
      segments: 6,
      height: 1.2,
      width: 0.015,
      clusterSpread: 0.5,
      windScale: 0.25,
      stiffness: 2.0,
      ...options,
    };

    this.setup(pos, color);
  }

  setup(pos, color) {
    this.geometry = this.buildGeometry();
    this.material = this.buildMaterial(color);

    this.mesh = new InstancedMesh(this.geometry, this.material, this.count);
    const matrix = new Matrix4();

    for (let i = 0; i < this.count; i++) {
      const offsetX = (Math.random() - 0.5) * this.params.clusterSpread * this.baseScale;
      const scale = rand(0.5, 1.5) * this.baseScale;
      
      const tilt = rand(-0.2, 0.2);
      const quat = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), tilt);

      matrix.compose(new Vector3(offsetX, 0, 0), quat, new Vector3(scale, scale, scale));
      this.mesh.setMatrixAt(i, matrix);

      this.instances.push({
        angle: 0,
        velocity: 0,
        basePhase: rand(0, 1) * Math.PI * 2,
        stiffness: rand(1, 2),
        damping: rand(0.5, 0.6),
        windInfluence: rand(1.1, 1.5),
      });
    }

    this.mesh.position.copy(pos);
    this.mesh.scale.setScalar(this.baseScale);
    this.landscape.world.scene.add(this.mesh);

    const minX = this.landscape.sandbox.bounds.leftNear.x;
    const maxX = this.landscape.sandbox.bounds.rightNear.x;
    this.normX = (this.mesh.position.x - minX) / (maxX - minX);
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

    const flutterPhase = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      flutterPhase[i] = Math.random() * Math.PI * 2;
    }
    geometry.setAttribute("flutterPhase", new InstancedBufferAttribute(flutterPhase, 1));

    const angles = new Float32Array(this.count);
    geometry.setAttribute("instanceAngle", new InstancedBufferAttribute(angles, 1));
    this.instanceAngles = angles;

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
    const instanceAngle = attribute("instanceAngle");
    const flutterPhase = attribute("flutterPhase");
    const time = uniform(0);
    const wind = uniform(0);
    const wave = uniform(0);

    this.timeUniform = time;
    this.windUniform = wind;
    this.waveUniform = wave;

    const tip = pow(h, 2.5);
    const windScale = 2;
    const baseFlutter = 0.15;
    const windAmp = abs(wind);
    const flutterStrength = windAmp.mul(windScale).add(baseFlutter);
    const flutter = sin(time.mul(25).add(flutterPhase))
      .mul(0.6)
      .add(sin(time.mul(40).add(flutterPhase.mul(1.7))).mul(0.4))
      .mul(this.flutterAmp)
      .mul(tip)
      .mul(flutterStrength);

    const theta = instanceAngle.mul(0.15).mul(pow(h, 1.2)).add(flutter);
    const s = sin(theta);
    const c = cos(theta);
    const x = positionLocal.x;
    const y = positionLocal.y;
    const bentX = x.mul(c).add(y.mul(s));
    const bentY = y.mul(c).sub(x.mul(s));
    material.positionNode = vec3(bentX, bentY, positionLocal.z);

    return material;
  }
  update(dt) {
    this.at += dt;

    const rawWind = this.landscape.wind.x;
    const amp = Math.abs(rawWind);
    const dir = Math.sign(rawWind) || 1;

    const delay = this.normX * (1 / this.waveScale) * dir;
    const x = delay;
    const w1 = Math.sin(this.at * this.waveSpeed - x);
    const w2 = Math.sin(this.at * this.waveSpeed * 0.6 - x * 1.3);
    const w3 = Math.sin(this.at * this.waveSpeed * 1.8 - x * 0.7);
    const envelope = Math.sin(this.at * 0.3 - x * 0.2) * 0.5 + 1;
    const wave = (w1 * 0.6 + w2 * 0.3 + w3 * 0.1 + 1) * envelope;
    const wind = (amp + wave * Math.pow(this.waveAmp, amp)) * dir;

    for (let i = 0; i < this.instances.length; i++) {
      const inst = this.instances[i];

      const t = this.at - delay;
      const base =
        Math.sin(t * 1.8 + inst.basePhase) * 0.12 +
        Math.sin(t * 3.7 + inst.basePhase * 1.3) * 0.08 +
        Math.sin(t * 0.7 + inst.basePhase * 2.1) * 0.1;
      const target = base * this.swayScale + wind * inst.windInfluence;

      const force = inst.stiffness * (target - inst.angle) - inst.damping * inst.velocity;
      inst.velocity += force * dt * this.responsiveness;
      inst.angle += inst.velocity * dt;

      this.instanceAngles[i] = inst.angle;
    }

    this.timeUniform.value = this.at;
    this.windUniform.value = wind;
    this.waveUniform.value = wave;
    this.geometry.attributes.instanceAngle.needsUpdate = true;
  }
}
