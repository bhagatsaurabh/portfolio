import { rand } from "@/utils";

export const SPREAD_VARIETIES = [
  // expanded
  {
    anomalyChance: {
      increase: [0.75, 1],
      decrease: [0.001, 0.002],
      widen: [0.3, 0.4],
    },
    anomalyScale: {
      increase: [1.15, 1.4],
      decrease: [0.8, 0.9],
      widen: [1.2, 1.3],
    },
  },
  // shrunk
  {
    anomalyChance: {
      increase: [0.001, 0.002],
      decrease: [0.5, 0.7],
      widen: [0.3, 0.4],
    },
    anomalyScale: {
      increase: [1.15, 1.4],
      decrease: [0.78, 0.95],
      widen: [1.2, 1.3],
    },
  },
  // mixed
  {
    anomalyChance: {
      increase: [0.75, 1],
      decrease: [0.5, 0.7],
      widen: [0.3, 0.4],
    },
    anomalyScale: {
      increase: [1.15, 1.4],
      decrease: [0.78, 0.95],
      widen: [1.2, 1.3],
    },
  },
  () => ({
    anomalyChance: {
      increase: [rand(0.07, 0.19), rand(0.19, 0.35)],
      decrease: [rand(0.05, 0.1), rand(0.1, 0.15)],
      widen: [rand(0.06, 0.23), rand(0.23, 0.4)],
    },
    anomalyScale: {
      increase: [rand(1.1, 1.35), rand(1.35, 1.55)],
      decrease: [rand(0.2, 0.45), rand(0.45, 0.7)],
      widen: [rand(1.1, 1.175), rand(1.175, 1.25)],
    },
  }),
];
