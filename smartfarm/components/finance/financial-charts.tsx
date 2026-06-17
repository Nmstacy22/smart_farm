'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatXAF } from "@/lib/utils";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Transaction } from "./financial-summary";
import { Calendar, DollarSign, PieChart as PieIcon } from "lucide-react";

interface FinancialChartsProps {
  transactions: Transaction[];
}

export function FinancialCharts({ transactions }: FinancialChartsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [activePieTab, setActivePieTab] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-[350px] animate-pulse bg-zinc-100/50 dark:bg-zinc-900/50" />
        <Card className="h-[350px] animate-pulse bg-zinc-100/50 dark:bg-zinc-900/50" />
      </div>
    );
  }

  // 1. Process Area Chart Data (Monthly Aggregation for the last 6 months)
  const getMonthlyTrendData = () => {
    const monthlyDataMap: Record<string, { month: string; income: number; expense: number; rawDate: Date }> = {};
    
    // Initialize past 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyDataMap[key] = {
        month: d.toLocaleString('default', { month: 'short' }),
        income: 0,
        expense: 0,
        rawDate: d
      };
    }

    // Populate from transactions
    transactions.forEach(t => {
      if (t.status !== 'paid') return; // Only count paid transactions in charts
      
      const tDate = new Date(t.date);
      const key = tDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      if (monthlyDataMap[key]) {
        if (t.type === 'income') {
          monthlyDataMap[key].income += Number(t.amount);
        } else {
          monthlyDataMap[key].expense += Number(t.amount);
        }
      }
    });

    return Object.values(monthlyDataMap).sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
  };

  // 2. Process Pie Chart Data (Category Breakdown)
  const getCategoryBreakdownData = (type: 'income' | 'expense') => {
    const breakdownMap: Record<string, { name: string; value: number }> = {};

    transactions
      .filter(t => t.type === type && t.status === 'paid')
      .forEach(t => {
        const catName = t.category?.name || 'Uncategorized';
        if (breakdownMap[catName]) {
          breakdownMap[catName].value += Number(t.amount);
        } else {
          breakdownMap[catName] = { name: catName, value: Number(t.amount) };
        }
      });

    return Object.values(breakdownMap).sort((a, b) => b.value - a.value);
  };

  const trendData = getMonthlyTrendData();
  const pieData = getCategoryBreakdownData(activePieTab);

  // Colors for Pie chart cells
  const COLORS = [
    'oklch(0.627 0.265 303.9)', // Violet
    'oklch(0.645 0.246 16.43)', // Rose
    'oklch(0.488 0.243 264.38)', // Blue
    'oklch(0.769 0.188 70.08)', // Amber
    'oklch(0.627 0.194 149.21)', // Emerald
    'oklch(0.815 0.117 116.32)', // Lime
    'oklch(0.553 0.13 224.26)', // Cyan
    'oklch(0.45 0.1 0)', // Neutral Gray/Brown
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
          <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{label}</p>
          <div className="mt-2 space-y-1">
            {payload.map((pld: any) => (
              <div key={pld.name} className="flex items-center gap-4 justify-between">
                <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: pld.color || pld.fill }} />
                  {pld.name === 'income' ? 'Income' : 'Expense'}
                </span>
                <span className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                  {formatXAF(pld.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-zinc-200 bg-white/95 p-3 shadow-lg backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
          <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{data.name}</p>
          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {formatXAF(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Area Chart: Income vs Expense trends */}
      <Card className="md:col-span-2 border border-zinc-200/80 bg-white/50 dark:border-zinc-800/80 dark:bg-zinc-950/50 backdrop-blur-sm shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-zinc-950 dark:text-zinc-50">
              <Calendar className="h-5 w-5 text-indigo-500" />
              Cash Flow Trends
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-1">
              Monthly overview of earnings vs farm operational expenses
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.627 0.194 149.21)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="oklch(0.627 0.194 149.21)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.645 0.246 16.43)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="oklch(0.645 0.246 16.43)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.922 0 0)" className="dark:stroke-zinc-800/40" />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false}
                  fontSize={12}
                  className="fill-zinc-500"
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  fontSize={12}
                  className="fill-zinc-500"
                  tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  name="income"
                  type="monotone" 
                  dataKey="income" 
                  stroke="oklch(0.627 0.194 149.21)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
                <Area 
                  name="expense"
                  type="monotone" 
                  dataKey="expense" 
                  stroke="oklch(0.645 0.246 16.43)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart: Category breakdown */}
      <Card className="border border-zinc-200/80 bg-white/50 dark:border-zinc-800/80 dark:bg-zinc-950/50 backdrop-blur-sm shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-zinc-950 dark:text-zinc-50">
              <PieIcon className="h-5 w-5 text-indigo-500" />
              Category Insights
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-1">
              Distribution of cleared cash events
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center">
            {/* Toggle Income vs Expense */}
            <Tabs 
              value={activePieTab} 
              onValueChange={(val) => setActivePieTab(val as 'income' | 'expense')} 
              className="w-full mb-4"
            >
              <TabsList className="grid grid-cols-2 w-full max-w-[200px] mx-auto bg-zinc-100/80 dark:bg-zinc-950/80">
                <TabsTrigger value="expense" className="text-xs font-semibold py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 shadow-sm rounded-md">Expenses</TabsTrigger>
                <TabsTrigger value="income" className="text-xs font-semibold py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 shadow-sm rounded-md">Income</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="h-[200px] w-full flex items-center justify-center">
              {pieData.length === 0 ? (
                <div className="text-center text-xs text-zinc-500 py-10 dark:text-zinc-400">
                  No transaction data available for {activePieTab === 'expense' ? 'expenses' : 'income'}.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="stroke-white dark:stroke-zinc-950" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Custom Legends list */}
            {pieData.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-4 text-[11px] text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 pt-3 dark:border-zinc-800/40">
                {pieData.slice(0, 4).map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 truncate">
                    <span 
                      className="h-2 w-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                    />
                    <span className="truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
