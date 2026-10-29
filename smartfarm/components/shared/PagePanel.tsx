'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

/** The rounded glass panel + header used by the dashboard pages (same look as Inventory/Settings). */
export function PagePanel({ title, subtitle, actions, children }: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8 pb-10">
      <div className="grid gap-6 rounded-[2rem] border border-slate-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl p-4 sm:p-6 shadow-sm">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">{subtitle}</p>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
        {children}
      </div>
    </div>
  );
}

const TONES = {
  emerald: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  sky: { color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  amber: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  rose: { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  violet: { color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  slate: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-200/50 dark:border-zinc-800/50' },
};
export type Tone = keyof typeof TONES;

export function StatTile({ label, value, hint, icon: Icon, tone = 'emerald' }: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: LucideIcon;
  tone?: Tone;
}) {
  const t = TONES[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className={`sf-card p-5 border ${t.border} transition-all`}
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">{label}</span>
        <div className={`p-2 rounded-lg ${t.bg} ${t.color}`}><Icon className="w-4 h-4" /></div>
      </div>
      <div className="text-2xl font-extrabold text-slate-900 dark:text-white truncate">{value}</div>
      {hint && <div className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-1">{hint}</div>}
    </motion.div>
  );
}

export function EmptyState({ icon: Icon, title, detail, action }: {
  icon: LucideIcon;
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
      </div>
      <h3 className="text-base font-bold text-slate-600 dark:text-zinc-400">{title}</h3>
      <p className="text-sm mt-1 max-w-sm text-slate-400 dark:text-zinc-500">{detail}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex h-48 items-center justify-center">
      <div className="h-10 w-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );
}

/** Emerald primary button matching the "Add Stock Item" style. */
export const primaryButtonClass =
  'flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

/** Section card inside a page panel. */
export const sectionCardClass =
  'bg-white/60 dark:bg-zinc-900/60 p-5 sm:p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50';
