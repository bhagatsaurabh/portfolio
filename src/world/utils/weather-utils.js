import { Rain } from "../weather/rain";
import { Snow } from "../weather/snow";
import { Sun } from "../weather/sun";
import { Thunderstorm } from "../weather/thunderstorm";

export const mapWeatherType = (type) => {
  if (type === "sun") return Sun;
  if (type === "rain") return Rain;
  if (type === "thunderstorm") return Thunderstorm;
  if (type === "snow") return Snow;
  return Snow;
};

export const WMO_CODES = {
  sun: new Set([0, 1, 2, 3]),
  rain: new Set([
    20, 21, 24, 25, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
  ]),
  thunderstorm: new Set([29, 65, 80, 81, 82, 91, 92, 95, 96, 97, 98, 99]),
  snow: new Set([22, 23, 27, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 85, 86]),
};
