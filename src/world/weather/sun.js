import { Weather } from "@/world/simulation/weather";

export class Sun extends Weather {
  constructor(world) {
    super(world);
  }

  step(dt) {}
  render(ctx) {}
  destroy() {}
}
