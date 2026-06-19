'use client';
import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, CheckCircle2, Circle } from 'lucide-react';
import { formatXAF } from '../../lib/utils';

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const row: Variants = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { ease: 'easeOut' as const } } };

export default function RecentActivityFeed({ transactions = [], tasks = [] }: { transactions?: any[], tasks?: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div initial="hidden" animate="show" variants={container} className="sf-card p-5">
        <h3 className="sf-subheading">Recent Transactions</h3>
        <ul className="space-y-1 mt-4">
          {transactions.slice(0, 5).map((t) => (
            <motion.li key={t.id} variants={row} className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-md ${t.type === 'income' ? 'bg-lime-500/10 text-lime-600 dark:text-lime-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                  {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[180px] sm:max-w-xs">{t.description}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-500">{new Date(t.date).toLocaleDateString('en-GB')}</div>
                </div>
              </div>
              <div className={`text-sm font-bold tracking-tight ${t.type === 'income' ? 'text-lime-600 dark:text-lime-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {t.type === 'income' ? '+' : '-'}{formatXAF(t.amount)}
              </div>
            </motion.li>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-8 text-xs font-bold uppercase tracking-widest text-slate-400">No transactions recorded</div>
          )}
        </ul>
      </motion.div>

      <motion.div initial="hidden" animate="show" variants={container} className="sf-card p-5">
        <h3 className="sf-subheading">Recent Tasks</h3>
        <ul className="space-y-1 mt-4">
          {tasks.slice(0, 5).map((g) => (
            <motion.li key={g.id} variants={row} className="flex justify-between items-center py-2 px-3 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className={`text-slate-400 ${g.status === 'done' ? 'text-cyan-500 dark:text-cyan-400' : ''}`}>
                  {g.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{g.title}</div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase tracking-wider">For: <span className="font-bold text-slate-700 dark:text-zinc-400">{g.assignee}</span></div>
                </div>
              </div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2 py-1 rounded">
                {new Date(g.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </div>
            </motion.li>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-xs font-bold uppercase tracking-widest text-slate-400">No tasks active</div>
          )}
        </ul>
      </motion.div>
    </div>
  );
}
