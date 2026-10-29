'use client';

import React, { useEffect, useState } from 'react';
import { Copy, Check, RefreshCw, UserPlus } from 'lucide-react';
import { dbService } from '../../lib/services/db';

/**
 * Shows the farm's invite code with copy and "new code" buttons. Only render this for
 * owners/managers: the get_join_code RPC refuses everyone else.
 */
export function InviteCodeCard({ compact = false }: { compact?: boolean }) {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => { dbService.getJoinCode().then(setCode); }, []);

  const copy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerate = async () => {
    if (!confirm('Create a new invite code? The current code will stop working.')) return;
    setRegenerating(true);
    const next = await dbService.regenerateJoinCode();
    if (next) setCode(next);
    setRegenerating(false);
  };

  return (
    <div>
      {!compact && (
        <div className="flex items-center gap-2 mb-1">
          <UserPlus className="w-4 h-4 text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Invite to your farm</h3>
        </div>
      )}
      <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">
        New members sign up, choose “Join a farm” and enter this code. They join as workers; you can change their role afterwards.
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 block px-3 py-2.5 text-base font-extrabold tracking-[0.2em] bg-slate-100 dark:bg-zinc-800 rounded-xl text-slate-800 dark:text-slate-100 text-center">
          {code ?? '…'}
        </code>
        <button
          onClick={copy}
          disabled={!code}
          className="p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 disabled:opacity-50 transition-colors cursor-pointer"
          title="Copy invite code"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
        <button
          onClick={regenerate}
          disabled={regenerating || !code}
          className="p-2.5 bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors cursor-pointer"
          title="Create a new code (the old one stops working)"
        >
          <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
