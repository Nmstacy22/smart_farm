'use client';
import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';

export default function MiniFinanceChart({ data }: { data: { date: string; amount: number }[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ ease: "easeOut", duration: 0.5 }}
      className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/50 p-4 rounded-2xl shadow-sm h-56"
    >
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-sm text-slate-400">No recent data</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              formatter={(v: any) => [`FCFA ${v}`, 'Amount']} 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.9)' }}
              itemStyle={{ color: '#10b981', fontWeight: 600 }}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#10b981" 
              strokeWidth={3}
              fill="url(#emeraldGradient)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
