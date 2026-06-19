'use client';
import React from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { PlusCircle, ClipboardList, PackagePlus, Compass } from 'lucide-react';

import { useFarm } from '../../lib/hooks/useFarm';

const actions = [
  { href: '/finance', label: 'Add Transaction', icon: PlusCircle, color: 'text-emerald-500 dark:text-lime-400', hoverBorder: 'hover:border-emerald-500 dark:hover:border-lime-400', restrictWorker: true },
  { href: '/tasks', label: 'New Task', icon: ClipboardList, color: 'text-indigo-500 dark:text-cyan-400', hoverBorder: 'hover:border-indigo-500 dark:hover:border-cyan-400', restrictWorker: true },
  { href: '/inventory', label: 'Inventory', icon: PackagePlus, color: 'text-rose-500 dark:text-rose-400', hoverBorder: 'hover:border-rose-500 dark:hover:border-rose-400', restrictWorker: false },
  { href: '/dashboard', label: 'Dashboard', icon: Compass, color: 'text-amber-500 dark:text-amber-400', hoverBorder: 'hover:border-amber-500 dark:hover:border-amber-400', restrictWorker: false },
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
    <motion.div initial="hidden" animate="show" variants={container} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {visibleActions.map((a) => {
        const Icon = a.icon;
        return (
          <motion.div key={a.href} variants={card}>
            <Link 
              href={a.href} 
              className={`flex flex-col items-start p-4 sf-card ${a.hoverBorder} group relative overflow-hidden`}
            >
              <div className={`p-2 rounded-md mb-3 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 transition-colors group-hover:bg-transparent ${a.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{a.label}</div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
