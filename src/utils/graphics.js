export const getRandom = (min, max) => {
  return Math.random() * (max - min) + min;
}
export const getGUID = () => {
  let S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
export const getEase = (currProgress, start, distance, steps = 100) => {
  currProgress /= steps / 2;
  if (currProgress < 1) {
    return (distance / 2) * (Math.pow(currProgress, 3)) + start;
  }
  currProgress -= 2;
  return distance / 2 * (Math.pow(currProgress, 3) + 2) + start;
}
export const getQuadraticEase = (currentProgress, start, distance, steps = 100) => {
  currentProgress /= steps / 2;
  if (currentProgress <= 1) {
    return (distance / 2) * currentProgress * currentProgress + start;
  }
  currentProgress--;
  return -1 * (distance / 2) * (currentProgress * (currentProgress - 2) - 1) + start;
}
export const getSineEase = (currentProgress, start, distance, steps = 100) => {
  return -distance / 2 * (Math.cos(Math.PI * currentProgress / steps) - 1) + start;
}
export const getQuinticEase = (currentProgress, start, distance, steps = 100) => {
  currentProgress /= steps / 2;
  if (currentProgress < 1) {
    return (distance / 2) * (Math.pow(currentProgress, 5)) + start;
  }
  currentProgress -= 2;
  return distance / 2 * (Math.pow(currentProgress, 5) + 2) + start;
}
export const getExpEase = (currentProgress, start, distance, steps = 100) => {
  currentProgress /= steps / 2;
  if (currentProgress < 1) return distance / 2 * Math.pow(2, 10 * (currentProgress - 1)) + start;
  currentProgress--;
  return distance / 2 * (-Math.pow(2, -10 * currentProgress) + 2) + start;
}
export const normalize = (value, min, max) => {
  return (value - min) / (max - min);
}
export const denormalize = (value, min, max) => {
  return value * (max - min) + min;
}