import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3,
} from "three";
import { degToRad } from "three/src/math/MathUtils";

import { biasRand, rand } from "./graphics";

export class Tree {
  params = {
    wind: { sensitivity: 1 },
    physics: {
      windInfluence: 3,
      stiffnessBase: 4,
      stiffnessScale: 6,
      damping: 0.8,
      fatigueMin: 0.6,
      fatigueMax: 1.0,
      equilibrium: 0.6,
      energyFloor: 0.15,
      energyPush: 0.1,
    },
    limits: { maxBend: 1.2, softClampForce: 10 },
    flutter: {
      ampBase: 0.8,
      ampWindScale: 1.2,
      freqBase: 8,
      freqDepthScale: 20,
      freqWindScale: 10,
      depthExponent: 2.5, // non-dynamic
      microScale: 0.3,
      freqScale: [0.1, 0.3],
    },
    visual: { swayScale: 0.1 },
    generation: {
      initialLength: 1.4,
      initialWidth: 2.5,
      branchLengthThreshold: 0.2,
      branchLengthFactor: [0.75, 0.85],
      branchWidthFactor: 0.8,
      zBranchRotation: [5, 35],
      xBranchRotation: 45,
      yBranchRotation: 45,
      lod: 1,
    },
    spread: {
      anomalyChance: [0.08, 0.3],
    },
  };
  at = 0; // accumulated
  root = null;
  trunk = null;
  branches = [];
  maxDepth = 0;
  maxCrownReach = 0;
  widthScaleFactor = 0.0075; // constant for now, controls default line thickness
  sandbox = null;
  perspectiveScale = 1;
  minWidth = 0.0015;

  get color() {
    return this.material.color.getHexString();
  }
  set color(hex) {
    this.material.color = new Color(hex);
  }

  constructor(sandbox, pos, instances, color, config = {}) {
    this.sandbox = sandbox;
    Object.assign(this.params.generation, config);
    this.setup(pos, color);
    this.setupInstances(instances);
  }

