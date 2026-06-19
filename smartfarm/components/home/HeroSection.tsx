'use client';
import React, { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { dbService } from '../../lib/services/db';
import { useFarm } from '../../lib/hooks/useFarm';
import { CloudSun, Sunrise, Sunset, Moon } from 'lucide-react';
import Image from 'next/image';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { ease: 'easeOut' as const, duration: 0.5 } },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', Icon: Sunrise };
  if (hour < 18) return { text: 'Good afternoon', Icon: CloudSun };
  if (hour < 21) return { text: 'Good evening', Icon: Sunset };
  return { text: 'Good night', Icon: Moon };
}

export default function HeroSection() {
  const { currentUserRole } = useFarm();
  const isWorker = currentUserRole === 'worker';
  const [greeting, setGreeting] = useState({ text: 'Welcome', Icon: CloudSun });
  const [stats, setStats] = useState([
    { id: 's1', label: 'Fields', value: '0' },
    { id: 's2', label: 'Workers', value: '0' },
    { id: 's3', label: 'Tasks', value: '0' },
  ]);

  useEffect(() => {
    setGreeting(getGreeting());

    async function loadStats() {
      try {
        const overview = await dbService.getOverviewStats();
        setStats([
          { id: 's1', label: 'Fields', value: String(overview.fields) },
          { id: 's2', label: 'Workers', value: String(overview.workers) },
          { id: 's3', label: 'Tasks', value: String(overview.tasks) },
        ]);
      } catch (error) {
        console.error('Failed to load overview stats:', error);
      }
    }

    loadStats();
  }, []);

  const GreetingIcon = greeting.Icon;

  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#050505]">
      {/* Sleek Minimalist Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-100 dark:from-zinc-900 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-slate-200/50 dark:bg-zinc-800/30 rounded-full blur-[80px]"></div>
      </div>

      <motion.div initial="hidden" animate="show" variants={container} className="relative z-10 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div variants={item} className="max-w-xl">
            <div className={`sf-pill mb-4 border ${
              isWorker
                ? 'border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20'
                : 'border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-900/50'
            }`}>
              <div className="flex items-center gap-2">
                <GreetingIcon className="w-3.5 h-3.5" />
                {greeting.text}, {isWorker ? 'Worker' : 'Manager'}
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-white">
              {isWorker ? 'Your Tasks,' : 'Your Farm,'} <br />
              <span className="text-slate-500 dark:text-zinc-500">{isWorker ? 'Ready to Complete' : 'Intelligently Managed'}</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-lg font-medium leading-relaxed">
              {isWorker
                ? 'View your assigned tasks, check field status, and log your daily farm activities.'
                : 'Overview of crop cycles, financial health, and team tasks. Everything you need to grow efficiently.'
              }
            </p>
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
            {stats.map((s) => (
              <motion.div 
                key={s.id} 
                className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 text-left transition-colors hover:border-slate-300 dark:hover:border-zinc-700"
              >
                <div className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold tracking-widest uppercase mb-1">{s.label}</div>
                <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{s.value}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
