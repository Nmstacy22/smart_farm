"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon?: LucideIcon;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ translateY: -4 }}
      className="flex min-w-[8rem] items-center gap-3 rounded-md bg-card p-3 shadow-sm"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
        {Icon ? <Icon size={18} /> : null}
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{title}</span>
        <span className="text-sm font-semibold text-card-foreground">{value}</span>
      </div>
    </motion.div>
  );
}
