import { Rain } from "../weather/rain";
import { Snow } from "../weather/snow";

export const mapWeatherType = (type) => {
  // if (type === "sunny") return Sunny;
  if (type === "light_rain") return Rain;
  // if (type === "heavy_rain") return HeavyRain;
  if (type === "snow") return Snow;
  // if (type === "foggy") return Foggy;
  return Snow;
};
