import { PerspectiveCamera, Scene, Timer, WebGLRenderer } from "three";
import { themes } from "./constants";

export class SimulatedThreeWorld {
  #state = { theme: themes.LIGHT };
  renderer = null;
  camera = null;
  scene = null;
  timer = new Timer();
  MAX_DT = 0.015;
  simulations = [];

  get width() {
    return this.renderer.getSize().x;
  }
  get height() {
    return this.renderer.getSize().y;
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

  constructor(container, update = () => {}) {
    this.setup(container);
    this.update = update;
  }
  setup(container) {
    let width = container.clientWidth;
    let height = container.clientHeight;

    const renderer = new WebGLRenderer({ alpha: true, antialias: true });
    this.renderer = renderer;
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    const camera = new PerspectiveCamera(60, width / height, 1, 2500);
    this.camera = camera;
    const scene = new Scene();
    this.scene = scene;
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
    this.renderer.render(this.scene, this.camera);
  }
  resize(width, height) {
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
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
    for (const simulation of this.simulations) {
      simulation.destroy?.();
    }
    this.scene.clear();
    this.renderer.dispose();
  }
}
