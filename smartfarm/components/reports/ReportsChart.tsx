"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

export function RevenueTrend({ data }: { data: any[] }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-56 w-full rounded-lg bg-card p-3 shadow-sm">
      <h3 className="mb-2 text-sm font-medium text-card-foreground">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip />
          <Line type="monotone" dataKey="revenue" stroke="var(--chart-2)" strokeWidth={3} dot={{ r: 3 }} animationDuration={800} />
          <Line type="monotone" dataKey="expenses" stroke="var(--chart-4)" strokeWidth={2} dot={{ r: 2 }} animationDuration={800} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function InventoryDistribution({ data }: { data: any[] }) {
  const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-56 w-full rounded-lg bg-card p-3 shadow-sm">
      <h3 className="mb-2 text-sm font-medium text-card-foreground">Inventory Distribution</h3>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
