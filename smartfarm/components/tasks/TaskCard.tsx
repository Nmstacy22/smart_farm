"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Circle, Clock, User } from "lucide-react";

type Task = {
  id: string;
  title: string;
  due?: string;
  assignee?: string;
  priority?: "low" | "medium" | "high";
  completed?: boolean;
};

export default function TaskCard({ task }: { task: Task }) {
  const [done, setDone] = useState(!!task.completed);

  const priorityColor =
    task.priority === "high" ? "bg-destructive text-background" : task.priority === "medium" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      className="flex w-full items-start gap-3 overflow-hidden rounded-lg border bg-card p-3 shadow-sm"
    >
      <button
        onClick={() => setDone(!done)}
        aria-label={done ? "Mark incomplete" : "Mark complete"}
        className="flex h-10 w-10 items-center justify-center rounded-md bg-muted"
      >
        {done ? <CheckCircle size={20} className="text-primary" /> : <Circle size={18} className="text-muted-foreground" />}
      </button>

      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className={`truncate text-sm font-semibold ${done ? "line-through text-muted-foreground" : "text-card-foreground"}`}>{task.title}</h4>
          <div className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor}`}>{task.priority ?? "low"}</div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <User size={14} />
            <span className="truncate">{task.assignee ?? "Unassigned"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>{task.due ?? "No due"}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
