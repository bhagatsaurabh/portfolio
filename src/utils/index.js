import { themeClasses, themes } from "./constants";

export const currSystemTheme = () => {
  if (window.matchMedia("(prefers-contrast: more)").matches) {
    return themes.HIGH_CONTRAST;
  }
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return themes.DARK;
  }
  return themes.LIGHT;
};
export const getThemeClass = (inTheme, userTheme) => {
  inTheme = inTheme ?? userTheme;
  return themeClasses[inTheme === themes.SYSTEM ? currSystemTheme() : inTheme];
};
export const sanitizePrefs = (prefs = {}) => {
  prefs.theme = Object.values(themes).includes(prefs.theme) ? prefs.theme : themes.SYSTEM;
  return prefs;
};
export const clamp = (value, min, max) =>
  Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
export const norm = (value, min, max) => (clamp(value, min, max) - min) / (max - min);
export const denorm = (value, min, max) => clamp(value * (max - min) + min, min, max);
export const rand = (min, max) => {
  const buf = new Uint32Array(1);
  window.crypto.getRandomValues(buf);
  return denorm(buf[0] / (0xffffffff + 1), min, max);
};
export const throttle = function (fn, delay) {
  let timeout = null;
  return (...args) => {
    if (!timeout) {
      fn(...args);
      timeout = setTimeout(() => {
        timeout = null;
      }, delay);
    }
  };
};
