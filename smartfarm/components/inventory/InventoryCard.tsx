"use client";

import { motion } from "framer-motion";
import { Box, AlertTriangle, Edit2, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";

type Item = {
  id: string;
  name: string;
  category?: string;
  qty: number;
  unit?: string;
  image?: string;
  lowStock?: boolean;
};

type Props = {
  item: Item;
  onEdit: () => void;
  onDelete: () => void;
  onQtyChange: (newQty: number) => void;
};

export default function InventoryCard({ item, onEdit, onDelete, onQtyChange }: Props) {
  const categoryColors: Record<string, string> = {
    seeds: "border-l-4 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/5",
    feed: "border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-950/5",
    fertilizer: "border-l-4 border-lime-500 bg-lime-50/50 dark:bg-lime-950/5",
    medicine: "border-l-4 border-rose-500 bg-rose-50/50 dark:bg-rose-950/5",
    other: "border-l-4 border-slate-500 bg-slate-50/50 dark:bg-slate-950/5",
  };

  const getBorderColorClass = (cat: string) => {
    const key = cat.toLowerCase();
    return categoryColors[key] || "border-l-4 border-slate-500 bg-slate-50/50 dark:bg-slate-950/5";
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`group flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 p-4 bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow-md ${getBorderColorClass(item.category || '')}`}
    >
      <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-950 border dark:border-zinc-800">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-zinc-500">
            <Box size={18} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
            {item.name}
          </div>
          
          {/* Quick Quantity Controls */}
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => onQtyChange(Math.max(0, item.qty - 1))}
              className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-600 dark:text-zinc-400 transition-colors cursor-pointer"
            >
              <Minus size={10} />
            </button>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold leading-none select-none min-w-[50px] text-center ${
              item.lowStock 
                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400"
            }`}>
              {item.qty} {item.unit ?? "pcs"}
            </span>
            <button 
              onClick={() => onQtyChange(item.qty + 1)}
              className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-600 dark:text-zinc-400 transition-colors cursor-pointer"
            >
              <Plus size={10} />
            </button>
          </div>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
          <div className="truncate text-slate-400 dark:text-zinc-500">{item.category ?? "General"}</div>
          
          <div className="flex items-center gap-2">
            {item.lowStock && (
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }} 
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="flex items-center text-rose-500 mr-1"
                title="Low Stock Alert!"
              >
                <AlertTriangle size={14} />
              </motion.div>
            )}
            
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }} 
              className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-850 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              title="Edit Item"
            >
              <Edit2 size={13} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }} 
              className="p-1 hover:bg-rose-500/10 rounded text-slate-400 hover:text-rose-500 transition-all cursor-pointer"
              title="Delete Item"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
