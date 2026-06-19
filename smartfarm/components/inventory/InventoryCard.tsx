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

const categoryStyles: Record<string, { accent: string; badge: string; badgeText: string; icon: string }> = {
  seeds:      { accent: "border-l-emerald-500",  badge: "bg-emerald-500/10 border-emerald-500/20", badgeText: "text-emerald-700 dark:text-emerald-400", icon: "🌱" },
  feed:       { accent: "border-l-amber-500",    badge: "bg-amber-500/10 border-amber-500/20",    badgeText: "text-amber-700 dark:text-amber-400",    icon: "🌾" },
  fertilizer: { accent: "border-l-lime-500",     badge: "bg-lime-500/10 border-lime-500/20",      badgeText: "text-lime-700 dark:text-lime-400",      icon: "🧪" },
  medicine:   { accent: "border-l-rose-500",     badge: "bg-rose-500/10 border-rose-500/20",      badgeText: "text-rose-700 dark:text-rose-400",      icon: "💊" },
};

const defaultStyle = { accent: "border-l-slate-400", badge: "bg-slate-500/10 border-slate-500/20", badgeText: "text-slate-600 dark:text-zinc-400", icon: "📦" };

export default function InventoryCard({ item, onEdit, onDelete, onQtyChange }: Props) {
  const catKey = (item.category || "").toLowerCase();
  const style = categoryStyles[catKey] || defaultStyle;
  const isLow = item.lowStock || item.qty <= 5;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className={`group relative flex w-full flex-col overflow-hidden rounded-2xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-slate-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-all border-l-4 ${style.accent}`}
    >
      {/* Low-stock glow strip */}
      {isLow && (
        <div className="absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r from-rose-500/0 via-rose-500/70 to-rose-500/0" />
      )}

      <div className="p-4 flex flex-col gap-3">
        {/* Top row: image + name + category badge */}
        <div className="flex items-start gap-3">
          <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/60 dark:border-zinc-700/60 text-2xl">
            {item.image ? (
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            ) : (
              <span>{style.icon}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
                {item.name}
              </h3>
              {isLow && (
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  title="Low Stock Alert!"
                  className="shrink-0"
                >
                  <AlertTriangle size={14} className="text-rose-500" />
                </motion.div>
              )}
            </div>

            {/* Category badge */}
            <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${style.badge} ${style.badgeText}`}>
              {item.category || "General"}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 dark:bg-zinc-800" />

        {/* Bottom row: qty controls + actions */}
        <div className="flex items-center justify-between gap-3">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQtyChange(Math.max(0, item.qty - 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 transition-colors cursor-pointer"
            >
              <Minus size={11} />
            </button>

            <div className={`px-3 py-1 rounded-full text-xs font-bold border min-w-[60px] text-center ${
              isLow
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
            }`}>
              {item.qty} {item.unit ?? "pcs"}
            </div>

            <button
              onClick={() => onQtyChange(item.qty + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 transition-colors cursor-pointer"
            >
              <Plus size={11} />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer"
              title="Edit Item"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all cursor-pointer"
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
