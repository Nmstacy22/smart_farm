'use client';
import React, { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { dbService } from '../../lib/services/db';
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
    <section className="relative overflow-hidden rounded-3xl shadow-xl border border-white/10 dark:border-zinc-800/80">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/hero-bg.png" 
          alt="Smart Farm Aerial View" 
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-zinc-950/70 to-zinc-900/30"></div>
        <div className="absolute inset-0 bg-emerald-900/20 mix-blend-multiply"></div>
      </div>

      <motion.div initial="hidden" animate="show" variants={container} className="relative z-10 p-8 sm:p-10 lg:p-12 text-white">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div variants={item} className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 text-sm font-medium text-emerald-50 shadow-sm">
              <GreetingIcon className="w-4 h-4 text-emerald-300" />
              {greeting.text}, Farm Manager
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-md">
              Your Farm, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-100">Intelligently Managed</span>
            </h1>
            <p className="text-base sm:text-lg text-emerald-50/90 max-w-lg font-light leading-relaxed drop-shadow">
              Overview of crop cycles, financial health, and team tasks. Everything you need to grow efficiently.
            </p>
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
            {stats.map((s) => (
              <motion.div 
                key={s.id} 
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} 
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center transition-colors shadow-sm"
              >
                <div className="text-xs sm:text-sm text-emerald-100/80 font-medium tracking-wide uppercase mb-1">{s.label}</div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">{s.value}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
