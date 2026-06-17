'use client';

import { useState } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatXAF } from "@/lib/utils";
import { Search, Filter, Trash2, ArrowUpRight, ArrowDownRight, Tag, Coins, Download, CheckCircle } from "lucide-react";
import { Transaction } from "./financial-summary";
import { motion, AnimatePresence } from "framer-motion";

interface TransactionListProps {
  transactions: Transaction[];
  categories: { id: string; name: string; type: 'income' | 'expense' }[];
  onDeleteTransaction: (id: string) => void;
  onMarkPaid?: (id: string) => void;
}

export function TransactionList({ transactions, categories, onDeleteTransaction, onMarkPaid }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Filtering Logic
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.payment_method.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || t.category?.id === categoryFilter;

    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: 'paid' | 'pending' | 'overdue') => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/20';
      case 'overdue':
        return 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400 dark:bg-rose-500/20';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'mobile_money': return 'MTN / Orange MoMo';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash';
      default: return 'Other';
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount (FCFA)', 'Status', 'Payment Method'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => 
        `"${t.date}","${t.type}","${t.category?.name || ''}","${t.description}","${t.amount}","${t.status}","${getPaymentMethodLabel(t.payment_method)}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'transactions_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white/60 dark:bg-zinc-900/60 p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 backdrop-blur-md shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <Input 
            placeholder="Search descriptions, categories..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-white/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800 rounded-xl focus-visible:ring-emerald-500"
          />
        </div>

        {/* Filter Group */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-10 w-[130px] bg-white/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-slate-200 dark:border-zinc-800 rounded-xl">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-10 w-[150px] bg-white/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-slate-200 dark:border-zinc-800 rounded-xl">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-[130px] bg-white/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-medium">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-slate-200 dark:border-zinc-800 rounded-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 h-10 px-4 ml-auto lg:ml-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200/50 hover:bg-transparent dark:border-zinc-800/50">
              <TableHead className="w-[120px] text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider pl-6 py-4">Date</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider py-4">Category</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider py-4">Description</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider py-4">Payment Mode</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider py-4">Status</TableHead>
              <TableHead className="text-right text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider pr-6 py-4">Amount</TableHead>
              <TableHead className="w-[90px] pr-6 py-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredTransactions.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-4 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500">
                        <Coins className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-300">No transactions found</h3>
                      <p className="text-sm text-slate-500 dark:text-zinc-500 max-w-sm">
                        Try modifying your filters or add a new transaction to start tracking.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((t) => (
                  <TableRow 
                    key={t.id}
                    className="border-b border-slate-100/50 hover:bg-white/80 dark:border-zinc-800/50 dark:hover:bg-zinc-800/50 transition-colors group"
                  >
                    {/* Date */}
                    <TableCell className="font-medium text-sm text-slate-900 dark:text-zinc-200 pl-6 py-4">
                      {new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    {/* Category */}
                    <TableCell className="py-4">
                      <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-zinc-300">
                        <div className={`p-1.5 rounded-md ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                          {t.type === 'income' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        </div>
                        {t.category?.name || 'Uncategorized'}
                      </span>
                    </TableCell>
                    {/* Description */}
                    <TableCell className="text-sm text-slate-600 dark:text-zinc-400 max-w-[200px] truncate py-4 font-medium">
                      {t.description || '—'}
                    </TableCell>
                    {/* Payment Mode */}
                    <TableCell className="text-sm text-slate-500 dark:text-zinc-500 py-4">
                      {getPaymentMethodLabel(t.payment_method)}
                    </TableCell>
                    {/* Status */}
                    <TableCell className="py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold border ${getStatusColor(t.status)}`}>
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </TableCell>
                    {/* Amount */}
                    <TableCell className={`text-right font-bold text-sm pr-6 py-4 ${
                      t.type === 'income' 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      <span className="inline-flex items-center gap-0.5">
                        {t.type === 'income' ? '+' : '-'}
                        {formatXAF(t.amount)}
                      </span>
                    </TableCell>
                    {/* Actions */}
                    <TableCell className="text-right pr-6 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {t.status !== 'paid' && onMarkPaid && (
                          <button 
                            onClick={() => onMarkPaid(t.id)}
                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => onDeleteTransaction(t.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
