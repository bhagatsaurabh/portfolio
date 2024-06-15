export const rand = (min, max) => Math.random() * (max - min) + min;
export const ease = (currProgress, start, distance, steps = 100) => {
  currProgress /= steps / 2;
  if (currProgress < 1) {
    return (distance / 2) * Math.pow(currProgress, 3) + start;
  }
  currProgress -= 2;
  return (distance / 2) * (Math.pow(currProgress, 3) + 2) + start;
};
export const quadraticEase = (
  currentProgress,
  start,
  distance,
  steps = 100
) => {
  currentProgress /= steps / 2;
  if (currentProgress <= 1) {
    return (distance / 2) * currentProgress * currentProgress + start;
  }
  currentProgress--;
  return (
    -1 * (distance / 2) * (currentProgress * (currentProgress - 2) - 1) + start
  );
};
export const normalize = (value, min, max) => {
  return (value - min) / (max - min);
};
export const denormalize = (value, min, max) => {
  return value * (max - min) + min;
};