  setup(pos, color) {
    const { initialLength, initialWidth, branchLengthFactor, _lod } = this.params.generation;

    this.root = {
      length: initialLength,
      children: [],
      position: { x: 0, y: -initialLength, z: 0 },
      worldStart: { x: 0, y: 0, z: 0 },
      worldEnd: { x: 0, y: initialLength, z: 0 },
      totalAngle: 0,
      baseRot: { x: 0, y: 0, z: 0 },
      worldDir: { x: 0, y: 1, z: 0 },
    };

    this.growBranch(initialWidth, 0, this.root);
    this.trunk = this.branches[0];
    this.maxDepth = this.computeDepth(this.trunk);
    this.setProps();
    this.spreadBranch();
    this.maxCrownReach = this.computeCrownReach(branchLengthFactor[1]);

    const dist = pos.distanceTo(this.sandbox.world.camera.position);
    this.perspectiveScale = dist * 0.07094;

    this.geometry = this.buildGeometry();
    this.material = new MeshBasicMaterial({
      color: new Color(color),
      transparent: true,
      side: DoubleSide,
    });
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.copy(pos);
  }
  setupInstances(count) {
    const instanced = new InstancedMesh(this.geometry, this.material, count);

    const matrix = new Matrix4();
    for (let i = 0; i < count; i++) {
      const position = this.sandbox.getRandomPoint();
      const scale = rand(0.6, 1.4);
      matrix.compose(
        new Vector3(position.x, this.mesh.position.y, this.mesh.position.z),
        new Quaternion(),
        new Vector3(scale, scale, scale),
      );
      instanced.setMatrixAt(i, matrix);
    }
    this.sandbox.world.scene.add(instanced);
  }
  growBranch(width, depth, parent) {
    const p = this.params.generation;

    const branchLength = parent.length * rand(...p.branchLengthFactor);
    const parentEnd = parent.worldEnd || { x: 0, y: 0, z: 0 };
    const start = { ...parentEnd };
    const end = { ...parentEnd };
    end.y += branchLength;

    const branch = {
      start,
      end,
      length: branchLength,
      width,
      depth,
      children: [],
      parent,
      worldStart: { ...start },
      worldEnd: { ...end },
      worldDir: { x: 0, y: 1, z: 0 },
      baseRot: { x: 0, y: 0, z: 0 },
    };
    if (!parent.children) parent.children = [];

    parent.children.push(branch);
    this.branches.push(branch);

    if (branchLength < p.initialLength * p.branchLengthThreshold) return;

    // always binary for now
    this.growBranch(width * p.branchWidthFactor, depth + 1, branch);
    this.growBranch(width * p.branchWidthFactor, depth + 1, branch);
  }
  buildGeometry() {
    const branchCount = this.branches.length;
    const positions = new Float32Array(branchCount * 4 * 3);
    const indices = new Uint16Array(branchCount * 6);
    let v = 0;
    let i = 0;
    for (let s = 0; s < this.branches.length; s++) {
      this.branches[s].width *= this.widthScaleFactor;
      const data = this.computeQuad(s, this.branches[s].width);
      positions.set(data, v);
      const base = s * 4;
      indices.set([base, base + 1, base + 2, base + 2, base + 1, base + 3], i);
      v += 12;
      i += 6;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setIndex(new BufferAttribute(indices, 1));
    return geometry;
  }
  computeQuad(branchIdx, w) {
    const branch = this.branches[branchIdx];
    const { worldStart: start, worldEnd: end } = branch;
    // root offset
    const { x: ox, y: oy, z: oz } = this.root.position;
    const sx = start.x + ox;
    const sy = start.y + oy;
    const sz = start.z + oz;
    const ex = end.x + ox;
    const ey = end.y + oy;
    const ez = end.z + oz;
    // quad
    const dx = ex - sx;
    const dy = ey - sy;
    let len = dx * dx + dy * dy;
    len = len > 0 ? Math.sqrt(len) : 1;
    const nx = -dy / len;
    const ny = dx / len;
    w *= this.perspectiveScale;
    const ax = sx + nx * w;
    const ay = sy + ny * w;
    const bx = sx - nx * w;
    const by = sy - ny * w;
    const cx = ex + nx * w;
    const cy = ey + ny * w;
    const dx2 = ex - nx * w;
    const dy2 = ey - ny * w;
    return [ax, ay, sz, bx, by, sz, cx, cy, ez, dx2, dy2, ez];
  }
  computeDepth(root) {
    let max = 0;
    const stack = [{ branch: root, depth: 0 }];
    while (stack.length) {
      const { branch, depth } = stack.pop();
      max = Math.max(max, depth);
      if (branch.children) {
        for (const c of branch.children) {
          stack.push({ branch: c, depth: depth + 1 });
        }
      }
    }
    return max;
  }
  computeCrownReach(maxBranchLengthFactor) {
    let maxCrownReach = this.params.generation.initialLength;
    for (let i = 0; i < this.maxDepth; i++) {
      this.maxCrownReach += maxCrownReach;
      maxCrownReach *= maxBranchLengthFactor;
    }
    return this.maxCrownReach;
  }
  setProps() {
    const depthExponent = this.params.flutter.depthExponent;
    const [minFS, maxFS] = this.params.flutter.freqScale;

    for (let i = 0; i < this.branches.length; i++) {
      const branch = this.branches[i];
      const normDepth = branch.depth / (this.maxDepth - 1);

      branch.props = {
        normDepth,
        seed: i,
        dyn: { angle: 0, velocity: 0 },
        kWindBase: 0.5 + normDepth * 0.5,
        leafFactor: Math.pow(normDepth, depthExponent),
        flutterScale: rand(minFS, maxFS),
      };
    }
  }
  spreadBranch() {
    for (let i = 0; i < this.branches.length; i++) {
      const branch = this.branches[i];
      this.spread(branch.children[0], -1);
      this.spread(branch.children[1], 1);
    }
  }
  spread(branch, direction) {
    if (!branch) return;

    const { xBranchRotation, yBranchRotation, zBranchRotation } = this.params.generation;
    const { normDepth } = branch.props;

    const maxXRot = normDepth * xBranchRotation;
    const maxYRot = normDepth * yBranchRotation;
    let xRot = degToRad(rand(-maxXRot, maxXRot));
    let yRot = degToRad(rand(-maxYRot, maxYRot));

    const [minZRot, maxZRot] = zBranchRotation;
    let zRot = degToRad(biasRand(minZRot, maxZRot, 1 - normDepth, "pow", 1) * direction);

    const [minAC, maxAC] = this.params.spread.anomalyChance;
    const anomalyChance = biasRand(minAC, maxAC, 1 - normDepth, "sig");

    // need to parameterize this....
    if (rand(0, 1) < anomalyChance) {
      const type = Math.floor(rand(0, 3));
      if (type === 0) {
        zRot *= rand(1.8, 2.5);
      } else if (type === 1) {
        zRot *= rand(0.3, 0.6);
      } else {
        xRot *= rand(1.1, 1.4);
        yRot *= rand(1.1, 1.4);
      }
    }

    branch.baseRot = {
      x: xRot,
      y: yRot,
      z: zRot,
    };
  }
  update(dt) {
    this.at += dt;

    const dist = this.mesh.position.distanceTo(this.sandbox.world.camera.position);
    this.perspectiveScale = dist * 0.07094;

    this.applyWind(this.sandbox.wind.x, dt);
    let v = 0;
    for (let i = 0; i < this.branches.length; i++) {
      this.updateWorldTransforms(i);
      v = this.updateGeometry(i, v);
    }
    this.geometry.attributes.position.needsUpdate = true;
  }
  applyWind(wind, dt) {
    // physics... 😵🔫
    const p = this.params;
    const effectiveWind = wind * p.wind.sensitivity;
    const windStrength = Math.abs(effectiveWind);
    const maxBend = p.limits.maxBend;
    const fp = p.flutter;
    const {
      windInfluence,
      damping,
      energyFloor,
      energyPush,
      equilibrium,
      fatigueMin,
      fatigueMax,
      stiffnessBase,
      stiffnessScale,
    } = p.physics;
    const t = this.at;

    const kWindEffectiveInfluence = windInfluence;
    const fatigueRange = fatigueMax - fatigueMin;
    const equilibriumWind = wind * equilibrium;
    const scaledSoftClampForce = p.limits.softClampForce * dt;
    const effectiveEnergy = energyFloor * energyPush;
    const flutterBaseAmp = fp.ampBase + windStrength * fp.ampWindScale;
    const flutterBaseFreq = windStrength * fp.freqWindScale + fp.freqBase;
    const baseMicro = windStrength * fp.microScale;
    const windSign = Math.sign(wind);

    for (let i = 0; i < this.branches.length; i++) {
      const node = this.branches[i];
      const { normDepth, dyn, seed, kWindBase, leafFactor, flutterScale } = node.props;

      // wind's influence and counter force
      const kWind = kWindBase * kWindEffectiveInfluence;
      const forceWind = kWind * wind * 1.2;
      const kStiff = stiffnessBase + (1 - normDepth) * stiffnessScale;
      const fatigue = fatigueMin + fatigueRange / (1 + Math.abs(dyn.angle));
      const forceRestore = -kStiff * fatigue * (dyn.angle - equilibriumWind);
      const forceDamp = -damping * dyn.velocity;
      const turbulence = Math.sin(t * 3 + seed) * 0.6 + Math.sin(t * 1.7 + seed * 2) * 0.4;
      const accel = forceWind + forceRestore + forceDamp + turbulence;
      dyn.velocity += accel * dt;
      dyn.angle += dyn.velocity * dt;
      // soft clamping
      if (Math.abs(dyn.angle) > maxBend) {
        const excess = dyn.angle - Math.sign(dyn.angle) * maxBend;
        dyn.velocity -= excess * scaledSoftClampForce;
      }
      // energy
      if (Math.abs(dyn.velocity) < energyFloor) {
        dyn.velocity += windSign * effectiveEnergy;
      }
      // fluttering
      const flutterAmp = flutterBaseAmp * leafFactor;
      const flutterFreq = flutterBaseFreq + leafFactor * fp.freqDepthScale;
      const baseFreq = this.at * flutterFreq;
      const f1 = Math.sin(baseFreq + seed);
      const f2 = Math.sin(baseFreq * 2.1 + seed * 2);
      let flutterSignal = f1 * 0.7 + f2 * 0.3;
      const micro = baseMicro * Math.sin(this.at * 20 + seed * 13.37) * leafFactor;
      const finalFlutter = flutterSignal * flutterAmp + micro;
      // final rotation
      node.angle = (dyn.angle + finalFlutter * normDepth * flutterScale) * p.visual.swayScale;
    }
  }
  updateWorldTransforms(branchIdx) {
    const branch = this.branches[branchIdx];
    const parent = branch.parent;
    const start = parent.worldEnd;

    branch.worldStart.x = start.x;
    branch.worldStart.y = start.y;
    branch.worldStart.z = start.z;

    let dir = { ...branch.parent.worldDir }; // start from parent
    const rot = branch.baseRot;

    let cy = Math.cos(rot.x),
      sy = Math.sin(rot.x);
    dir = {
      x: dir.x,
      y: dir.y * cy - dir.z * sy,
      z: dir.y * sy + dir.z * cy,
    };
    let cx = Math.cos(rot.y),
      sx = Math.sin(rot.y);
    dir = {
      x: dir.x * cx + dir.z * sx,
      y: dir.y,
      z: -dir.x * sx + dir.z * cx,
    };
    let cz = Math.cos(rot.z),
      sz = Math.sin(rot.z);
    dir = {
      x: dir.x * cz - dir.y * sz,
      y: dir.x * sz + dir.y * cz,
      z: dir.z,
    };

    const len = Math.hypot(dir.x, dir.y, dir.z) || 1;
    dir = { x: dir.x / len, y: dir.y / len, z: dir.z / len };
    branch.worldDir = dir;

    let dx = dir.x * branch.length;
    let dy = dir.y * branch.length;
    let dz = dir.z * branch.length;

    const parentAngle = branch.parent.totalAngle || 0;
    const totalAngle = parentAngle * 0.7 + (branch.angle || 0) * 0.8;
    branch.totalAngle = totalAngle;
    const cos = Math.cos(totalAngle);
    const sin = Math.sin(totalAngle);

    // rotate around Z only (wind)
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    const rz = dz;

    branch.worldEnd.x = start.x + rx;
    branch.worldEnd.y = start.y + ry;
    branch.worldEnd.z = start.z + rz;
  }
  updateGeometry(branchIdx, v) {
    const positions = this.geometry.attributes.position.array;

    const data = this.computeQuad(branchIdx, this.branches[branchIdx].width);

    positions[v++] = data[0];
    positions[v++] = data[1];
    positions[v++] = data[2];
    positions[v++] = data[3];
    positions[v++] = data[4];
    positions[v++] = data[5];
    positions[v++] = data[6];
    positions[v++] = data[7];
    positions[v++] = data[8];
    positions[v++] = data[9];
    positions[v++] = data[10];
    positions[v++] = data[11];

    return v;
  }
  gust() {}
  resize() {}
}
