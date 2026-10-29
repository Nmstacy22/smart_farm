'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { LogOut, LayoutGrid, X } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useFarm } from '../../lib/hooks/useFarm';
import { motion, AnimatePresence } from 'framer-motion';
import { visibleNavLinks } from './navLinks';

const PRIMARY_TABS = 4; // keep the bar tidy; everything else lives under "More"

export default function MobileBottomNav() {
  const path = usePathname() || '/';
  const { signOut, user } = useAuth();
  const { currentUserRole } = useFarm();
  const [moreOpen, setMoreOpen] = useState(false);

  const links = visibleNavLinks(currentUserRole);
  const tabs = links.slice(0, PRIMARY_TABS);
  const moreLinks = links.slice(PRIMARY_TABS);
  const moreActive = moreLinks.some((l) => l.href === path);

  return (
    <>
      {/* "More" sheet with the remaining pages */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
              className="fixed bottom-24 left-4 right-4 z-50 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800/70 p-4 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">More</span>
                <button onClick={() => setMoreOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer" aria-label="Close menu">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {moreLinks.map((l) => {
                  const Icon = l.icon;
                  const active = path === l.href;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl p-3 text-[11px] font-bold transition-colors ${
                        active
                          ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {l.shortLabel || l.label}
                    </Link>
                  );
                })}
                {user && (
                  <button
                    onClick={() => { setMoreOpen(false); signOut(); }}
                    className="flex flex-col items-center gap-1.5 rounded-2xl p-3 text-[11px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav aria-label="Bottom navigation" className="fixed bottom-4 left-4 right-4 z-40 rounded-3xl bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border border-slate-200/60 dark:border-zinc-800/70 md:hidden shadow-2xl shadow-slate-950/10">
        <div className="max-w-md mx-auto flex justify-between items-center h-16 px-3">
          {tabs.map((t) => {
            const active = path === t.href;
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                className="relative flex flex-col items-center justify-end flex-1 pt-2 pb-3 gap-0.5 transition-all"
              >
                <AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="bottom-nav-active"
                      className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-emerald-500"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                    />
                  )}
                </AnimatePresence>
                <div className={`p-1.5 rounded-xl transition-all ${
                  active
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 scale-110'
                    : 'text-slate-400 dark:text-zinc-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[9px] font-bold tracking-tight ${
                  active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'
                }`}>
                  {t.shortLabel || t.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen((o) => !o)}
            aria-expanded={moreOpen}
            className="relative flex flex-col items-center justify-end flex-1 pt-2 pb-3 gap-0.5 cursor-pointer"
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              moreOpen || moreActive
                ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400 dark:text-zinc-500'
            }`}>
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className={`text-[9px] font-bold tracking-tight ${
              moreOpen || moreActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'
            }`}>
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
