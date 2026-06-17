'use client';

import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import HeroSection from '../../components/home/HeroSection';
import StatsContainer from '../../components/home/StatsContainer';
import QuickActionsGrid from '../../components/home/QuickActionsGrid';
import MiniFinanceChart from '../../components/home/MiniFinanceChart';
import RecentActivityFeed from '../../components/home/RecentActivityFeed';
import { dbService } from '../../lib/services/db';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [txs, tsk] = await Promise.all([
          dbService.getTransactions(),
          dbService.getTasks(),
        ]);
        setTransactions(txs);
        setTasks(tsk);
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
    };
  }, [transactions, tasks]);

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
      </main>
    </DashboardLayout>
  );
}
