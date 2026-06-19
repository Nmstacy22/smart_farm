"use client";

import { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import AddEditItemDialog from "../../components/inventory/AddEditItemDialog";
import InventoryCard from "../../components/inventory/InventoryCard";
import { dbService } from "../../lib/services/db";
import { Plus, Box, Search, AlertTriangle, Layers, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categoryConfig: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  All:        { color: "text-slate-600 dark:text-zinc-300",    bg: "bg-slate-100 dark:bg-zinc-800",     border: "border-slate-200 dark:border-zinc-700",   dot: "bg-slate-400" },
  Seeds:      { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/10",                border: "border-emerald-500/30",                   dot: "bg-emerald-500" },
  Feed:       { color: "text-amber-700 dark:text-amber-400",    bg: "bg-amber-500/10",                  border: "border-amber-500/30",                     dot: "bg-amber-500" },
  Fertilizer: { color: "text-lime-700 dark:text-lime-400",      bg: "bg-lime-500/10",                   border: "border-lime-500/30",                      dot: "bg-lime-500" },
  Medicine:   { color: "text-rose-700 dark:text-rose-400",      bg: "bg-rose-500/10",                   border: "border-rose-500/30",                      dot: "bg-rose-500" },
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const cardAnim = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { ease: "easeOut" as const, duration: 0.3 } } };

export default function InventoryPage() {
  const [items, setItems] = useState([] as any[]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const data = await dbService.getInventory();
      setItems(data);
    } catch (e) {
      console.error("Failed to load inventory:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => items.filter(item => {
    const categoryMatch = activeCategory === "All" || item.category?.toLowerCase() === activeCategory.toLowerCase();
    const searchMatch = item.name.toLowerCase().includes(q.toLowerCase()) || (item.category || "").toLowerCase().includes(q.toLowerCase());
    return categoryMatch && searchMatch;
  }), [items, activeCategory, q]);

  const stats = useMemo(() => ({
    totalItems: items.length,
    lowStock: items.filter(i => i.lowStock || i.qty <= 5).length,
  }), [items]);

  const handleSaveItem = async (data: any) => {
    const res = data.id 
      ? await dbService.updateInventoryItem(data.id, data)
      : await dbService.createInventoryItem(data);
    if (res) {
      loadData();
      return true;
    }
    return false;
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Delete this inventory item?")) { await dbService.deleteInventoryItem(id); loadData(); }
  };

  const handleQtyChange = async (id: string, newQty: number) => {
    setItems(s => s.map(i => i.id === id ? { ...i, qty: newQty, lowStock: newQty <= 5 } : i));
    await dbService.updateInventoryItem(id, { qty: newQty, lowStock: newQty <= 5 });
  };

  const categoriesList = ["All", "Seeds", "Feed", "Fertilizer", "Medicine"];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div className="grid gap-6 rounded-[2rem] border border-slate-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl p-6 shadow-sm">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Inventory Management</h1>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
                Track feeds, seeds, fertilizers, and medical inputs.
              </p>
            </div>
            <button 
              onClick={() => { setSelectedItem(null); setDialogOpen(true); }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Stock Item
            </button>
          </header>

          {/* Aggregate Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Items Logged", value: stats.totalItems, icon: Box, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            { label: "Low Stock Warnings", value: stats.lowStock, icon: AlertTriangle, color: stats.lowStock > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-400", bg: stats.lowStock > 0 ? "bg-rose-500/10" : "bg-slate-500/10", border: stats.lowStock > 0 ? "border-rose-500/20" : "border-slate-200/50 dark:border-zinc-800/50" },
            { label: "Storage Categories", value: categoriesList.length - 1, icon: Layers, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <motion.div key={label} variants={cardAnim} whileHover={{ y: -3, scale: 1.02 }} className={`sf-glass p-5 border ${border} transition-all`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">{label}</span>
                <div className={`p-2 rounded-lg ${bg} ${color}`}><Icon className="w-4 h-4" /></div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Low Stock Banner ─────────────────────────── */}
        <AnimatePresence>
          {stats.lowStock > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-rose-500/8 border border-rose-500/25 text-rose-600 dark:text-rose-400 rounded-2xl p-4 flex gap-3 items-center text-sm font-semibold">
                <div className="p-2 bg-rose-500/15 rounded-lg shrink-0">
                  <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                </div>
                <span>
                  <strong>{stats.lowStock} item{stats.lowStock > 1 ? 's' : ''}</strong> running low. Replenish agricultural inventory soon to avoid shortages.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Search + Category Filter ─────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search stock items…"
              className="sf-input pl-10"
              id="inventory-search"
            />
          </div>

          {/* Color-coded category pill filters */}
          <div className="flex gap-2 flex-wrap">
            {categoriesList.map(cat => {
              const cfg = categoryConfig[cat] || categoryConfig.All;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isActive
                      ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-sm`
                      : 'bg-white/60 dark:bg-zinc-900/60 text-slate-500 dark:text-zinc-500 border-slate-200/80 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                  }`}
                  id={`inventory-cat-${cat.toLowerCase()}`}
                >
                  {isActive && cat !== 'All' && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Items Grid ──────────────────────────────── */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : (
          <motion.section layout variants={container} initial="hidden" animate="show" className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                    <Box className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-600 dark:text-zinc-400">No items found</h3>
                  <p className="text-sm mt-1 text-slate-400 dark:text-zinc-500">Try a different search term or category.</p>
                </div>
              ) : (
                filtered.map(it => (
                  <InventoryCard
                    key={it.id}
                    item={it}
                    onEdit={() => { setSelectedItem(it); setDialogOpen(true); }}
                    onDelete={() => handleDeleteItem(it.id)}
                    onQtyChange={(newQty) => handleQtyChange(it.id, newQty)}
                  />
                ))
              )}
            </AnimatePresence>
          </motion.section>
        )}
      </div>
      </div>

      <AddEditItemDialog open={dialogOpen} onOpenChange={setDialogOpen} item={selectedItem} onSave={handleSaveItem} />
    </DashboardLayout>
  );
}
