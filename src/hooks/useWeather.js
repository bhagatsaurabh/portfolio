import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { WMO_CODES } from "@/world/utils/weather-utils";
import "@/world/weather/snow";
import { setCountryCode } from "@/store/app";

const mapWeatherCode = (code) => {
  if (WMO_CODES.sun.has(code)) return "sun";
  if (WMO_CODES.rain.has(code)) return "rain";
  if (WMO_CODES.thunderstorm.has(code)) return "thunderstorm";
  if (WMO_CODES.snow.has(code)) return "snow";
  return "snow";
};
const CACHE_KEY = "weather";
const CACHE_TIME = 30 * 1000;

export const useWeather = () => {
  const [weather, setWeather] = useState(null);
  const [pending, setPending] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { weather, timestamp, countryCode } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        setWeather(weather);
        setPending(false);
        dispatch(setCountryCode(countryCode));
        return;
      }
    }

    async function fetchWeather() {
      try {
        const locRes = await fetch(import.meta.env.VITE_IP_LOCATION_API_URL);
        const location = await locRes.json();
        const { latitude, longitude, countryCode } = location;
        dispatch(setCountryCode(countryCode));

        const weatherRes = await fetch(
          `${import.meta.env.VITE_WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=weather_code`,
        );
        const weather = await weatherRes.json();
        const weatherType = mapWeatherCode(weather.current.weather_code);
        setWeather(weatherType);

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ weather: weatherType, timestamp: Date.now(), countryCode }),
        );
      } catch {
        setWeather("snow");
      } finally {
        setPending(false);
      }
    }

    fetchWeather();
  }, [dispatch]);

  return { weather, pending };
};

export default useWeather;
