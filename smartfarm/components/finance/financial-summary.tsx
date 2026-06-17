'use client';

import { Card, CardContent } from "@/components/ui/card";
import { formatXAF } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Wallet, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: {
    id: string;
    name: string;
    icon?: string;
  } | null;
  description: string;
  date: string;
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | 'other';
  status: 'paid' | 'pending' | 'overdue';
  crop_cycle_id?: string;
  herd_id?: string;
};

interface FinancialSummaryProps {
  transactions: Transaction[];
}

export function FinancialSummary({ transactions }: FinancialSummaryProps) {
  // Calculations (filtering on 'paid' for income/expenses)
  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'paid')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netCashFlow = totalIncome - totalExpense;

  const pendingAmount = transactions
    .filter(t => t.status === 'pending' || t.status === 'overdue')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const cards = [
    {
      title: "Total Income",
      value: formatXAF(totalIncome),
      description: "Cleared earnings from harvests/sales",
      icon: ArrowUpRight,
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgColorClass: "bg-emerald-500/10",
      borderColorClass: "hover:border-emerald-500/40",
      glowClass: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
    },
    {
      title: "Total Expenses",
      value: formatXAF(totalExpense),
      description: "Operational farm costs (feed, seeds, labor)",
      icon: ArrowDownRight,
      colorClass: "text-rose-600 dark:text-rose-400",
      bgColorClass: "bg-rose-500/10",
      borderColorClass: "hover:border-rose-500/40",
      glowClass: "group-hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]"
    },
    {
      title: "Net Cash Flow",
      value: formatXAF(netCashFlow),
      description: netCashFlow >= 0 ? "Net surplus profit" : "Net deficit loss",
      icon: TrendingUp,
      colorClass: netCashFlow >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-amber-600 dark:text-amber-400",
      bgColorClass: netCashFlow >= 0 ? "bg-indigo-500/10" : "bg-amber-500/10",
      borderColorClass: netCashFlow >= 0 ? "hover:border-indigo-500/40" : "hover:border-amber-500/40",
      glowClass: netCashFlow >= 0 ? "group-hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]" : "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
    },
    {
      title: "Pending / Overdue",
      value: formatXAF(pendingAmount),
      description: "Outstanding invoices & commitments",
      icon: Clock,
      colorClass: "text-amber-600 dark:text-amber-400",
      bgColorClass: "bg-amber-500/10",
      borderColorClass: "hover:border-amber-500/40",
      glowClass: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
    }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants as any}
            whileHover={{ scale: 1.02, y: -4 }}
            className="w-full group"
          >
            <div className={`overflow-hidden border border-slate-200/50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl transition-all duration-300 dark:border-zinc-800/50 shadow-sm ${card.borderColorClass} ${card.glowClass}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">{card.title}</span>
                  <div className={`p-2.5 rounded-xl ${card.bgColorClass} ${card.colorClass} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{card.value}</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-zinc-500 mt-2">{card.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
