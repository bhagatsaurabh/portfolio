import NightSkyRenderer from "@/workers/nightsky.worker?worker";

export class SimulatedCosmos {
  #width = 0;
  #height = 0;
  worker = null;
  MAX_DT = 0.05; // 50ms
  lastTime = 0;
  frameId = -1;
  renderFn = undefined;

  get width() {
    return this.#width;
  }
  get height() {
    return this.#height;
  }

  constructor(canvasFG, canvasBG, renderFn) {
    this.canvasFG = canvasFG;
    this.canvasBG = canvasBG;
    this.contextFG = canvasFG.getContext("2d");
    this.contextBG = canvasBG.getContext("2d");
    this.renderFn = renderFn;
    this.setupWorker();
    this.resize();
  }
  setupWorker() {
    this.worker = new NightSkyRenderer();
    this.worker.onmessage = (e) => {
      const bitmap = e.data;
      this.contextBG.setTransform(1, 0, 0, 1, 0, 0);
      this.contextBG.drawImage(bitmap, 0, 0, this.canvasBG.width, this.canvasBG.height);
    };
  }
  start() {
    this.frameId = requestAnimationFrame(this.loop.bind(this));
  }
  loop(now) {
    this.frameId = requestAnimationFrame(this.loop.bind(this));

    this.contextFG.clearRect(0, 0, this.canvasFG.width, this.canvasFG.height);
    let dt = (now - this.lastTime) / 1000;
    dt = Math.min(dt, this.MAX_DT);
    this.lastTime = now;

    this.renderFn?.(dt);
  }
  resize() {
    const rect = this.canvasFG.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const dpr = window.devicePixelRatio || 1;

    const dprWidth = rect.width * dpr;
    const dprHeight = rect.height * dpr;
    if (this.canvasFG.width === dprWidth && this.canvasFG.height === dprHeight) {
      return;
    }
    this.canvasFG.width = dprWidth;
    this.canvasFG.height = dprHeight;
    this.canvasBG.width = dprWidth;
    this.canvasBG.height = dprHeight;
    this.contextFG.setTransform(dpr, 0, 0, dpr, 0, 0);
    // this.contextBG.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.contextBG.setTransform(1, 0, 0, 1, 0, 0);

    this.#width = width;
    this.#height = height;

    this.worker.postMessage({ width: this.width, height: this.height, dpr });
  }
  destroy() {
    cancelAnimationFrame(this.frameId);
    this.worker.terminate();
  }
}
