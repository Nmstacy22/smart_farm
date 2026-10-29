"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp, TrendingDown, Minus, Store, CalendarDays, Trash2, BarChart3, Tag } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { PagePanel, StatTile, EmptyState, Spinner, primaryButtonClass, sectionCardClass } from "../../components/shared/PagePanel";
import AddMarketPriceDialog from "../../components/market/AddMarketPriceDialog";
import { dbService } from "../../lib/services/db";
import { useFarm } from "../../lib/hooks/useFarm";
import { buildSeries, chartRows, formatFcfa, summarise } from "../../lib/market/stats";
import type { MarketPrice, TeamMember } from "../../lib/types";

const LINE_COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#8b5cf6"];
const MAX_CHART_MARKETS = LINE_COLORS.length;

function Change({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-slate-400">First record</span>;
  const rounded = Math.round(pct * 10) / 10;
  if (Math.abs(rounded) < 0.1) {
    return <span className="inline-flex items-center gap-1 text-slate-500"><Minus className="w-3 h-3" /> No change</span>;
  }
  const up = rounded > 0;
  return (
    <span className={`inline-flex items-center gap-1 font-bold ${up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? "+" : ""}{rounded}%
    </span>
  );
}

const formatDate = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function MarketPage() {
  const { team, currentUserRole } = useFarm();
  const canDelete = currentUserRole === "owner" || currentUserRole === "manager";
  const [prices, setPrices] = useState<MarketPrice[] | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogNonce, setDialogNonce] = useState(0);

  const reload = () => dbService.getMarketPrices().then(setPrices);
  useEffect(() => { reload(); }, []);

  const series = useMemo(() => buildSeries(prices || []), [prices]);
  // Default to the most-recorded product until the user picks one
  const selected = series.find((s) => s.key === selectedKey) || series[0] || null;
  const summary = useMemo(() => (selected ? summarise(selected) : null), [selected]);
  const chartMarkets = useMemo(() => summary?.markets.slice(0, MAX_CHART_MARKETS) || [], [summary]);
  const rows = useMemo(() => (selected ? chartRows(selected, chartMarkets) : []), [selected, chartMarkets]);

  const names = useMemo(() => {
    const map: Record<string, string> = {};
    (team as TeamMember[]).forEach((m) => { map[m.user_id] = m.name; });
    return map;
  }, [team]);
  const knownMarkets = useMemo(() => [...new Set((prices || []).map((p) => p.market).filter(Boolean) as string[])], [prices]);

  function openDialog() {
    setDialogNonce((n) => n + 1); // remount the dialog so the form starts fresh
    setDialogOpen(true);
  }

  async function handleSave(entry: Omit<MarketPrice, "id" | "recorded_by">) {
    const ok = await dbService.createMarketPrice(entry);
    if (ok) {
      await reload();
      setSelectedKey(`${entry.commodity.toLowerCase()}|${entry.unit}`);
    }
    return ok;
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this price record?")) return;
    if (await dbService.deleteMarketPrice(id)) reload();
  }

  return (
    <DashboardLayout>
      <PagePanel
        title="Market Prices"
        subtitle="Track what crops and livestock sell for at nearby markets, and choose when and where to sell."
        actions={
          <button onClick={openDialog} className={primaryButtonClass}>
            <Plus className="w-4 h-4" /> Record Price
          </button>
        }
      >
        {prices === null ? (
          <Spinner />
        ) : series.length === 0 || !selected || !summary ? (
          <EmptyState
            icon={Store}
            title="No prices recorded yet"
            detail="Whenever someone visits a market or gets an offer from a buyer, record the price here. After a few entries you'll see trends and the best-paying market."
            action={<button onClick={openDialog} className={primaryButtonClass}><Plus className="w-4 h-4" /> Record first price</button>}
          />
        ) : (
          <>
            {/* Latest price per product */}
            <section>
              <div className="sf-subheading">Latest prices</div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {series.map((s) => {
                  const active = s.key === selected.key;
                  return (
                    <motion.button
                      key={s.key}
                      whileHover={{ y: -2 }}
                      onClick={() => setSelectedKey(s.key)}
                      className={`shrink-0 min-w-[10rem] text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                        active
                          ? "border-emerald-500/40 bg-emerald-500/10 shadow-sm"
                          : "border-slate-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:border-slate-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{s.commodity}</div>
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">per {s.unit}</div>
                      <div className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">{formatFcfa(s.latest.price)}</div>
                      <div className="text-[11px] mt-0.5"><Change pct={s.changePct} /></div>
                    </motion.button>
                  );
                })}
              </div>
            </section>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatTile label="Latest" value={formatFcfa(selected.latest.price)} hint={<>{selected.latest.market || "Unspecified market"} · {formatDate(selected.latest.observed_on)}</>} icon={Tag} />
              <StatTile label="30-day average" value={summary.avg30 !== null ? formatFcfa(summary.avg30) : "—"} hint={summary.low30 !== null ? `Range ${formatFcfa(summary.low30)} – ${formatFcfa(summary.high30!)}` : "No records in 30 days"} icon={BarChart3} tone="sky" />
              <StatTile label="Best market (90 days)" value={summary.bestMarket?.name || "—"} hint={summary.bestMarket ? `Avg ${formatFcfa(summary.bestMarket.avg)}` : "Record prices from 2+ markets to compare"} icon={Store} tone="amber" />
              <StatTile label="Records" value={selected.entries.length} hint={`${summary.markets.length} market${summary.markets.length === 1 ? "" : "s"}`} icon={CalendarDays} tone="violet" />
            </div>

            <section className={sectionCardClass}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{selected.commodity} price trend</h2>
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">FCFA per {selected.unit}</span>
              </div>
              {rows.length < 2 ? (
                <p className="text-sm text-slate-500 dark:text-zinc-400 py-10 text-center">Record prices on at least two different days to see a trend.</p>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} vertical={false} />
                      <XAxis dataKey="date" tickFormatter={(d) => new Date(d + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })} tick={{ fontSize: 11 }} stroke="currentColor" className="text-slate-400" />
                      <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-slate-400" width={56} tickFormatter={(v) => Number(v).toLocaleString("en-US")} />
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} labelFormatter={(d) => formatDate(String(d))} formatter={(v) => formatFcfa(Number(v))} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {chartMarkets.map((m, i) => (
                        <Line key={m} dataKey={m} type="monotone" stroke={LINE_COLORS[i]} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className={sectionCardClass}>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">{selected.commodity} records</h2>
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">
                      <th className="px-2 py-2">Date</th>
                      <th className="px-2 py-2">Market</th>
                      <th className="px-2 py-2 text-right">Price</th>
                      <th className="px-2 py-2">Notes</th>
                      <th className="px-2 py-2">Recorded by</th>
                      {canDelete && <th className="px-2 py-2" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 dark:divide-zinc-800">
                    {selected.entries.slice(0, 50).map((e) => (
                      <tr key={e.id} className="text-slate-700 dark:text-zinc-300">
                        <td className="px-2 py-2.5 whitespace-nowrap">{formatDate(e.observed_on)}</td>
                        <td className="px-2 py-2.5">{e.market || "—"}</td>
                        <td className="px-2 py-2.5 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">{formatFcfa(e.price)}</td>
                        <td className="px-2 py-2.5 text-slate-500 dark:text-zinc-400">{e.notes || ""}</td>
                        <td className="px-2 py-2.5 text-slate-500 dark:text-zinc-400">{(e.recorded_by && names[e.recorded_by]) || "—"}</td>
                        {canDelete && (
                          <td className="px-2 py-2.5 text-right">
                            <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer" aria-label="Delete record">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </PagePanel>

      <AddMarketPriceDialog
        key={dialogNonce}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        knownMarkets={knownMarkets}
        defaults={selected ? { commodity: selected.commodity, unit: selected.unit } : undefined}
        onSave={handleSave}
      />
    </DashboardLayout>
  );
}
