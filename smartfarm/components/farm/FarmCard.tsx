"use client";

import { motion } from "framer-motion";
import { MapPin, Users, Droplet, Edit3, Trash2 } from "lucide-react";
import Image from "next/image";

type Field = {
  id: string;
  title: string;
  crop?: string;
  area?: string;
  workers?: number;
  image?: string;
  status?: 'healthy' | 'attention' | 'critical';
  moisture?: number;
};

type Props = {
  field: Field;
  onEdit: () => void;
  onDelete: () => void;
};

export default function FarmCard({ field, onEdit, onDelete }: Props) {
  const statusColors = {
    healthy: "bg-emerald-500",
    attention: "bg-amber-500",
    critical: "bg-rose-500"
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl bg-slate-900 shadow-lg border border-slate-800 transition-all hover:shadow-emerald-900/10 min-h-[220px]"
    >
      {/* Background Image / Overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={field.image || "/images/corn-field.png"} 
          alt={field.title} 
          fill
          className="object-cover opacity-35 group-hover:opacity-45 transition-opacity duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <MapPin className="text-emerald-400" size={18} />
            </div>
            <div>
              <h3 className="truncate text-base font-bold text-white tracking-tight">{field.title}</h3>
              <div className="text-xs font-medium text-emerald-300">{field.area ?? "—"}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
            <div className={`w-2 h-2 rounded-full ${statusColors[field.status || 'healthy']}`} />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{field.status || 'Healthy'}</span>
          </div>
        </div>
        
        <div className="mt-auto pt-6">
          <div className="mb-4 inline-block px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
            <span className="text-xs font-semibold text-emerald-100">Crop: {field.crop ?? "Mixed"}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm">
                <Users size={14} className="text-slate-400" />
                <span>{field.workers ?? 0}</span>
              </div>
              <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm">
                <Droplet size={14} className="text-blue-400" />
                <span>{field.moisture ?? 45}%</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Edit Field"
              >
                <Edit3 size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-all cursor-pointer"
                title="Delete Field"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
