'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FinancialSummary } from '../../components/finance/financial-summary';
import { TransactionList } from '../../components/finance/transaction-list';
import { AddTransactionDialog } from '../../components/finance/add-transaction-dialog';
import { FinanceChart } from '../../components/finance/finance-chart';
import { dbService } from '../../lib/services/db';
import { motion } from 'framer-motion';
import { Loader2, Wallet, BarChart3, List } from 'lucide-react';

const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' as const } }),
};

export default function FinancePage() {
  const [txs, setTxs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        dbService.getTransactions(),
        dbService.getCategories(),
      ]);
      setTxs(transactionsData);
      setCategories(categoriesData);
    } catch (e) {
      console.error('Failed to load financial data:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleDelete(id: string) {
    if (confirm('Delete this transaction record?')) {
      await dbService.deleteTransaction(id);
      loadData();
    }
  }

  async function handleMarkPaid(id: string) {
    await dbService.updateTransaction(id, { status: 'paid' });
    loadData();
  }

  async function handleAddTransaction(newTx: any) {
    const res = await dbService.createTransaction(newTx);
    if (res) {
      loadData();
      return true;
    }
    return false;
  }

  const chartData = useMemo(() => {
    const grouped = txs.reduce((acc, t) => {
      if (t.status !== 'paid') return acc;
      const date = new Date(t.date).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = { date, income: 0, expense: 0 };
      if (t.type === 'income') acc[date].income += Number(t.amount);
      if (t.type === 'expense') acc[date].expense += Number(t.amount);
      return acc;
    }, {} as Record<string, { date: string; income: number; expense: number }>);

    return (Object.values(grouped) as { date: string; income: number; expense: number }[])
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [txs]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-emerald-500 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">Loading financial data…</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="grid gap-6 rounded-[2rem] border border-slate-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl p-6 shadow-sm">
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Financial Management</h1>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">Overview of income, expenses and cash flow.</p>
            </div>
            <div className="flex items-center gap-3">
              <AddTransactionDialog 
                categories={categories} 
                onAddTransaction={handleAddTransaction} 
              />
            </div>
          </header>
        </div>

        {/* ── Summary Cards ───────────────────────────── */}
        <motion.section
          custom={0}
          variants={sectionVariants}
          initial="hidden"
          animate="show"
        >
          <FinancialSummary transactions={txs} />
        </motion.section>

        {/* ── Cash Flow Chart ─────────────────────────── */}
        <motion.section
          custom={1}
          variants={sectionVariants}
          initial="hidden"
          animate="show"
        >
          <div className="sf-glass p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Cash Flow Trend</h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium ml-9">
                  Daily income vs. expenses (paid transactions)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-500 dark:text-zinc-400">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-500 dark:text-zinc-400">Expense</span>
                </div>
              </div>
            </div>
            <FinanceChart data={chartData} />
          </div>
        </motion.section>

        {/* ── Transaction List ─────────────────────────── */}
        <motion.section
          custom={2}
          variants={sectionVariants}
          initial="hidden"
          animate="show"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-slate-500/10 rounded-lg">
              <List className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">All Transactions</h2>
            <div className="ml-auto px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-xs font-bold text-slate-500 dark:text-zinc-400">
              {txs.length} records
            </div>
          </div>
          <TransactionList
            transactions={txs}
            categories={categories}
            onDeleteTransaction={handleDelete}
            onMarkPaid={handleMarkPaid}
          />
        </motion.section>
      </div>
    </DashboardLayout>
  );
}
