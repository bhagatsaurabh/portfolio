import {
  AmbientLight,
  DirectionalLight,
  OrthographicCamera,
  PerspectiveCamera,
  PointLight,
  Scene,
  TextureLoader,
  Timer,
} from "three";
import WebGPURenderer from "three/src/renderers/webgpu/WebGPURenderer";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { AmbientLightNode, DirectionalLightNode, PointLightNode } from "three/src/nodes/Nodes";

import { themes } from "@/utils/constants";
import { PerfMonitor } from "@/world/utils/monitor";
import { EventBus } from "@/utils/event-bus";

export class SimulatedThreeWorld {
  #width = 0;
  #height = 0;
  #state = { theme: themes.LIGHT };
  renderer = null;
  orthoCam = null;
  debugCam = null;
  aspect = 1;
  scene = null;
  timer = new Timer();
  MAX_DT = 0.015;
  simulations = [];
  perf = false;
  monitor = null;
  metrics = {};
  gltfLoader = null;
  texLoader = null;
  activeCamera = null;
  events = new EventBus();

  get width() {
    return this.#width;
  }
  get height() {
    return this.#height;
  }
  get dimensions() {
    return { width: this.width, height: this.height };
  }
  get state() {
    return this.#state;
  }
  set state(newState = {}) {
    if (typeof newState !== "object") {
      return;
    }
    if (Object.prototype.hasOwnProperty.call(newState, "theme")) {
      this.#state.theme = newState.theme;
    }
    this.sync();
  }

  constructor(container, theme, update = () => {}, perfEl) {
    this.setup(container, theme);
    this.update = update;
    if (perfEl) {
      this.monitor = new PerfMonitor(this, perfEl);
    }
  }
  setup(container, theme) {
    this.#state.theme = theme;
    this.gltfLoader = new GLTFLoader();
    this.texLoader = new TextureLoader();

    let width = container.clientWidth;
    let height = container.clientHeight;
    this.#width = width;
    this.#height = height;

    const renderer = new WebGPURenderer({ alpha: true, antialias: true });

    // might be a bug
    renderer.library.addLight(DirectionalLightNode, DirectionalLight);
    renderer.library.addLight(AmbientLightNode, AmbientLight);
    renderer.library.addLight(PointLightNode, PointLight);
    renderer.shadowMap.enabled = true;
    this.renderer = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    this.debugCam = new PerspectiveCamera(60, width / height, 1, 2500);
    const scene = new Scene();
    this.scene = scene;
    this.aspect = width / height;
    this.orthoCam = new OrthographicCamera(-this.aspect, this.aspect, 1, -1, 0.1, 100);
    this.activeCamera = this.orthoCam;
  }
  start() {
    this.renderer.setAnimationLoop(this.loop.bind(this));
  }
  loop(time) {
    this.timer.update(time);
    const dt = Math.min(this.timer.getDelta(), this.MAX_DT);

    this.update(dt);
    for (const simulation of this.simulations) {
      simulation.update?.(dt);
    }

    this.renderer.render(this.scene, this.activeCamera);

    if (this.perf) {
      this.monitor.update(dt, this.metrics);
    }
  }
  resize(width, height) {
    this.#width = width;
    this.#height = height;
    this.renderer.setSize(width, height);

    this.aspect = width / height;
    this.orthoCam.left = -this.aspect;
    this.orthoCam.right = this.aspect;
    this.orthoCam.updateProjectionMatrix();

    this.debugCam.aspect = width / height;
    this.debugCam.updateProjectionMatrix();

    for (const simulation of this.simulations) {
      simulation.resize?.(width, height);
    }
  }
  sync() {
    for (const simulation of this.simulations) {
      simulation.sync?.();
    }
  }
  destroy() {
    this.events.clear();
    for (const simulation of this.simulations) {
      simulation.destroy?.();
    }
    this.scene.clear();
    this.renderer.dispose();
  }
}
