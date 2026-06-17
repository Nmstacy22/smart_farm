'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Globe, Layers, TrendingUp, ShieldCheck, Sparkles, ArrowRight, CheckCircle2, CalendarClock, Sprout } from 'lucide-react';

const featureCards = [
  {
    title: 'Farm Operations',
    description: 'Manage fields, parcels, and crop cycles in one modern dashboard.',
    icon: Sprout,
    accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  },
  {
    title: 'Inventory & Supplies',
    description: 'Track seeds, feed, fertilizers, and medicine at a glance.',
    icon: Layers,
    accent: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
  },
  {
    title: 'Finance Insights',
    description: 'Monitor cash flow, profit, and spend across all farm activities.',
    icon: TrendingUp,
    accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
  },
  {
    title: 'Team & Tasks',
    description: 'Assign work, track progress, and stay ahead of harvest windows.',
    icon: CalendarClock,
    accent: 'bg-violet-500/10 text-violet-600 dark:text-violet-300',
  },
];

const processSteps = [
  {
    title: 'Plan Your Farm',
    description: 'Define fields, crops, irrigation, and worker assignments with intuitive tools.',
    icon: Globe,
  },
  {
    title: 'Track Inventory',
    description: 'Keep low stock alerts, reorder information, and material history in sync.',
    icon: Layers,
  },
  {
    title: 'Review Finances',
    description: 'See revenue, spending, and net cash flow in crisp charts and reports.',
    icon: TrendingUp,
  },
  {
    title: 'Execute Tasks',
    description: 'Create operations, assign crew, and close work items with status updates.',
    icon: CheckCircle2,
  },
];

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(67,56,202,0.14),transparent_25%)]" />
      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-bold">SF</div>
          <div>
            <p className="text-sm font-semibold text-white">SmartFarm</p>
            <p className="text-xs text-slate-400">Your farm control hub</p>
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
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-16 xl:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)] items-center">
          <section id="features" className="space-y-8">
            <motion.div
              id="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 shadow-sm shadow-emerald-500/10"
            >
              <Sparkles className="h-4 w-4" />
              Built for intelligent agriculture teams and modern farm owners.
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  SmartFarm makes every farm operation feel effortless.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  From fields and livestock to inventory, finance, and task workflows — SmartFarm puts your entire agricultural business in one elegant, responsive dashboard.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-slate-100 transition-all hover:border-emerald-500/60 hover:text-emerald-300"
                >
                  Login to Dashboard
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
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Trusted outcomes</p>
                <p className="mt-3 text-3xl font-extrabold text-white">30% faster planning</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Coordinate farm operations faster with a single system that tracks everything from planting to harvest.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Actionable insights</p>
                <p className="mt-3 text-3xl font-extrabold text-white">Clear performance dashboards</p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Understand cash flow, supply levels, and team progress using built-in analytics and smart alerts.
                </p>
              </div>
            </motion.div>
          </section>

          <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_32%)]" />
            <div className="relative z-10">
              <div className="overflow-hidden rounded-[2rem] border border-white/10">
                <Image
                  src="/images/hero-bg.png"
                  alt="SmartFarm aerial view"
                  width={940}
                  height={600}
                  quality={90}
                  className="h-[420px] w-full object-cover"
                />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {featureCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.5 }}
                      className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-xl shadow-black/20"
                    >
                      <div className={`mb-4 inline-flex rounded-2xl px-3 py-2 ${card.accent}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-base font-semibold text-white">{card.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{card.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        <section className="mt-24 space-y-10">
          <div className="mx-auto max-w-4xl text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
            >
              How SmartFarm powers your agricultural decisions.
            </motion.h2>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:text-xl">
              Designed for farm owners, supervisors, and agronomists who need fast, accurate planning and effortless execution.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
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

        <section className="mt-24 rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300/80">Complete farm control</p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Everything your farm needs, from seed to sale.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                SmartFarm is built to reduce guesswork, automate supply planning, and keep your team aligned. Discover dashboards for fields, inventory, finance, and real-time task management.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">Real-time stock alerts</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm text-sky-200">Cash flow forecasting</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-2 text-sm text-violet-200">Task timelines</span>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20">
              <Image
                src="/images/corn-field.png"
                alt="Field overview"
                width={600}
                height={500}
                className="rounded-[1.5rem] object-cover"
              />
            </div>
          </div>
        </section>
      </div>
      <footer className="border-t border-white/10 bg-slate-950/90 py-10 text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">SmartFarm</p>
            <p className="max-w-xl text-sm text-slate-400">Explore SmartFarm before login, then move into the dashboard to manage fields, inventory, finance, and tasks.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8 text-sm">
            <Link href="#overview" className="transition-colors hover:text-white">Overview</Link>
            <Link href="#features" className="transition-colors hover:text-white">Features</Link>
            <Link href="#workflow" className="transition-colors hover:text-white">How it works</Link>
            <Link href="/login" className="transition-colors hover:text-white">Login</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
