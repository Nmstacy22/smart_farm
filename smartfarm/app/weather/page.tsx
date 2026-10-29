"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Sun, CloudSun, Cloud, CloudDrizzle, CloudRain, CloudLightning, Snowflake, CloudFog,
  Droplets, Wind, Thermometer, Umbrella, MapPin, Search, AlertTriangle, CheckCircle2, Info,
} from "lucide-react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { PagePanel, StatTile, Spinner, sectionCardClass } from "../../components/shared/PagePanel";
import { useFarm } from "../../lib/hooks/useFarm";
import type { WeatherReport } from "../../lib/weather/forecast";
import { getFarmAdvice, type Advice } from "../../lib/weather/advice";

/** Lucide icon for an OpenWeatherMap icon code such as "10d". */
function WeatherIcon({ code, className }: { code: string; className?: string }) {
  switch (code.slice(0, 2)) {
    case "01": return <Sun className={className} />;
    case "02": return <CloudSun className={className} />;
    case "09": return <CloudDrizzle className={className} />;
    case "10": return <CloudRain className={className} />;
    case "11": return <CloudLightning className={className} />;
    case "13": return <Snowflake className={className} />;
    case "50": return <CloudFog className={className} />;
    default: return <Cloud className={className} />;
  }
}

const ADVICE_STYLE: Record<Advice["level"], { box: string; iconColor: string }> = {
  warning: { box: "border-amber-500/25 bg-amber-500/5", iconColor: "text-amber-500" },
  good: { box: "border-emerald-500/25 bg-emerald-500/5", iconColor: "text-emerald-500" },
  info: { box: "border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40", iconColor: "text-slate-400" },
};

function AdviceIcon({ level, className }: { level: Advice["level"]; className?: string }) {
  if (level === "warning") return <AlertTriangle className={className} />;
  if (level === "good") return <CheckCircle2 className={className} />;
  return <Info className={className} />;
}

type FetchResult = { location: string; report: WeatherReport | null; error: string };

