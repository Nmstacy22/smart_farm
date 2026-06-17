'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FinancialSummary } from '../../components/finance/financial-summary';
import { TransactionList } from '../../components/finance/transaction-list';
import { AddTransactionDialog } from '../../components/finance/add-transaction-dialog';
import { FinanceChart } from '../../components/finance/finance-chart';
import { dbService } from '../../lib/services/db';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

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

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this transaction record?')) {
      await dbService.deleteTransaction(id);
      loadData();
    }
  }

  async function handleMarkPaid(id: string) {
    await dbService.updateTransaction(id, { status: 'paid' });
    loadData();
  }

  async function handleAddTransaction(newTx: any) {
    await dbService.createTransaction(newTx);
    loadData();
  }

  // Generate chart data by grouping transactions by date
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
        <div className="flex h-[70vh] w-full items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
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

        <motion.section 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }} 
          className="grid gap-4"
        >
          <FinancialSummary transactions={txs} />
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <FinanceChart data={chartData} />
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.2 }}
        >
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
