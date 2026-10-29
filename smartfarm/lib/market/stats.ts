// Pure helpers for the Market page: grouping price observations and summarising trends.
import type { MarketPrice } from '../types';

/** Prices are only comparable for the same product sold by the same unit. */
export const seriesKey = (p: Pick<MarketPrice, 'commodity' | 'unit'>) => `${p.commodity.toLowerCase()}|${p.unit}`;

export const formatFcfa = (n: number) => `${Math.round(n).toLocaleString('en-US')} FCFA`;

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

const average = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export type Series = {
  key: string;
  commodity: string;
  unit: string;
  entries: MarketPrice[]; // newest first
  latest: MarketPrice;
  changePct: number | null; // latest vs the previous observation
};

/** Groups observations into one series per commodity + unit, most-recorded first. */
export function buildSeries(prices: MarketPrice[]): Series[] {
  const groups = new Map<string, MarketPrice[]>();
  for (const p of prices) groups.set(seriesKey(p), [...(groups.get(seriesKey(p)) || []), p]);

  return [...groups.entries()]
    .map(([key, entries]) => {
      const sorted = [...entries].sort((a, b) => b.observed_on.localeCompare(a.observed_on));
      const [latest, previous] = sorted;
      return {
        key,
        commodity: latest.commodity,
        unit: latest.unit,
        entries: sorted,
        latest,
        changePct: previous && previous.price > 0 ? ((latest.price - previous.price) / previous.price) * 100 : null,
      };
    })
    .sort((a, b) => b.entries.length - a.entries.length);
}

export type SeriesSummary = {
  avg30: number | null;
  low30: number | null;
  high30: number | null;
  bestMarket: { name: string; avg: number } | null; // highest average over 90 days
  markets: string[]; // by number of observations
};

export function summarise(series: Series): SeriesSummary {
  const last30 = series.entries.filter((e) => e.observed_on >= daysAgo(30)).map((e) => e.price);
  const byMarket = new Map<string, number[]>();
  for (const e of series.entries) {
    const name = e.market || 'Unspecified';
    byMarket.set(name, [...(byMarket.get(name) || []), e.price]);
  }
  const recentByMarket = new Map<string, number[]>();
  for (const e of series.entries.filter((x) => x.observed_on >= daysAgo(90) && x.market)) {
    recentByMarket.set(e.market!, [...(recentByMarket.get(e.market!) || []), e.price]);
  }
  const best = [...recentByMarket.entries()]
    .map(([name, xs]) => ({ name, avg: average(xs)! }))
    .sort((a, b) => b.avg - a.avg)[0] || null;

  return {
    avg30: average(last30),
    low30: last30.length ? Math.min(...last30) : null,
    high30: last30.length ? Math.max(...last30) : null,
    bestMarket: recentByMarket.size > 1 ? best : null, // only meaningful when comparing markets
    markets: [...byMarket.entries()].sort((a, b) => b[1].length - a[1].length).map(([name]) => name),
  };
}

export const ALL_MARKETS = 'All markets';

/**
 * Chart rows: one per date, with one column per market (average if several entries that day)
 * plus an "All markets" average, so a trend shows even when each market has only one record.
 */
export function chartRows(series: Series, markets: string[]) {
  const byDate = new Map<string, { all: number[]; byMarket: Record<string, number[]> }>();
  for (const e of series.entries) {
    const row = byDate.get(e.observed_on) || { all: [], byMarket: {} };
    row.all.push(e.price);
    const name = e.market || 'Unspecified';
    if (markets.includes(name)) row.byMarket[name] = [...(row.byMarket[name] || []), e.price];
    byDate.set(e.observed_on, row);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, row]) => ({
      date,
      [ALL_MARKETS]: Math.round(average(row.all)!),
      ...Object.fromEntries(Object.entries(row.byMarket).map(([m, xs]) => [m, Math.round(average(xs)!)])),
    }));
}
