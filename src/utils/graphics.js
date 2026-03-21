import { clamp } from "./index";

export const rand = (min, max) => {
  const buf = new Uint32Array(1);
  window.crypto.getRandomValues(buf);
  return denormalize(buf[0] / (0xffffffff + 1), min, max);
};
export const ease = (currProgress, start, distance, steps = 100) => {
  currProgress /= steps / 2;
  if (currProgress < 1) {
    return (distance / 2) * Math.pow(currProgress, 3) + start;
  }
  currProgress -= 2;
  return (distance / 2) * (Math.pow(currProgress, 3) + 2) + start;
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
export const easeInOut = (t) => t * t * (3 - 2 * t);
