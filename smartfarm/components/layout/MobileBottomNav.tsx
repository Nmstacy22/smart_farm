'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Home, Sprout, Package, Wallet, CheckSquare, LogOut, Wheat, Beef, BarChart } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';

const tabs = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/crops', label: 'Crops', icon: Wheat },
  { href: '/livestock', label: 'Livestock', icon: Beef },
  { href: '/inventory', label: 'Stock', icon: Package },
  { href: '/reports', label: 'Reports', icon: BarChart },
];

export default function MobileBottomNav() {
  const path = usePathname() || '/';
  const { signOut, user } = useAuth();

  return (
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
                {t.label}
              </span>
            </Link>
          );
        })}
        {user && (
          <button
            onClick={() => signOut()}
            className="flex flex-col items-center justify-end flex-1 pt-2 pb-3 gap-0.5 text-rose-400 hover:text-rose-500 cursor-pointer transition-colors"
          >
            <div className="p-1.5 rounded-xl">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold tracking-tight">Logout</span>
          </button>
        )}
      </div>
    </nav>
  );
}
