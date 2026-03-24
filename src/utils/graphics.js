import { clamp } from "./index";

// Need to optimize this, not suitable for hot loops
export const rand = (min, max) => {
  const buf = new Uint32Array(1);
  window.crypto.getRandomValues(buf);
  return denormalize(buf[0] / (0xffffffff + 1), min, max);
  // return Math.random() * (max - min) + min;
};

export const biasRand = (min, max, norm, type, strength = 10) => {
  if (type === "sig") {
    // sigmoid
    const t = rand(0, 1);
    const bias = (norm - 0.5) * strength;
    const biased = 1 / (1 + Math.exp(-bias * (t - 0.5)));
    return min + (max - min) * biased;
  } else if (type === "pow") {
    // power curve
    const t = rand(0, 1);
    const k = 1 - norm;
    const exponent = Math.pow(2, (k - 0.5) * strength);
    const biased = Math.pow(t, exponent);
    return min + (max - min) * biased;
  } else {
    // no bias
    return rand(0, 1);
  }
};
export const quadraticEase = (currentProgress, start, distance, steps = 100) => {
  currentProgress /= steps / 2;
  if (currentProgress <= 1) {
    return (distance / 2) * currentProgress * currentProgress + start;
  }
  currentProgress--;
  return -1 * (distance / 2) * (currentProgress * (currentProgress - 2) - 1) + start;
};
export const normalize = (value, min, max) => (clamp(value, min, max) - min) / (max - min);
export const denormalize = (value, min, max) => clamp(value * (max - min) + min, min, max);
export const rescale = (value, normMin, normMax, denormMin, denormMax) =>
  denormalize(normalize(value, normMin, normMax), denormMin, denormMax);
export const easeInOut = (t) => t * t * (3 - 2 * t);
export const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export function cubicBezier(x1, y1, x2, y2) {
  const NEWTON_ITERATIONS = 4;
  const NEWTON_EPSILON = 1e-6;

  function sampleCurveX(t) {
    return ((1 - 3 * x2 + 3 * x1) * t + (3 * x2 - 6 * x1)) * t * t + 3 * x1 * t;
  }
  function sampleCurveY(t) {
    return ((1 - 3 * y2 + 3 * y1) * t + (3 * y2 - 6 * y1)) * t * t + 3 * y1 * t;
  }
  function sampleCurveDerivativeX(t) {
    return (3 * (1 - 3 * x2 + 3 * x1) * t + 2 * (3 * x2 - 6 * x1)) * t + 3 * x1;
  }
  function solveCurveX(x) {
    let t = x;
    for (let i = 0; i < NEWTON_ITERATIONS; i++) {
      const xEstimate = sampleCurveX(t) - x;
      const dx = sampleCurveDerivativeX(t);

      if (Math.abs(xEstimate) < NEWTON_EPSILON) return t;
      if (Math.abs(dx) < NEWTON_EPSILON) break;

      t -= xEstimate / dx;
    }
    let t0 = 0;
    let t1 = 1;
    t = x;
    while (t0 < t1) {
      const xEstimate = sampleCurveX(t);
      if (Math.abs(xEstimate - x) < NEWTON_EPSILON) return t;
      if (x > xEstimate) t0 = t;
      else t1 = t;
      t = (t1 + t0) / 2;
    }
    return t;
  }
  return function (x) {
    return sampleCurveY(solveCurveX(x));
  };
}
