// Shared weather types, plus conversion from OpenWeatherMap's free "current weather" and
// "5 day / 3 hour forecast" endpoints into the shape the Weather page uses.

export type WeatherNow = {
  temp: number;
  feelsLike: number;
  humidity: number;
  windKph: number;
  description: string;
  icon: string; // OpenWeatherMap icon code, e.g. "10d"
};

export type ForecastSlot = {
  time: string; // ISO timestamp
  temp: number;
  pop: number; // probability of precipitation, 0–1
  rainMm: number; // rain in this 3-hour slot
  windKph: number;
  humidity: number;
};

export type ForecastDay = {
  date: string; // YYYY-MM-DD in the location's local time
  min: number;
  max: number;
  rainMm: number;
  pop: number; // highest slot probability that day
  windKph: number; // highest slot wind that day
  humidity: number; // average
  description: string;
  icon: string;
};

export type WeatherReport = {
  location: string;
  current: WeatherNow;
  slots: ForecastSlot[]; // next ~5 days in 3-hour steps
  days: ForecastDay[];
  sample?: boolean; // true when no API key is configured
};

const msToKph = (ms: number) => Math.round(ms * 3.6);

/* eslint-disable @typescript-eslint/no-explicit-any -- raw OpenWeatherMap JSON */
export function toWeatherReport(current: any, forecast: any): WeatherReport {
  const tzOffsetSec: number = forecast.city?.timezone ?? 0;

  const slots: ForecastSlot[] = (forecast.list || []).map((s: any) => ({
    time: new Date(s.dt * 1000).toISOString(),
    temp: Math.round(s.main.temp),
    pop: s.pop ?? 0,
    rainMm: s.rain?.['3h'] ?? 0,
    windKph: msToKph(s.wind?.speed ?? 0),
    humidity: s.main.humidity,
  }));

  // Group 3-hour slots into local calendar days
  const byDay = new Map<string, any[]>();
  for (const s of forecast.list || []) {
    const date = new Date((s.dt + tzOffsetSec) * 1000).toISOString().slice(0, 10);
    byDay.set(date, [...(byDay.get(date) || []), s]);
  }

  const days: ForecastDay[] = [...byDay.entries()].slice(0, 5).map(([date, items]) => {
    // Use the slot closest to midday for the day's summary icon/description
    const midday = items.reduce((best, s) =>
      Math.abs(new Date((s.dt + tzOffsetSec) * 1000).getUTCHours() - 12) <
      Math.abs(new Date((best.dt + tzOffsetSec) * 1000).getUTCHours() - 12) ? s : best);
    return {
      date,
      min: Math.round(Math.min(...items.map((s) => s.main.temp_min))),
      max: Math.round(Math.max(...items.map((s) => s.main.temp_max))),
      rainMm: Math.round(items.reduce((sum, s) => sum + (s.rain?.['3h'] ?? 0), 0) * 10) / 10,
      pop: Math.max(...items.map((s) => s.pop ?? 0)),
      windKph: Math.max(...items.map((s) => msToKph(s.wind?.speed ?? 0))),
      humidity: Math.round(items.reduce((sum, s) => sum + s.main.humidity, 0) / items.length),
      description: midday.weather?.[0]?.description ?? '',
      icon: midday.weather?.[0]?.icon ?? '01d',
    };
  });

  return {
    location: current.name || forecast.city?.name || '',
    current: {
      temp: Math.round(current.main.temp),
      feelsLike: Math.round(current.main.feels_like),
      humidity: current.main.humidity,
      windKph: msToKph(current.wind?.speed ?? 0),
      description: current.weather?.[0]?.description ?? '',
      icon: current.weather?.[0]?.icon ?? '01d',
    },
    slots,
    days,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Plausible rainy-season data for Buea, shown when no API key is configured. */
export function sampleWeatherReport(location = 'Buea'): WeatherReport {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  const rainByDay = [0, 6, 14, 2, 0];
  const slots: ForecastSlot[] = Array.from({ length: 40 }, (_, i) => {
    const t = new Date(start.getTime() + i * 3 * 3600 * 1000);
    const day = Math.floor(i / 8);
    const hour = t.getHours();
    const afternoon = hour >= 12 && hour <= 18;
    return {
      time: t.toISOString(),
      temp: Math.round(21 + (afternoon ? 6 : hour >= 9 && hour < 12 ? 3 : 0) - day * 0.3),
      pop: rainByDay[day] > 0 && afternoon ? 0.7 : 0.15,
      rainMm: afternoon ? rainByDay[day] / 3 : 0,
      windKph: afternoon ? 14 : 7,
      humidity: afternoon ? 78 : 90,
    };
  });
  const icons = ['02d', '10d', '09d', '10d', '03d'];
  const descriptions = ['few clouds', 'light rain', 'moderate rain', 'light rain', 'scattered clouds'];
  const days: ForecastDay[] = rainByDay.map((rainMm, i) => ({
    date: new Date(start.getTime() + i * 86400000).toISOString().slice(0, 10),
    min: 20, max: 27 - (i === 2 ? 2 : 0), rainMm, pop: rainMm > 0 ? 0.7 : 0.15,
    windKph: 14, humidity: 84, description: descriptions[i], icon: icons[i],
  }));
  return {
    location,
    current: { temp: 24, feelsLike: 25, humidity: 82, windKph: 9, description: 'few clouds', icon: '02d' },
    slots,
    days,
    sample: true,
  };
}
