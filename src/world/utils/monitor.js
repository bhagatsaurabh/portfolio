export class PerfMonitor {
  constructor(world) {
    this.world = world;
    this.el = document.getElementById("perf-monitor");
    this.frames = 0;
    this.last = performance.now();
    this.fps = 0;
  }

  at = 0;
  lastCalls = 0;
  update(dt, metrics) {
    this.frames += 1;
    this.at += dt;

    if (this.at >= 1) {
      this.fps = this.frames;
      this.frames = 0;
      this.at = 0;

      const currCalls = this.world.renderer.info.render.calls;
      this.el.innerText = `
        FPS:                  ${this.fps}
        No. of Trees:         ${metrics.noOfTrees ?? "-"}
        No. of Reed Clusters: ${metrics.noOfReedClusters ?? "-"}
        GPU Draw Calls:       ${(currCalls ?? 0) - this.lastCalls}
      `;
      this.lastCalls = currCalls;
    }
  }
}
