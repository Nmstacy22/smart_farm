'use client';
import React from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { PlusCircle, ClipboardList, PackagePlus, Compass } from 'lucide-react';

import { useFarm } from '../../lib/hooks/useFarm';

const actions = [
  { href: '/finance', label: 'Add Transaction', icon: PlusCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', restrictWorker: true },
  { href: '/tasks', label: 'New Task', icon: ClipboardList, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10', restrictWorker: true },
  { href: '/inventory', label: 'Inventory', icon: PackagePlus, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', restrictWorker: false },
  { href: '/dashboard', label: 'Dashboard', icon: Compass, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', restrictWorker: false },
];

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const card: Variants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { ease: 'easeOut' as const } } };

export default function QuickActionsGrid() {
  const { currentUserRole } = useFarm();

  const visibleActions = actions.filter(a => {
    if (a.restrictWorker && currentUserRole === 'worker') return false;
    return true;
  });

  return (
    <motion.div initial="hidden" animate="show" variants={container} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {visibleActions.map((a) => {
        const Icon = a.icon;
        return (
          <motion.div key={a.href} variants={card} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link 
              href={a.href} 
              className="flex flex-col items-center justify-center p-5 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm hover:shadow-md transition-all group"
            >
              <div className={`p-3 rounded-2xl mb-3 transition-colors ${a.bg} ${a.color} group-hover:bg-opacity-20`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-zinc-300">{a.label}</div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
