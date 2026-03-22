import { Color, Group } from "three";
import { Line2, LineGeometry, LineMaterial } from "three/examples/jsm/Addons";
import { degToRad, radToDeg } from "three/src/math/MathUtils";

import { denormalize, normalize, rand } from "./graphics";

export class TreeNew {
  params = {
    wind: { strength: 1 },
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
      depthExponent: 2.5,
      microScale: 0.3,
      layers: [
        { mul: 1.0, weight: 0.4 },
        { mul: 1.7, weight: 0.3 },
        { mul: 2.3, weight: 0.2 },
        { mul: 3.1, weight: 0.1 },
      ],
    },
    visual: { swayScale: 4 },
    generation: {
      initialLength: 1.4,
      initialWidth: 2.5,
      branchLengthThreshold: 0.2,
      branchLengthFactor: [0.75, 0.85],
      branchWidthFactor: 0.8,
      zBranchRotation: [5, 35],
      xBranchRotation: 45,
      yBranchRotation: 45,
      opacityBound: [0, 200],
    },
  };

  #color = "#000";
  opacity = 1;
  maxDepth = 0;
  at = 0; // accumulated
  root = null;
  trunk = null;

  // constant for now
  wind = {
    angle: 1,
  };

  get color() {
    return this.#color;
  }
  set color(c) {
    this.#color = c;
    this.setColor(this.trunk);
  }

  constructor(pos, config = {}) {
    Object.assign(this.params.generation, config);
    this.setup(pos);
  }

  setup(pos) {
    this.root = new Group();
    const [near, far] = this.params.generation.opacityBound;
    this.opacity = denormalize(1 - normalize(Math.abs(pos.z), near, far), 0.1, 1);
    this.root.position.copy(pos);

    // gen
    this.root.length = this.params.generation.initialLength;

    this.generateBranches(this.params.generation.initialWidth, 0, this.root);

    this.trunk = this.root.children[0];
    this.trunk.position.setY(0);

    this.maxDepth = this.getDepth(this.trunk);

    this.setProps(this.trunk);
    this.spreadBranches(this.trunk);

    this.setColor(this.trunk);
  }
  generateBranches(width, depth, parent) {
    const p = this.params.generation;

    const branchLength = parent.length * rand(...p.branchLengthFactor);

    const geometry = new LineGeometry();
    geometry.setPositions([0, 0, 0, 0, branchLength, 0]);

    const material = new LineMaterial({
      color: this.color,
      linewidth: width,
      opacity: this.opacity,
    });

    const branch = new Line2(geometry, material);
    branch.computeLineDistances();

    branch.props = { depth };
    branch.position.set(0, parent.length, 0);
    branch.length = branchLength;

    parent.add(branch);

    if (branchLength < p.branchLengthThreshold * p.initialLength) return;

    this.generateBranches(width * p.branchWidthFactor, depth + 1, branch);
    this.generateBranches(width * p.branchWidthFactor, depth + 1, branch);
  }
  setProps(node) {
    if (!node) return;

    const normDepth = node.props.depth / this.maxDepth;

    node.props = {
      ...node.props,
      normDepth,
      seed: node.id ?? 0,
      originalRot: node.rotation.clone(),

      flutter: {
        phase1: rand(0, Math.PI * 2),
        phase2: rand(0, Math.PI * 2),
      },

      dyn: {
        angle: 0,
        velocity: 0,
      },
    };

    this.setProps(node.children[0]);
    this.setProps(node.children[1]);
  }
  getDepth(node) {
    if (!node.children || node.children.length < 2) return 0;
    return Math.max(this.getDepth(node.children[0]), this.getDepth(node.children[1])) + 1;
  }
  spreadBranches(node) {
    if (!node.children || node.children.length < 2) return;

    const p = this.params.generation;
    const { normDepth } = node.props;

    const apply = (child, sign) => {
      const x = denormalize(normDepth, 0, p.xBranchRotation);
      const y = denormalize(normDepth, 0, p.yBranchRotation);
      const z = rand(...p.zBranchRotation) * sign;

      child.rotation.set(degToRad(rand(-x, x)), degToRad(rand(-y, y)), degToRad(z));

      child.props.originalRot = child.rotation.clone();
    };

    apply(node.children[0], -1);
    apply(node.children[1], 1);

    this.spreadBranches(node.children[0]);
    this.spreadBranches(node.children[1]);
  }
  setColor(node) {
    if (!node) return;
    node.material.color = new Color(this.color);
    node.children.forEach((c) => this.setColor(c));
  }
  update(dt) {
    this.at += dt;
    this.applyWind(this.trunk, this.wind.angle, dt);
  }
  applyWind(node, wind, dt) {
    if (!node) return;

    const p = this.params;
    const { normDepth, originalRot, dyn, seed } = node.props;

    const windStrength = Math.abs(wind);

    // physics 😵🔫
    const kWind = p.physics.windInfluence * (0.5 + normDepth * 0.5) * p.wind.strength;

    const kStiff = p.physics.stiffnessBase + (1 - normDepth) * p.physics.stiffnessScale;

    const fatigue =
      p.physics.fatigueMin +
      (p.physics.fatigueMax - p.physics.fatigueMin) * Math.exp(-Math.abs(dyn.angle));

    const forceWind = kWind * wind * 1.2;
    const forceRestore = -kStiff * fatigue * (dyn.angle - wind * p.physics.equilibrium);

    const forceDamp = -p.physics.damping * dyn.velocity;

    const turbulence =
      Math.sin(this.at * 3 + seed) * 0.6 + Math.sin(this.at * 1.7 + seed * 2) * 0.4;

    const accel = forceWind + forceRestore + forceDamp + turbulence;

    dyn.velocity += accel * dt;
    dyn.angle += dyn.velocity * dt;

    // soft clamping
    const maxBend = p.limits.maxBend;

    if (Math.abs(dyn.angle) > maxBend) {
      const excess = dyn.angle - Math.sign(dyn.angle) * maxBend;

      dyn.velocity -= excess * p.limits.softClampForce * dt;
    }

    // energy
    if (Math.abs(dyn.velocity) < p.physics.energyFloor) {
      dyn.velocity += Math.sign(wind) * p.physics.energyFloor * p.physics.energyPush;
    }

    // fluttering
    const fp = p.flutter;

    const leafFactor = Math.pow(normDepth, fp.depthExponent);

    const flutterAmp = leafFactor * (fp.ampBase + windStrength * fp.ampWindScale);

    const flutterFreq =
      fp.freqBase + leafFactor * fp.freqDepthScale + windStrength * fp.freqWindScale;

    let flutterSignal = 0;

    for (const layer of fp.layers) {
      flutterSignal +=
        Math.sin(this.at * flutterFreq * layer.mul + seed * layer.mul) * layer.weight;
    }

    const micro = (Math.random() - 0.5) * leafFactor * windStrength * fp.microScale;

    const finalFlutter = flutterSignal * flutterAmp + micro;

    // final rotation
    const angle = (dyn.angle + finalFlutter) * p.visual.swayScale;

    node.rotation.z = degToRad(radToDeg(originalRot.z) + angle);

    for (const child of node.children) {
      this.applyWind(child, wind, dt);
    }
  }
  gust() {}
  resize() {}
}
