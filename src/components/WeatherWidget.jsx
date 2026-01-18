import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets } from 'lucide-react';

export const WeatherWidget = ({ destination }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, [destination]);

  const fetchWeather = async () => {
    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`
      );
      const geoData = await geoResponse.json();

      if (geoData && geoData[0]) {
        const lat = geoData[0].lat;
        const lon = geoData[0].lon;

        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
        );
        const weatherData = await weatherResponse.json();

        setWeather(weatherData.current);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeather({
        temperature_2m: 22,
        relative_humidity_2m: 65,
        wind_speed_10m: 15,
        weather_code: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun className="w-8 h-8 text-yellow-400" />;
    if (code <= 3) return <Cloud className="w-8 h-8 text-gray-400" />;
    return <CloudRain className="w-8 h-8 text-blue-400" />;
  };

  const getWeatherDescription = (code) => {
    if (code === 0) return 'Clear sky';
    if (code <= 3) return 'Partly cloudy';
    if (code <= 67) return 'Rainy';
    return 'Stormy';
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Weather in {destination}</h3>
          <p className="text-blue-100 text-sm">Current conditions</p>
        </div>
        {getWeatherIcon(weather.weather_code)}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
            <Sun className="w-4 h-4" />
            <span>Temperature</span>
          </div>
          <div className="text-2xl font-bold">{Math.round(weather.temperature_2m)}°C</div>
          <div className="text-xs text-blue-100 mt-1">{getWeatherDescription(weather.weather_code)}</div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
            <Droplets className="w-4 h-4" />
            <span>Humidity</span>
          </div>
          <div className="text-2xl font-bold">{weather.relative_humidity_2m}%</div>
          <div className="text-xs text-blue-100 mt-1">Relative</div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
            <Wind className="w-4 h-4" />
            <span>Wind Speed</span>
          </div>
          <div className="text-2xl font-bold">{Math.round(weather.wind_speed_10m)}</div>
          <div className="text-xs text-blue-100 mt-1">km/h</div>
        </div>
      </div>
    </div>
  );
};
