'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Send, Loader2, PhoneOff, CheckCircle2, XCircle, Info } from 'lucide-react';
import { dbService } from '../../lib/services/db';
import { PHONE_PATTERN } from '../../lib/constants';
import type { TeamMember } from '../../lib/types';

const MAX_LENGTH = 480; // must match app/api/sms/route.ts
const SEGMENT = 160;

type Result = { userId: string; name: string; status: 'sent' | 'failed' | 'no_phone'; error?: string };

/** Lets owners/managers text team members who have a phone number in their profile. */
export default function SmsComposer({ team }: { team: TeamMember[] }) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/sms').then((r) => r.json()).then((j) => setConfigured(!!j.configured)).catch(() => setConfigured(false));
  }, []);

  const reachable = useMemo(() => team.filter((m) => m.phone && PHONE_PATTERN.test(m.phone)), [team]);
  const allSelected = reachable.length > 0 && reachable.every((m) => selected.has(m.user_id));

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function send(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError('');
    setResults(null);
    try {
      const farmId = await dbService.getActiveFarmId();
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ farmId, recipientIds: [...selected], message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send');
      setResults(json.results);
      if (json.sent > 0) setMessage('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  if (configured === false) {
    return (
      <div className="rounded-2xl border border-sky-500/25 bg-sky-500/5 p-4 text-sm text-sky-700 dark:text-sky-300 flex gap-3">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <div className="font-bold">SMS is not set up yet</div>
          <div className="mt-1 text-xs leading-5">
            Add <code className="font-bold">TWILIO_ACCOUNT_SID</code>, <code className="font-bold">TWILIO_AUTH_TOKEN</code> and{' '}
            <code className="font-bold">TWILIO_FROM_NUMBER</code> to the server environment, then redeploy. The message board works without it.
          </div>
        </div>
      </div>
    );
  }

  const segments = Math.max(1, Math.ceil(message.length / SEGMENT));

  return (
    <form onSubmit={send} className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Recipients</span>
          {reachable.length > 0 && (
            <button
              type="button"
              onClick={() => setSelected(allSelected ? new Set() : new Set(reachable.map((m) => m.user_id)))}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              {allSelected ? 'Clear' : 'Select all'}
            </button>
          )}
        </div>
        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
          {team.map((m) => {
            const ok = m.phone && PHONE_PATTERN.test(m.phone);
            return (
              <label
                key={m.user_id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm ${
                  ok ? 'cursor-pointer border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900' : 'border-dashed border-slate-200 dark:border-zinc-800 opacity-60'
                }`}
              >
                <input type="checkbox" disabled={!ok} checked={selected.has(m.user_id)} onChange={() => toggle(m.user_id)} className="accent-emerald-600 w-4 h-4" />
                <span className="flex-1 min-w-0 truncate font-semibold text-slate-800 dark:text-slate-200">{m.name}</span>
                {ok ? (
                  <span className="text-xs text-slate-500 dark:text-zinc-400">{m.phone}</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400"><PhoneOff className="w-3 h-3" /> No phone</span>
                )}
              </label>
            );
          })}
        </div>
        {reachable.length < team.length && (
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2">
            Members without a phone can add one on the <Link href="/users" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">Team page</Link>.
          </p>
        )}
      </div>

      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_LENGTH))}
          rows={3}
          placeholder="e.g. Vaccination of the poultry starts 7am Friday. Please be on time."
          className="sf-input resize-none"
          aria-label="SMS message"
        />
        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>{segments} SMS per person</span>
          <span>{message.length}/{MAX_LENGTH}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={sending || configured === null || selected.size === 0 || !message.trim()}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-white text-sm font-bold disabled:opacity-50 transition-colors cursor-pointer"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Send to {selected.size} {selected.size === 1 ? 'person' : 'people'}
      </button>

      {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
      {results && (
        <ul className="space-y-1 text-xs">
          {results.map((r) => (
            <li key={r.userId} className="flex items-center gap-2">
              {r.status === 'sent' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
              <span className="font-semibold text-slate-700 dark:text-zinc-300">{r.name}</span>
              <span className="text-slate-500">{r.status === 'sent' ? 'sent' : r.status === 'no_phone' ? 'no valid phone' : r.error || 'failed'}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
