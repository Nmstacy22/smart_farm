"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from "../../components/layout/DashboardLayout";
import { IncomeExpenseChart, InventoryPieChart } from "../../components/reports/ReportsCharts";
import { dbService } from "../../lib/services/db";
import { Loader2, PieChart, TrendingUp, Package, MapPin, Beef } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const reportData = await dbService.getReportsSummary();
        setData(reportData);
      } catch (e) {
        console.error('Failed to load reports:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div className="grid gap-6 rounded-[2rem] border border-slate-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl p-6 shadow-sm">
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Reports & Analytics</h1>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">Aggregated data across your farm.</p>
            </div>
          </header>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 dark:bg-zinc-900/60 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Monthly Cash Flow</h2>
              </div>
              <IncomeExpenseChart data={data.finance} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/60 dark:bg-zinc-900/60 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-sky-500" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Inventory Distribution</h2>
              </div>
              <InventoryPieChart data={data.inventory} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/60 dark:bg-zinc-900/60 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Crops Overview</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Fields</span>
                  <span className="font-bold text-slate-900 dark:text-white">{data.crops.fields}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Area</span>
                  <span className="font-bold text-slate-900 dark:text-white">{data.crops.area.toFixed(1)} ha</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/60 dark:bg-zinc-900/60 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <Beef className="w-5 h-5 text-rose-500" />
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Livestock Overview</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Animals</span>
                  <span className="font-bold text-slate-900 dark:text-white">{data.livestock.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Healthy Herds</span>
                  <span className="font-bold text-slate-900 dark:text-white">{data.livestock.healthy} / {data.livestock.herds}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
