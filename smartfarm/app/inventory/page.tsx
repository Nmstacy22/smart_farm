"use client";

import { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import AddEditItemDialog from "../../components/inventory/AddEditItemDialog";
import InventoryCard from "../../components/inventory/InventoryCard";
import { dbService } from "../../lib/services/db";
import { Plus, Box, Search, AlertTriangle, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InventoryPage() {
  const [items, setItems] = useState([] as any[]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  // Dialog states
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

  useEffect(() => {
    loadData();
  }, []);

  // Filter items based on category selection and search query
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const categoryMatch = 
        activeCategory === "All" || 
        item.category?.toLowerCase() === activeCategory.toLowerCase();
      
      const searchMatch = 
        item.name.toLowerCase().includes(q.toLowerCase()) || 
        (item.category || "").toLowerCase().includes(q.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [items, activeCategory, q]);

  // Aggregate stats
  const stats = useMemo(() => {
    const lowStockCount = items.filter((i) => i.lowStock || i.qty <= 5).length;
    return {
      totalItems: items.length,
      lowStock: lowStockCount,
    };
  }, [items]);

  // Actions
  const handleSaveItem = async (itemData: any) => {
    if (itemData.id) {
      await dbService.updateInventoryItem(itemData.id, itemData);
    } else {
      await dbService.createInventoryItem(itemData);
    }
    loadData();
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this inventory item?")) {
      await dbService.deleteInventoryItem(id);
      loadData();
    }
  };

  const handleQtyChange = async (id: string, newQty: number) => {
    // Optimistic state update
    setItems((s) => s.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          qty: newQty,
          lowStock: newQty <= 5 // Auto alert if drops below threshold
        };
      }
      return i;
    }));

    // Persist to DB
    await dbService.updateInventoryItem(id, { 
      qty: newQty, 
      lowStock: newQty <= 5 
    });
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
            { label: "Total Items logged", value: stats.totalItems, icon: Box, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Low Stock warnings", value: stats.lowStock, icon: AlertTriangle, color: stats.lowStock > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-400", bg: stats.lowStock > 0 ? "bg-rose-500/10 animate-pulse" : "bg-slate-500/10" },
            { label: "Storage Categories", value: categoriesList.length - 1, icon: Layers, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/50 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">{label}</span>
                <div className={`p-2 rounded-lg ${bg} ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</div>
            </div>
          ))}
        </div>

        {/* Low Stock Warning Banner */}
        {stats.lowStock > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl p-4 flex gap-3 items-center text-sm font-semibold">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>Attention: There are {stats.lowStock} items running low. Replenish agricultural inventory soon.</span>
          </div>
        )}

        {/* Search & Category Filter Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search stock items…"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-xl text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-950 dark:text-white"
            />
          </div>

          {/* Categories Horizontal Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  activeCategory === cat
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white/60 dark:bg-zinc-900/60 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 border-slate-200/85 dark:border-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items Listing Grid */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.section layout className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-slate-400">
                  <Box className="w-12 h-12 mb-4 opacity-30" />
                  <h3 className="text-lg font-bold text-slate-600 dark:text-zinc-400">No stock matches found</h3>
                  <p className="text-sm mt-1 text-slate-500">Try searching a different item or category.</p>
                </div>
              ) : (
                filtered.map((it) => (
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

      {/* Add / Edit Dialog */}
      <AddEditItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={selectedItem}
        onSave={handleSaveItem}
      />
    </DashboardLayout>
  );
}
