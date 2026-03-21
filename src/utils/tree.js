import { Line2, LineGeometry, LineMaterial } from "three/examples/jsm/Addons";
import { degToRad, radToDeg } from "three/src/math/MathUtils";

import { denormalize, normalize, rand } from "./graphics";
import { Color, Group, Vector3 } from "three";

export class Tree {
  config = {
    initialLength: 1.4,
    initialWidth: 2.5,
    branchLengthThreshold: 0.2,
    branchLengthFactor: [0.75, 0.8],
    maxIdleSway: 4,
    branchWidthFactor: 0.7,
    zBranchRotation: [5, 35],
    xBranchRotation: 45,
    yBranchRotation: 45,
    opacityBound: [0, 200],
  };
  opacity = 1;
  #color = "#000";
  maxDepth = 0;
  time = 0;
  root = null;
  trunk = null;
  wind = {
    angle: 0,
    velocity: 0,
    target: rand(-1, 1),
    timeToTarget: rand(2, 4),
  };

  get color() {
    return this.#color;
  }
  set color(c) {
    this.#color = c;
    this.setColor(this.trunk);
    this.setOpacity(this.trunk);
  }

  constructor(world, config) {
    this.config = { ...this.config, ...config };
    this.world = world;
    this.setup();
  }

  setup() {
    this.root = new Group();

    const ndc = new Vector3(-0.8, -1, 0.5);
    ndc.unproject(this.world.camera);
    const dir = ndc.sub(this.world.camera.position).normalize();
    const distance = 15;
    const pos = this.world.camera.position.clone().add(dir.multiplyScalar(distance));
    this.opacity = denormalize(1 - normalize(Math.abs(pos.z), ...this.config.opacityBound), 0.1, 1);
    this.root.position.set(pos.x, pos.y, pos.z);

    this.root.length = this.config.initialLength;
    this.generateBranches(this.config.initialWidth, 0, this.root);
    this.trunk = this.root.children[0];
    this.trunk.position.setY(0);
    this.trunk.props.originalRot = this.trunk.rotation.clone();
    this.maxDepth = this.getDepth(this.trunk);

    // Set props
    this.setProps(this.trunk);

    // Spread out
    this.spreadBranches(this.trunk, this.maxDepth);

    this.setColor(this.trunk);

    this.world.scene.add(this.root);
  }
  generateBranches(width, depth, parent) {
    // Slightly reduced length from parent
    const branchLength = parent.length * rand(...this.config.branchLengthFactor);

    const geometry = new LineGeometry();
    geometry.setPositions([0, 0, 0, 0, branchLength, 0]);
    const material = new LineMaterial({
      color: this.color,
      linewidth: width,
      opacity: this.opacity,
    });
    const branch = new Line2(geometry, material);
    branch.computeLineDistances();
    branch.scale.set(1, 1, 1);
    branch.props = {
      depth,
    };

    branch.position.set(0, parent.length, 0);
    branch.length = branchLength;

    if (parent) {
      parent.add(branch);
    }

    if (branchLength < this.config.branchLengthThreshold * this.config.initialLength) {
      return;
    }

    this.generateBranches(width * this.config.branchWidthFactor, depth + 1, branch);
    this.generateBranches(width * this.config.branchWidthFactor, depth + 1, branch);
  }
  setProps(root) {
    if (!root) return;

    const normDepth = root.props.depth / this.maxDepth;
    const stiffness = Math.pow(normDepth, 1.8);
    const seed = root.id ?? 0;

    root.props = {
      ...root.props,
      normDepth,
      stiffness,
      seed,
      originalRot: root.rotation.clone(),
      flutter: {
        phase1: rand(0, Math.PI * 2),
        phase2: rand(0, Math.PI * 2),
      },
      dyn: {
        angle: 0,
        velocity: 0,
      },
    };

    this.setProps(root.children[0]);
    this.setProps(root.children[1]);
  }
  getDepth(root) {
    if (!root.children || root.children.length < 2) return 0;
    let lDepth = this.getDepth(root.children[0]);
    let rDepth = this.getDepth(root.children[1]);
    if (lDepth > rDepth) return lDepth + 1;
    else return rDepth + 1;
  }
  spreadBranches(root) {
    if (!root.children || root.children.length < 2) return;

    const { normDepth } = root.props;
    let xRot = denormalize(normDepth, 0, this.config.xBranchRotation);
    let yRot = denormalize(normDepth, 0, this.config.yBranchRotation);
    let zRot = -rand(...this.config.zBranchRotation);
    root.children[0].rotation.set(
      degToRad(rand(-xRot, xRot)),
      degToRad(rand(-yRot, yRot)),
      degToRad(zRot),
    );
    root.children[0].props.originalRot = root.children[0].rotation.clone();

    xRot = denormalize(normDepth, 0, this.config.xBranchRotation);
    yRot = denormalize(normDepth, 0, this.config.yBranchRotation);
    zRot = rand(...this.config.zBranchRotation);
    root.children[1].rotation.set(
      degToRad(rand(-xRot, xRot)),
      degToRad(rand(-yRot, yRot)),
      degToRad(zRot),
    );
    root.children[1].props.originalRot = root.children[1].rotation.clone();

    this.spreadBranches(root.children[0]);
    this.spreadBranches(root.children[1]);
  }
  setColor(root) {
    if (!root) return;
    root.material.color = new Color(this.color);
    root.material.needsUpdate = true;
    root.children.forEach((child) => this.setColor(child));
  }
  setOpacity(root) {
    if (!root) return;
    root.material.opacity = this.opacity;
    root.material.needsUpdate = true;
    root.children.forEach((child) => this.setOpacity(child));
  }
  update(dt /* this is seconds ! */) {
    this.time += dt;

    const w = this.wind;
    // const t = this.time;
    // const base = Math.sin(t * 0.25);
    // const gust = Math.sin(t * 0.1) * 0.5;
    // w.angle = base * 0.7 + gust;
    // w.angle = Math.max(-1, Math.min(1, w.angle));
    w.angle = 1;

    this.applyWind(this.trunk, w.angle, dt);
  }
  applyWind(node, wind, dt) {
    if (!node) return;

    const { normDepth, originalRot, dyn } = node.props;

    const kWind = 3 * (0.5 + normDepth * 0.5);
    const kStiff = 4 + (1 - normDepth) * 6;
    const kDamp = 0.8;

    const forceWind = kWind * wind * 1.2;
    const windEquilibrium = wind * 0.6;
    const fatigue = 0.6 + 0.4 * Math.exp(-Math.abs(dyn.angle));
    const forceRestore = -kStiff * fatigue * (dyn.angle - windEquilibrium);
    const forceDamp = -kDamp * dyn.velocity;

    const turbulence =
      Math.sin(this.time * 3 + node.props.seed) * 0.6 +
      Math.sin(this.time * 1.7 + node.props.seed * 2) * 0.4;
    const accel = forceWind + forceRestore + forceDamp + turbulence;

    dyn.velocity += accel * dt;
    dyn.angle += dyn.velocity * dt;

    const maxBend = 1.2;
    if (Math.abs(dyn.angle) > maxBend) {
      const excess = dyn.angle - Math.sign(dyn.angle) * maxBend;
      // push back smoothly instead of snapping
      dyn.velocity -= excess * 10 * dt;
    }

    const minEnergy = 0.15;
    if (Math.abs(dyn.velocity) < minEnergy) {
      dyn.velocity += Math.sign(wind) * minEnergy * 0.1;
    }

    const windStrength = Math.abs(wind);
    const leafFactor = Math.pow(normDepth, 2.5);
    const flutterAmp = leafFactor * (0.8 + windStrength * 1.2);
    const flutterFreq =
      8 + // base
      leafFactor * 20 +
      windStrength * 10;
    // procedural
    const t = this.time;
    const f1 = Math.sin(t * flutterFreq + node.props.flutter.phase1);
    const f2 = Math.sin(t * flutterFreq * 1.7 + node.props.flutter.phase2);
    const f3 = Math.sin(t * flutterFreq * 2.3 + node.props.seed);
    const f4 = Math.sin(t * flutterFreq * 3.1 + node.props.seed * 2);
    // mix
    const flutterSignal = f1 * 0.4 + f2 * 0.3 + f3 * 0.2 + f4 * 0.1;
    const micro = (Math.random() - 0.5) * leafFactor * windStrength * 0.3;
    const flutter = flutterSignal * flutterAmp;
    const finalFlutter = flutter + micro;

    // convert
    const angle = (dyn.angle + finalFlutter) * this.config.maxIdleSway;

    node.rotation.z = degToRad(radToDeg(originalRot.z) + angle);

    for (const child of node.children) {
      this.applyWind(child, wind, dt);
    }
  }
  resize() {}
}
