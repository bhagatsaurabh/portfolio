import { Weather } from "@/world/simulation/weather";

export class Rain extends Weather {
  constructor(world) {
    super(world);
  }

  step(dt) {}
  render(ctx) {}
  destroy() {}
}
