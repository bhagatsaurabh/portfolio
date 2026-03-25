import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Euler,
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
      damping: 1.5,
      fatigueMin: 0.6,
      fatigueMax: 1.0,
      equilibrium: 0.6,
      energyFloor: 0.15,
      energyPush: 0.1,
    },
    limits: { maxBend: 1.2, softClampForce: 10 },
    flutter: {
      ampBase: 0.4,
      freqBase: 6,
      ampWindScale: 1.2,
      freqWindScale: 8,
      freqDepthScale: 3.5,
      energyRise: 15, // reaction time to energy increase
      energyDecay: 1.5, // reaction time to energy decrease
      depthExponent: 2.5, // non-dynamic
      microScale: 0.3,
      freqScale: 0.25,
    },
    visual: { swayScale: 0.2 },
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
      anomalyChance: {
        increase: [0.08, 0.3],
        decrease: [0.01, 0.02],
        widen: [0.08, 0.3],
      },
      anomalyScale: {
        increase: [1.2, 1.5],
        decrease: [0.3, 0.6],
        widen: [1.1, 1.25],
      },
    },
  };
  at = 0; // accumulated
  sandbox = null;
  root = null;
  trunk = null;
  branches = [];
  maxDepth = 0;
  maxCrownReach = 0;
  widthScaleFactor = 0.0075; // constant for now, controls default line thickness
  perspectiveScale = 1;
  minWidth = 0.0015;

  get color() {
    return this.material.color.getHexString();
  }
  set color(hex) {
    this.material.color = new Color(hex);
  }

  constructor(sandbox, pos, instances, color, options = {}) {
    this.sandbox = sandbox;
    for (const key in this.params) {
      this.params[key] = { ...this.params[key], ...(options[key] ?? {}) };
    }

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
      baseQuat: new Quaternion(),
      worldQuat: new Quaternion(),
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
      const scale = rand(0.8, 1.2);
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
      baseQuat: new Quaternion(),
      worldQuat: new Quaternion(),
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

    for (let i = 0; i < this.branches.length; i++) {
      const branch = this.branches[i];
      const normDepth = branch.depth / (this.maxDepth - 1);

      branch.props = {
        normDepth,
        seed: i,
        dyn: { angle: 0, velocity: 0 },
        kWindBase: 0.5 + normDepth * 0.5,
        leafFactor: Math.pow(normDepth, depthExponent),
        flutterScale: this.params.flutter.freqScale,
        flutterEnergy: 0,
        phaseOffset: 0,
        phase: 0,
        microPhase: 0,
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

    const {
      increase: incChance,
      decrease: decChance,
      widen: widChance,
    } = this.params.spread.anomalyChance;
    const {
      increase: incScale,
      decrease: decScale,
      widen: widScale,
    } = this.params.spread.anomalyScale;
    const incAC = biasRand(incChance[0], incChance[1], 1 - normDepth, "sig");
    const decAC = biasRand(decChance[0], decChance[1], 1 - normDepth, "sig");
    const widAC = biasRand(widChance[0], widChance[1], 1 - normDepth, "sig");

    // either increased anomaly chance of spreading or shrinking, can't be both
    if (rand(0, 1) < incAC) {
      zRot *= rand(incScale[0], incScale[1]);
    } else if (rand(0, 1) < decAC) {
      zRot *= rand(decScale[0], decScale[1]);
    }
    if (rand(0, 1) < widAC) {
      xRot *= rand(widScale[0], widScale[1]);
      yRot *= rand(widScale[0], widScale[1]);
    }

    const q = new Quaternion().setFromEuler(new Euler(xRot, yRot, zRot, "XYZ"));
    branch.baseQuat = q;
  }
  update(dt) {
    this.at += dt;

    const dist = this.mesh.position.distanceTo(this.sandbox.world.camera.position);
    this.perspectiveScale = dist * 0.07094;

    // for spatial variations
    const spatialWind =
      this.sandbox.wind.x + Math.sin(this.mesh.position.x * 0.1 + this.at * 0.5) * 0.2;
    this.applyWind(spatialWind, dt);
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
    const windSign = Math.sign(wind);

    for (let i = 0; i < this.branches.length; i++) {
      const branch = this.branches[i];
      const { normDepth, dyn, seed, kWindBase, leafFactor, flutterScale } = branch.props;

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
      const windTarget = windStrength;
      if (windTarget > branch.props.flutterEnergy) {
        branch.props.flutterEnergy +=
          (windTarget - branch.props.flutterEnergy) * Math.min(1, fp.energyRise * dt);
      } else {
        branch.props.flutterEnergy +=
          (windTarget - branch.props.flutterEnergy) * Math.min(1, fp.energyDecay * dt);
      }
      const energy = branch.props.flutterEnergy;
      const flutterFreq =
        fp.freqBase + energy * fp.freqWindScale + Math.pow(normDepth, 0.7) * fp.freqDepthScale;
      branch.props.phase += flutterFreq * dt;
      branch.props.phaseOffset += dt * 0.5;
      const phase = branch.props.phase + seed + branch.props.phaseOffset;
      const f1 = Math.sin(phase);
      const f2 = Math.sin(phase * 2.3 + seed * 1.7);
      const flutterSignal = f1 * 0.6 + f2 * 0.4;
      branch.props.microPhase += dt * 25;
      const micro = fp.microScale * leafFactor * Math.sin(branch.props.microPhase + seed * 13.37);
      const flutterAmp = (fp.ampBase + energy * fp.ampWindScale) * leafFactor;
      const finalFlutter = flutterSignal * flutterAmp + micro;
      // final rotation
      branch.angle = (dyn.angle + finalFlutter * flutterScale) * p.visual.swayScale;
    }
  }
  updateWorldTransforms(branchIdx) {
    const branch = this.branches[branchIdx];
    const parent = branch.parent;

    const start = parent.worldEnd;
    branch.worldStart.x = start.x;
    branch.worldStart.y = start.y;
    branch.worldStart.z = start.z;

    const parentQuat = parent.worldQuat;
    const axis = new Vector3(0, 0, -1);
    const angle = branch.angle * branch.props.normDepth;
    const windQuat = new Quaternion().setFromAxisAngle(axis, angle);
    const worldQuat = parentQuat.clone().multiply(branch.baseQuat).multiply(windQuat);
    branch.worldQuat = worldQuat;
    const dir = new Vector3(0, 1, 0).applyQuaternion(worldQuat);

    branch.worldEnd.x = start.x + dir.x * branch.length;
    branch.worldEnd.y = start.y + dir.y * branch.length;
    branch.worldEnd.z = start.z + dir.z * branch.length;
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
  resize() {}
}