export default function WeatherPage() {
  const { profile, loading: farmLoading } = useFarm();
  // The searched location wins; otherwise use the farm's location, then the default
  const [searched, setSearched] = useState<string | null>(null);
  const [input, setInput] = useState<string | null>(null);
  const location = searched ?? (farmLoading ? null : profile?.location || process.env.NEXT_PUBLIC_WEATHER_LOCATION || "Buea");
  const [result, setResult] = useState<FetchResult | null>(null);

  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    fetch(`/api/weather?location=${encodeURIComponent(location)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not load the forecast");
        if (!cancelled) setResult({ location, report: json, error: "" });
      })
      .catch((e: Error) => { if (!cancelled) setResult({ location, report: null, error: e.message }); });
    return () => { cancelled = true; };
  }, [location]);

  // Still loading while there's no result for the location currently asked for
  const loading = !result || result.location !== location;
  const report = loading ? null : result.report;
  const error = loading ? "" : result.error;

  function search(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const next = (input ?? "").trim();
    if (next) setSearched(next);
  }

  const advice = useMemo(() => (report ? getFarmAdvice(report) : []), [report]);
  const stats = useMemo(() => {
    if (!report) return null;
    return {
      rain24h: Math.round(report.slots.slice(0, 8).reduce((s, x) => s + x.rainMm, 0) * 10) / 10,
      rain5d: Math.round(report.days.reduce((s, d) => s + d.rainMm, 0)),
      rainyDays: report.days.filter((d) => d.rainMm >= 1).length,
      maxWind: Math.max(...report.days.map((d) => d.windKph)),
    };
  }, [report]);
  const chartData = useMemo(() => (report?.slots || []).slice(0, 16).map((s) => ({
    label: new Date(s.time).toLocaleString("en-GB", { weekday: "short", hour: "2-digit" }),
    rain: Math.round(s.rainMm * 10) / 10,
    temp: s.temp,
  })), [report]);

  return (
    <DashboardLayout>
      <PagePanel
        title="Weather"
        subtitle="Forecast and field advice to plan spraying, planting and livestock care."
        actions={
          <form onSubmit={search} className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              value={input ?? location ?? ""}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Town or city, e.g. Bamenda"
              className="sf-input pl-10"
              aria-label="Location"
            />
          </form>
        }
      >
        {report?.sample && (
          <div className="rounded-2xl border border-sky-500/25 bg-sky-500/5 p-4 text-sm font-medium text-sky-700 dark:text-sky-300 flex gap-3 items-start">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Showing sample data. Set <code className="font-bold">OPENWEATHER_API_KEY</code> on the server to load the real forecast.</span>
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : error || !report || !stats ? (
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4 text-sm font-semibold text-rose-600 dark:text-rose-400">
            {error || "Could not load the forecast."} Try another location.
          </div>
        ) : (
          <>
            {/* Current conditions */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-transparent p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 text-amber-500 shadow-sm">
                    <WeatherIcon code={report.current.icon} className="w-12 h-12" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                      <MapPin className="w-3.5 h-3.5" /> {report.location}
                    </div>
                    <div className="text-5xl font-extrabold text-slate-900 dark:text-white mt-1">{report.current.temp}°C</div>
                    <div className="text-sm font-semibold capitalize text-slate-600 dark:text-zinc-300">{report.current.description}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { icon: Thermometer, label: "Feels like", value: `${report.current.feelsLike}°` },
                    { icon: Droplets, label: "Humidity", value: `${report.current.humidity}%` },
                    { icon: Wind, label: "Wind", value: `${report.current.windKph} km/h` },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-xl bg-white/70 dark:bg-zinc-900/70 px-3 py-2.5">
                      <Icon className="w-4 h-4 mx-auto text-slate-400" />
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">{value}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatTile label="Rain next 24h" value={`${stats.rain24h} mm`} icon={Umbrella} tone="sky" />
              <StatTile label="Rain next 5 days" value={`${stats.rain5d} mm`} hint={`${stats.rainyDays} rainy day${stats.rainyDays === 1 ? "" : "s"}`} icon={CloudRain} tone="sky" />
              <StatTile label="Peak wind" value={`${stats.maxWind} km/h`} icon={Wind} tone={stats.maxWind >= 40 ? "rose" : "slate"} />
              <StatTile label="Field alerts" value={advice.filter((a) => a.level === "warning").length} icon={AlertTriangle} tone={advice.some((a) => a.level === "warning") ? "amber" : "slate"} />
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              {/* Farm advice */}
              <section className={`${sectionCardClass} lg:col-span-2`}>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Field advice</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">Based on the 5-day forecast.</p>
                <div className="space-y-3">
                  {advice.map((a) => {
                    const style = ADVICE_STYLE[a.level];
                    return (
                      <div key={a.id} className={`flex gap-3 rounded-xl border p-3 ${style.box}`}>
                        <AdviceIcon level={a.level} className={`w-4 h-4 mt-0.5 shrink-0 ${style.iconColor}`} />
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{a.title}</div>
                          <div className="text-xs leading-5 text-slate-600 dark:text-zinc-400">{a.detail}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 5-day forecast + rain chart */}
              <section className={`${sectionCardClass} lg:col-span-3 space-y-5`}>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">5-day forecast</h2>
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {report.days.map((d) => {
                      return (
                        <div key={d.date} className="rounded-xl border border-slate-200/70 dark:border-zinc-800 p-2.5 text-center">
                          <div className="text-[11px] font-bold uppercase text-slate-500 dark:text-zinc-400">
                            {new Date(d.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" })}
                          </div>
                          <WeatherIcon code={d.icon} className="w-6 h-6 mx-auto my-2 text-sky-500" />
                          <div className="text-sm font-extrabold text-slate-900 dark:text-white">{d.max}°</div>
                          <div className="text-xs font-semibold text-slate-400">{d.min}°</div>
                          <div className={`mt-1.5 text-[11px] font-bold ${d.rainMm >= 1 ? "text-sky-600 dark:text-sky-400" : "text-slate-400"}`}>
                            {d.rainMm} mm
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">Next 48 hours</h3>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="currentColor" className="text-slate-400" interval={2} />
                        <YAxis yAxisId="rain" tick={{ fontSize: 10 }} stroke="currentColor" className="text-slate-400" unit="mm" />
                        <YAxis yAxisId="temp" orientation="right" tick={{ fontSize: 10 }} stroke="currentColor" className="text-slate-400" unit="°" />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, fontSize: 12 }}
                          formatter={(value, name) => (name === "rain" ? [`${value} mm`, "Rain"] : [`${value}°C`, "Temperature"])}
                        />
                        <Bar yAxisId="rain" dataKey="rain" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={18} />
                        <Line yAxisId="temp" dataKey="temp" type="monotone" stroke="#10b981" strokeWidth={2.5} dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </PagePanel>
    </DashboardLayout>
  );
}
