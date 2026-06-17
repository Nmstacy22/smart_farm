'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Layers, TrendingUp, CalendarClock, Sprout } from 'lucide-react';

const features = [
  {
    title: 'Farm Operations',
    description: 'Manage fields, crops, and livestock in a single responsive dashboard.',
    icon: Sprout,
    accent: 'bg-emerald-500/10 text-emerald-300',
  },
  {
    title: 'Inventory & Supplies',
    description: 'Track stock levels, restock alerts, and material costs with clarity.',
    icon: Layers,
    accent: 'bg-sky-500/10 text-sky-300',
  },
  {
    title: 'Finance Insights',
    description: 'View transactions, profit, and cash flow to keep your farm healthy.',
    icon: TrendingUp,
    accent: 'bg-amber-500/10 text-amber-300',
  },
  {
    title: 'Team & Tasks',
    description: 'Assign work, monitor progress, and close tasks from one place.',
    icon: CalendarClock,
    accent: 'bg-violet-500/10 text-violet-300',
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_25%)]" />

      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-bold">SF</div>
          <div>
            <p className="text-sm font-semibold text-white">SmartFarm</p>
            <p className="text-xs text-slate-400">Modern farm control</p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <Link href="#overview" className="transition-colors hover:text-white">Overview</Link>
          <Link href="#features" className="transition-colors hover:text-white">Features</Link>
          <Link href="#workflow" className="transition-colors hover:text-white">How it works</Link>
          <Link href="/login" className="transition-colors hover:text-white">Login</Link>
          <Link href="/signup" className="rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-2 text-slate-100 transition hover:border-emerald-500/60 hover:text-emerald-300">Sign Up</Link>
        </nav>
      </header>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <section id="features" className="grid gap-16 xl:grid-cols-[minmax(0,0.58fr)_minmax(0,0.42fr)] items-center">
          <section className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 shadow-sm shadow-emerald-500/10"
            >
              <Sparkles className="h-4 w-4" />
              Welcome to SmartFarm — your first stop before the dashboard.
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Grow smarter with a farm dashboard built for modern agriculture.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  Start here, sign up once, and unlock fields, inventory, finance, and task management across your farm operations.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400"
                >
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-slate-100 transition-all hover:border-emerald-500/60 hover:text-emerald-300"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Streamline your farm</p>
                <p className="mt-3 text-3xl font-extrabold text-white">Sign up once, manage everything.</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  New accounts start here. Once created, access all SmartFarm features from the secure dashboard.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Designed for agriculture</p>
                <p className="mt-3 text-3xl font-extrabold text-white">Fast, polished, and easy to use.</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  SmartFarm welcomes every user with a clear intro page before they move into the dashboard experience.
                </p>
              </div>
            </motion.div>
          </section>

          <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_32%)]" />
            <div className="relative z-10">
              <div className="overflow-hidden rounded-[2rem] border border-white/10">
                <div className="h-[420px] w-full bg-[url('/images/hero-bg.png')] bg-cover bg-center" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.5 }}
                      className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-black/20"
                    >
                      <div className={`mb-4 inline-flex rounded-2xl px-3 py-2 ${feature.accent}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{feature.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </section>
      </div>

        <section id="overview" className="mt-24 space-y-10">
          <div className="mx-auto max-w-4xl text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
            >
              Your first step is the landing page — then the full SmartFarm experience.
            </motion.h2>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:text-xl">
              Register or sign in from here and immediately gain access to farm operations, inventory, finance, and task management.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: 'Plan your farm',
                description: 'Define fields, crop cycles, and irrigation plans in one place.',
                icon: ShieldCheck,
              },
              {
                title: 'Track supplies',
                description: 'Monitor inventory, low stock alerts, and reorder tasks.',
                icon: Layers,
              },
              {
                title: 'Review cash flow',
                description: 'Analyze expenses and income to make smarter finance decisions.',
                icon: TrendingUp,
              },
              {
                title: 'Execute operations',
                description: 'Assign work, set deadlines, and track completion across your team.',
                icon: CalendarClock,
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/20"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <footer className="border-t border-white/10 bg-slate-950/90 py-10 text-slate-400">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-white">SmartFarm</p>
              <p className="max-w-xl text-sm text-slate-400">A modern farm operations dashboard that brings inventory, finance, tasks, and field management together in one elegant platform.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8 text-sm">
              <Link href="/landing" className="transition-colors hover:text-white">Landing</Link>
              <Link href="/login" className="transition-colors hover:text-white">Login</Link>
              <Link href="/signup" className="transition-colors hover:text-white">Sign Up</Link>
            </div>
          </div>
        </footer>
    </main>
  );
}
