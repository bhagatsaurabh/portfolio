import "@/world/weather/snow";
import { useEffect, useState } from "react";

const mapWeatherCode = (code) => {
  // if ([0, 1].includes(code)) return "sunny";
  if ([51, 53, 55, 61, 63].includes(code)) return "light_rain";
  // if ([65, 80, 81, 82].includes(code)) return "heavy_rain";
  if ([71, 73, 75, 77].includes(code)) return "snow";
  return "snow";
};
const CACHE_KEY = "weather";
const CACHE_TIME = 30 * 1000;

export const useWeather = () => {
  const [weather, setWeather] = useState(null);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { weather, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        setWeather(weather);
        setPending(false);
        return;
      }
    }

    async function fetchWeather() {
      try {
        const locRes = await fetch(import.meta.env.VITE_IP_LOCATION_API_URL);
        const location = await locRes.json();
        const { latitude, longitude } = location;

        const weatherRes = await fetch(
          `${import.meta.env.VITE_WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=weather_code`,
        );
        const weather = await weatherRes.json();
        const weatherType = mapWeatherCode(weather.current.weather_code);
        setWeather(weatherType);

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ weather: weatherType, timestamp: Date.now() }),
        );
      } catch {
        setWeather("snow");
      } finally {
        setPending(false);
      }
    }

    fetchWeather();
  }, []);

  return { weather, pending };
};

export default useWeather;
