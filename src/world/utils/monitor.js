export class PerfMonitor {
  constructor(world) {
    this.world = world;
    this.el = document.getElementById("perf-monitor");
    this.frames = 0;
    this.last = performance.now();
    this.fps = 0;
    this.baseFS = getComputedStyle(document.documentElement).fontSize;
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
      const dimension = metrics.dimension ?? { width: "?", height: "?" };

      const perfSnapshot = [
        { name: "FPS", value: this.fps },
        { name: "Base Font Size", value: this.baseFS },
        {
          name: "Viewport Dimension",
          value: `${Math.round(window.visualViewport.width)} x ${Math.round(window.visualViewport.height)}`,
        },
        { name: "World Dimension", value: `${dimension.width} x ${dimension.height}` },
        { name: "Trees", value: metrics.noOfTrees ?? "-" },
        { name: "Instances per Tree", value: metrics.noOfInstancesPerTree ?? "-" },
        { name: "Reed Clusters", value: metrics.noOfReedClusters ?? "-" },
        { name: "Device Pixel Ratio", value: window.devicePixelRatio },
        { name: "GPU Draw Calls", value: (currCalls ?? 0) - this.lastCalls },
      ];
      this.world.events.emit("perf", perfSnapshot);
      this.lastCalls = currCalls;
    }
  }
}
