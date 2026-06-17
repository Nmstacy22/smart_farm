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
      <motion.div initial="hidden" animate="show" variants={container} className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/50 p-5 rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 tracking-wide uppercase">Recent Transactions</h3>
        <ul className="space-y-3">
          {transactions.slice(0, 5).map((t) => (
            <motion.li key={t.id} variants={row} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                  {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[180px] sm:max-w-xs">{t.description}</div>
                  <div className="text-xs text-slate-500 dark:text-zinc-500">{new Date(t.date).toLocaleDateString('en-GB')}</div>
                </div>
              </div>
              <div className={`text-sm font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {t.type === 'income' ? '+' : '-'}{formatXAF(t.amount)}
              </div>
            </motion.li>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-6 text-sm text-slate-400">No transactions recorded yet.</div>
          )}
        </ul>
      </motion.div>

      <motion.div initial="hidden" animate="show" variants={container} className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/50 p-5 rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 tracking-wide uppercase">Recent Tasks</h3>
        <ul className="space-y-3">
          {tasks.slice(0, 5).map((g) => (
            <motion.li key={g.id} variants={row} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`text-slate-400 ${g.status === 'done' ? 'text-emerald-500' : ''}`}>
                  {g.status === 'done' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{g.title}</div>
                  <div className="text-xs text-slate-500 dark:text-zinc-500">Assigned to: <span className="font-medium text-slate-700 dark:text-zinc-400">{g.assignee}</span></div>
                </div>
              </div>
              <div className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                {new Date(g.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </div>
            </motion.li>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-6 text-sm text-slate-400">No tasks active.</div>
          )}
        </ul>
      </motion.div>
    </div>
  );
}
