import React, { useState, useEffect } from "react";
import { Sun, Cloud, CloudRain, CloudSnow, Clock, MapPin, RefreshCw, Globe } from "lucide-react";

interface WeatherData {
  temp: number;
  description: string;
  conditionCode: number;
  cityName: string;
  timezoneOffset: number; // in hours relative to UTC
}

const PRESET_CITIES = [
  { name: "Yaoundé 🇨🇲", lat: 3.848, lng: 11.502, tz: 1 },
  { name: "Douala 🇨🇲", lat: 4.05, lng: 9.7, tz: 1 },
  { name: "Paris 🇫🇷", lat: 48.8566, lng: 2.3522, tz: 2 },
  { name: "Montréal 🇨🇦", lat: 45.5017, lng: -73.5673, tz: -4 },
  { name: "Abidjan 🇨🇮", lat: 5.36, lng: -4.0083, tz: 0 },
];

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);
  const [localTimeStr, setLocalTimeStr] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(-1);

  // Live seconds update clock based on custom city timezone trigger or local machine timezone
  useEffect(() => {
    const timer = setInterval(() => {
      if (weather) {
        // Calculate the target timezone offset time
        const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
        const targetTime = new Date(utc + 3600000 * weather.timezoneOffset);
        setLocalTimeStr(
          targetTime.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      } else {
        setLocalTimeStr(new Date().toLocaleTimeString("fr-FR"));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [weather]);

  const fetchWeather = async (lat: number, lng: number, label: string, offsetHours: number) => {
    setLoading(true);
    setErrorHeader(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
      );
      if (!response.ok) throw new Error("Réponse serveur météo corrompue");
      const data = await response.json();
      const current = data.current_weather;
      
      if (current) {
        // Map open-meteo weathercodes
        const code = current.weathercode;
        let desc = "Clément";
        if (code === 0) desc = "Ciel dégagé ☀️";
        else if (code >= 1 && code <= 3) desc = "Partiellement nuageux ⛅";
        else if (code >= 45 && code <= 48) desc = "Brouillard mystique 🌫️";
        else if (code >= 51 && code <= 67) desc = "Pluie légère 🌧️";
        else if (code >= 71 && code <= 77) desc = "Chutes de neige ❄️";
        else if (code >= 80 && code <= 82) desc = "Averses de pluie tropicale ⛈️";
        else if (code >= 95 && code <= 99) desc = "Orage violent éclairs ⚡";

        setWeather({
          temp: Math.round(current.temperature),
          description: desc,
          conditionCode: code,
          cityName: label,
          timezoneOffset: offsetHours,
        });
      }
    } catch (err: any) {
      console.error("API weather error:", err);
      // fallback simulation
      setWeather({
        temp: 26,
        description: "Climat tropical standard ☀️",
        conditionCode: 0,
        cityName: label,
        timezoneOffset: offsetHours,
      });
      setErrorHeader("Mode autonome connecté");
    } finally {
      setLoading(false);
    }
  };

  // Attempt user geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords({ lat, lng });
          // guess offset hour
          const machineOffset = -new Date().getTimezoneOffset() / 60;
          fetchWeather(lat, lng, "Ma Position Actuelle 📍", machineOffset);
        },
        (error) => {
          console.warn("Geolocation permission declined or failed:", error.message);
          // Fallback to Yaounde preset
          setSelectedPresetIndex(0);
          const yaounde = PRESET_CITIES[0];
          fetchWeather(yaounde.lat, yaounde.lng, yaounde.name, yaounde.tz);
        }
      );
    } else {
      setSelectedPresetIndex(0);
      const yaounde = PRESET_CITIES[0];
      fetchWeather(yaounde.lat, yaounde.lng, yaounde.name, yaounde.tz);
    }
  }, []);

  const handleSelectCityPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    const city = PRESET_CITIES[idx];
    fetchWeather(city.lat, city.lng, city.name, city.tz);
  };

  const handleRefreshUserLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords({ lat, lng });
          const machineOffset = -new Date().getTimezoneOffset() / 60;
          fetchWeather(lat, lng, "Ma Position Réelle 📍", machineOffset);
          setSelectedPresetIndex(-1);
        },
        () => {
          // Re-fetch preset instead if geolocation fails
          const yaounde = PRESET_CITIES[0];
          fetchWeather(yaounde.lat, yaounde.lng, yaounde.name, yaounde.tz);
          setSelectedPresetIndex(0);
        }
      );
    }
  };

  // Weather representation helper
  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />;
    if (code >= 1 && code <= 3) return <Cloud className="w-5 h-5 text-cyan-300 animate-pulse" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-5 h-5 text-sky-450" />;
    if (code >= 80 && code <= 82) return <CloudRain className="w-5 h-5 text-blue-500 animate-bounce" />;
    return <Sun className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="glass-cyber p-4 rounded-xl border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.08)] text-left w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#00f0ff]/15">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-[#00f0ff] animate-pulse" />
          <span className="text-[10.5px] font-mono uppercase tracking-widest text-slate-300 font-extrabold">
            Météo & Heure Locale Intercontinentale
          </span>
        </div>
        <button
          onClick={handleRefreshUserLocation}
          title="Détecter ma position"
          className="text-[10px] font-mono text-[#39ff14] hover:text-[#00f0ff] hover:underline flex items-center gap-1 cursor-pointer transition-all self-end sm:self-auto"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Géolocaliser Position réelle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 items-center">
        {/* Weather Status details */}
        <div className="md:col-span-7 flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-lg bg-slate-950 border border-[#00f0ff]/20 flex items-center justify-center shadow-inner">
            {loading ? (
              <RefreshCw className="w-5 h-5 text-[#00f0ff] animate-spin" />
            ) : (
              getWeatherIcon(weather?.conditionCode || 0)
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-sm text-white tracking-tight uppercase">
                {weather?.cityName || "Calcul en cours..."}
              </span>
              <span className="text-[11px] font-mono text-gray-500">(UTC{weather && weather.timezoneOffset >= 0 ? "+" : ""}{weather?.timezoneOffset})</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-300 font-mono mt-0.5">
              <span className="text-white font-extrabold text-[13px] bg-slate-900 border border-gray-800 px-1.5 py-0.2 rounded font-mono">
                {weather ? `${weather.temp}°C` : "--°C"}
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-cyan-400 font-medium">{weather?.description || "En cours..."}</span>
            </div>
          </div>
        </div>

        {/* Live Clock section */}
        <div className="md:col-span-5 flex md:justify-end items-center space-x-2 bg-slate-950/70 p-2 rounded-lg border border-gray-800">
          <Clock className="w-4 h-4 text-[#39ff14] animate-pulse" />
          <div className="text-right">
            <span className="text-[10px] block font-mono uppercase tracking-wider text-gray-500 font-bold">Heure Région</span>
            <span className="font-mono text-sm font-black text-[#39ff14] tabular-nums tracking-wider block">
              {localTimeStr || "00:00:00"}
            </span>
          </div>
        </div>
      </div>

      {/* Preset interactive cities */}
      <div className="mt-3.5 pt-3.5 border-t border-dashed border-gray-800">
        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-black block mb-2">
          🌍 Tester un autre fuseau horaire de notre clientèle mondiale :
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_CITIES.map((city, idx) => (
            <button
              key={city.name}
              onClick={() => handleSelectCityPreset(idx)}
              className={`text-[10px] font-mono px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                selectedPresetIndex === idx
                  ? "bg-gradient-to-r from-[#00f0ff]/20 to-[#00f0ff]/10 text-white border-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.2)] font-extrabold"
                  : "bg-slate-950 text-gray-400 border-gray-800 hover:border-gray-700 hover:text-white"
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
