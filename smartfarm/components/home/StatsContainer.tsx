'use client';
import React, { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, CalendarClock, Wheat, Beef } from 'lucide-react';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { ease: 'easeOut' as const, duration: 0.4 } },
};

function StatCard({ title, value, type }: { title: string; value: string, type: 'income' | 'expense' | 'net' | 'tasks' | 'crops' | 'livestock' }) {
  const getIcon = () => {
    switch (type) {
      case 'income': return <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-lime-400" />;
      case 'expense': return <TrendingDown className="w-4 h-4 text-rose-500" />;
      case 'net': return <Wallet className="w-4 h-4 text-cyan-500" />;
      case 'tasks': return <CalendarClock className="w-4 h-4 text-amber-500" />;
      case 'crops': return <Wheat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'livestock': return <Beef className="w-4 h-4 text-rose-400" />;
    }
  };

  const getHighlightColor = () => {
    switch (type) {
      case 'income': return 'bg-emerald-500 dark:bg-lime-400';
      case 'expense': return 'bg-rose-500';
      case 'net': return 'bg-cyan-500';
      case 'tasks': return 'bg-amber-500';
      case 'crops': return 'bg-emerald-600 dark:bg-emerald-400';
      case 'livestock': return 'bg-rose-400';
    }
  };

  return (
    <motion.div variants={card} className="sf-stat-card group">
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 w-full h-1 opacity-20 group-hover:opacity-100 transition-opacity ${getHighlightColor()}`} />
      
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-500 tracking-widest uppercase">{title}</div>
        <div className="p-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md">
          {getIcon()}
        </div>
      </div>
      <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
    </motion.div>
  );
}

export default function StatsContainer({ data }: { data: { income: string; expense: string; net: string; tasks: string; crops?: string; livestock?: string } }) {
  return (
    <motion.div initial="hidden" animate="show" variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      <StatCard title="Total Income" value={data.income} type="income" />
      <StatCard title="Total Expense" value={data.expense} type="expense" />
      <StatCard title="Net Flow" value={data.net} type="net" />
      <StatCard title="Pending" value={data.tasks} type="tasks" />
      <StatCard title="Fields" value={data.crops || '0'} type="crops" />
      <StatCard title="Animals" value={data.livestock || '0'} type="livestock" />
    </motion.div>
  );
}
