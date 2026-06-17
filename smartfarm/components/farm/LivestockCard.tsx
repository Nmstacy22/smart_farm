"use client";

import { motion } from "framer-motion";
import { Beef, CalendarClock, Wheat, Edit3, Trash2, ShieldAlert } from "lucide-react";

type Livestock = {
  id: string;
  name: string;
  type: string;
  count: number;
  status: 'healthy' | 'sick' | 'quarantine';
  feed: string;
  health_check: string;
};

type Props = {
  livestock: Livestock;
  onEdit: () => void;
  onDelete: () => void;
};

export default function LivestockCard({ livestock, onEdit, onDelete }: Props) {
  const statusColors = {
    healthy: { text: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
    sick: { text: "text-rose-400 bg-rose-500/10 border-rose-500/20", dot: "bg-rose-500" },
    quarantine: { text: "text-amber-400 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-500" },
  };

  const currentStatus = statusColors[livestock.status || 'healthy'];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800/50 shadow-sm transition-all hover:shadow-emerald-500/5 hover:border-emerald-500/20"
    >
      <div className="space-y-4">
        {/* Header: Name and status badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Beef size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">{livestock.name}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-500">{livestock.type}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${currentStatus.text}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
            <span>{livestock.status}</span>
          </div>
        </div>

        {/* Headcount */}
        <div className="bg-slate-50/50 dark:bg-zinc-950/50 rounded-xl p-3.5 border border-slate-100 dark:border-zinc-900 flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">Head Count</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{livestock.count.toLocaleString()}</span>
        </div>

        {/* Feeding details & Last checkup */}
        <div className="space-y-2.5 text-sm font-medium text-slate-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <Wheat size={15} className="text-slate-400 dark:text-zinc-500" />
            <span className="truncate" title={livestock.feed}>{livestock.feed || 'No feeding details logged'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock size={15} className="text-slate-400 dark:text-zinc-500" />
            <span>Last Vet Check: {new Date(livestock.health_check).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          </div>
        </div>
      </div>

      {/* Action panel */}
      <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-zinc-900">
        <button 
          onClick={onEdit}
          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-lg transition-colors cursor-pointer"
          title="Edit Profile"
        >
          <Edit3 size={14} />
        </button>
        <button 
          onClick={onDelete}
          className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-all cursor-pointer"
          title="Delete Batch"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.article>
  );
}
