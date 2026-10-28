"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, ChevronDown } from "lucide-react";

export type Role = "owner" | "manager" | "worker";

export default function UserCard({
  user,
  onChangeRole,
}: {
  user: { id: string; name: string; role: Role; phone?: string };
  onChangeRole?: (id: string, role: Role) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="flex w-full items-center gap-3 overflow-hidden rounded-lg border bg-card p-3 shadow-sm"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <User size={18} />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="truncate text-sm font-semibold text-card-foreground">{user.name}</div>
            <div className="truncate text-xs text-muted-foreground">{user.phone ?? "—"}</div>
          </div>

          <div className="relative">
            <button
              onClick={() => setOpen((s) => !s)}
              className="flex items-center gap-1 rounded-md border bg-muted px-3 py-1 text-xs"
            >
              <span className="capitalize">{user.role}</span>
              <ChevronDown size={14} />
            </button>

            {open && (
              <div className="absolute right-0 top-12 z-10 w-36 rounded-md border bg-card p-2 shadow">
                {(["owner", "manager", "worker"] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onChangeRole?.(user.id, r);
                      setOpen(false);
                    }}
                    className={`block w-full cursor-pointer rounded px-2 py-1 text-left text-sm hover:bg-muted ${r === user.role ? "font-semibold" : ""}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
