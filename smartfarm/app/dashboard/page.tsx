'use client';

import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import HeroSection from '../../components/home/HeroSection';
import StatsContainer from '../../components/home/StatsContainer';
import QuickActionsGrid from '../../components/home/QuickActionsGrid';
import MiniFinanceChart from '../../components/home/MiniFinanceChart';
import RecentActivityFeed from '../../components/home/RecentActivityFeed';
import { dbService } from '../../lib/services/db';
import { useFarm } from '../../lib/hooks/useFarm';
import { Loader2, CheckCircle2, Clock, ClipboardList } from 'lucide-react';

export default function DashboardPage() {
  const { currentUserRole } = useFarm();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [tsk, reps] = await Promise.all([
          dbService.getTasks(),
          dbService.getReportsSummary()
        ]);

        // Only load financial transactions for non-workers
        if (currentUserRole !== 'worker') {
          const txs = await dbService.getTransactions();
          setTransactions(txs);
        }

        setTasks(tsk);
        setReports(reps);
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUserRole]);

  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income' && t.status === 'paid')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter((t) => t.type === 'expense' && t.status === 'paid')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const net = income - expense;
    const pendingTasks = tasks.filter((t) => t.status !== 'done').length;

    const formatFCFA = (val: number) => {
      const isNeg = val < 0;
      return `${isNeg ? '-' : ''}FCFA ${Math.abs(val).toLocaleString()}`;
    };

    return {
      income: formatFCFA(income),
      expense: formatFCFA(expense),
      net: formatFCFA(net),
      tasks: String(pendingTasks),
      crops: reports?.crops?.fields ? String(reports.crops.fields) : '0',
      livestock: reports?.livestock?.total ? String(reports.livestock.total) : '0'
    };
  }, [transactions, tasks, reports]);

  const chartData = useMemo(() => {
    const grouped = transactions.reduce((acc, t) => {
      if (t.status !== 'paid') return acc;
      const date = t.date;
      if (!acc[date]) acc[date] = 0;
      if (t.type === 'income') acc[date] += Number(t.amount);
      if (t.type === 'expense') acc[date] -= Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return (Object.entries(grouped) as [string, number][]) 
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10);
  }, [transactions]);

  const isWorker = currentUserRole === 'worker';
  const myTasks = isWorker ? tasks : [];
  const pendingCount = tasks.filter(t => t.status !== 'done').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] w-full items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <header className="mb-8">
        <HeroSection />
      </header>

      <main className="space-y-8 pb-10">

        {/* ── WORKER dashboard ── */}
        {isWorker && (
          <>
            {/* Role banner */}
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/60 dark:bg-amber-900/10 backdrop-blur-md">
              <span className="text-2xl">🌾</span>
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Worker View</p>
                <p className="text-xs text-amber-700/70 dark:text-amber-400/70">You are viewing the farm as a worker. Financial data is not visible in this view.</p>
              </div>
            </div>

            {/* Task summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2 p-5 rounded-2xl border bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border-amber-200/50 dark:border-amber-800/30 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-2xl">
                  <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">Pending Tasks</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{pendingCount}</div>
                </div>
              </div>
              <div className="col-span-2 p-5 rounded-2xl border bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border-emerald-200/50 dark:border-emerald-800/30 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">Completed Today</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{doneCount}</div>
                </div>
              </div>
              <div className="col-span-2 sm:col-span-2 p-5 rounded-2xl border bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border-green-200/50 dark:border-green-800/30 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-2xl">
                  <ClipboardList className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">Total Fields</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{stats.crops}</div>
                </div>
              </div>
              <div className="col-span-2 sm:col-span-2 p-5 rounded-2xl border bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border-rose-200/50 dark:border-rose-800/30 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-rose-500/10 rounded-2xl">
                  <ClipboardList className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">Total Animals</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{stats.livestock}</div>
                </div>
              </div>
            </div>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Quick Actions</h2>
              </div>
              <QuickActionsGrid />
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Recent Activity</h2>
              </div>
              <RecentActivityFeed transactions={[]} tasks={tasks} />
            </section>
          </>
        )}

        {/* ── OWNER / MANAGER dashboard ── */}
        {!isWorker && (
          <>
            <section>
              <StatsContainer data={stats} />
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Quick Actions</h2>
              </div>
              <QuickActionsGrid />
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Cash Flow Trend</h2>
              </div>
              <MiniFinanceChart data={chartData} />
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Recent Activity</h2>
              </div>
              <RecentActivityFeed transactions={transactions} tasks={tasks} />
            </section>
          </>
        )}

      </main>
    </DashboardLayout>
  );
}
