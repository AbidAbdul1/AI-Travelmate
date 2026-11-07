import React from 'react';
import { WeatherData } from '../types/travel';
import { CloudRain, Sun, Wind, Droplets, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  isLoading,
  onRefresh,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-center min-h-[160px]">
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Fetching Open-Meteo live atmospheric observations...</span>
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  const { current, hourly, daily, advisories, dataSource, retrievalTimestamp } = weather;

  const formattedTime = new Date(retrievalTimestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)] space-y-4">
      {/* Header with Attribution */}
      <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-extrabold text-slate-900 tracking-tight">
              Weather & Atmospheric Intelligence
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {weather.locationName}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            <span>{dataSource}</span>
            <span>·</span>
            <span>Observed at {formattedTime}</span>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Refresh live weather forecast"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Temp */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Temperature</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {current.temperatureC}°C
            </span>
            <span className="text-xs text-slate-500 font-mono">
              (Feels {current.apparentTemperatureC}°)
            </span>
          </div>
          <span className="text-xs text-slate-600 mt-1 block truncate">
            {current.weatherDescription}
          </span>
        </div>

        {/* Rain Probability */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Precipitation</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {current.precipitationProbability}%
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({current.precipitationMm} mm)
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-500" />
            <span>Rain Risk</span>
          </div>
        </div>

        {/* Humidity */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Humidity</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {current.relativeHumidity}%
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span>Relative Index</span>
          </div>
        </div>

        {/* Wind & UV */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Wind & UV</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {current.windSpeedKmh} km/h
            </span>
            <span className="text-xs text-slate-500 font-mono">· UV {current.uvIndex}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
            <Wind className="w-3.5 h-3.5 text-slate-500" />
            <span>Gentle breeze</span>
          </div>
        </div>
      </div>

      {/* Weather Advisories (FR-21: Influence outdoor activity recommendations) */}
      {advisories && advisories.length > 0 && (
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/80 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Travel Activity Weather Advisories</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] leading-relaxed text-amber-800">
            {advisories.map((advisory, idx) => (
              <li key={idx}>{advisory}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Hourly Trend Strip */}
      <div>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
          12-Hour Planning Horizon
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {hourly.slice(0, 8).map((h, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-20 p-2 text-center bg-slate-50 rounded-lg border border-slate-150 text-xs"
            >
              <span className="text-slate-500 text-[10px] block font-mono">{h.time}</span>
              <span className="font-bold text-slate-800 font-mono tabular-nums text-sm my-0.5 block">
                {h.temperatureC}°
              </span>
              <div className="flex items-center justify-center gap-0.5 text-[10px] text-blue-600 font-mono">
                <CloudRain className="w-2.5 h-2.5" />
                <span>{h.precipitationProbability}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Day Outlook */}
      <div className="pt-2 border-t border-slate-100">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
          5-Day Forecast Trends
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {daily.map((d, i) => (
            <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-150 text-xs">
              <div className="font-semibold text-slate-800">{d.date}</div>
              <div className="text-slate-500 text-[11px] truncate my-0.5">{d.condition}</div>
              <div className="flex justify-between items-center font-mono tabular-nums text-[11px]">
                <span className="font-bold text-slate-900">{d.maxTempC}°</span>
                <span className="text-slate-400">{d.minTempC}°</span>
                <span className="text-blue-600">{d.precipitationProbability}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
