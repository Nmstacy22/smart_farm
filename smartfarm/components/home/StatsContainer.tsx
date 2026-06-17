'use client';
import React, { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, CalendarClock } from 'lucide-react';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { ease: 'easeOut' as const, duration: 0.4 } },
};

function StatCard({ title, value, type }: { title: string; value: string, type: 'income' | 'expense' | 'net' | 'tasks' }) {
  const getIcon = () => {
    switch (type) {
      case 'income': return <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'expense': return <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'net': return <Wallet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'tasks': return <CalendarClock className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'income': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'expense': return 'bg-rose-500/10 border-rose-500/20';
      case 'net': return 'bg-indigo-500/10 border-indigo-500/20';
      case 'tasks': return 'bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <motion.div variants={card} whileHover={{ y: -4, scale: 1.02 }} className={`p-5 rounded-2xl border bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-sm transition-all ${getColors()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 tracking-wide uppercase">{title}</div>
        <div className="p-2 bg-white dark:bg-zinc-950 rounded-xl shadow-sm">
          {getIcon()}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{value}</div>
    </motion.div>
  );
}

export default function StatsContainer({ data }: { data: { income: string; expense: string; net: string; tasks: string } }) {
  return (
    <motion.div initial="hidden" animate="show" variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Income" value={data.income} type="income" />
      <StatCard title="Total Expense" value={data.expense} type="expense" />
      <StatCard title="Net Cash Flow" value={data.net} type="net" />
      <StatCard title="Pending Tasks" value={data.tasks} type="tasks" />
    </motion.div>
  );
}
