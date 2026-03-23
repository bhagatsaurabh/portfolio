export class PerfMonitor {
  constructor(world, el) {
    this.world = world;
    this.el = el;
    Object.assign(this.el.style, {
      position: "fixed",
      top: "0",
      left: "0",
      color: "rgb(0, 175, 0)",
      fontFamily: "monospace",
      fontSize: "12px",
      zIndex: 9999,
    });
    document.body.appendChild(this.el);

    this.frames = 0;
    this.last = performance.now();
    this.fps = 0;
  }

  at = 0;
  update(dt, metrics) {
    this.frames++;
    this.at += dt;

    if (this.at >= 1) {
      this.fps = this.frames;
      this.frames = 0;
      this.at = 0;

      this.el.innerText = `
        FPS:          ${this.fps}
        No. of Trees: ${metrics.noOfTrees ?? "-"}
        Calls:        ${this.world.renderer.info.render.calls ?? "-"}
      `;
    }
  }
}
