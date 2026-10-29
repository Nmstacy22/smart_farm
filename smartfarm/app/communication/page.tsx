"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, MessageSquare, Send, Trash2, Loader2, Smartphone, Users, Pin } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { PagePanel, StatTile, EmptyState, Spinner, sectionCardClass } from "../../components/shared/PagePanel";
import SmsComposer from "../../components/communication/SmsComposer";
import { useFarm } from "../../lib/hooks/useFarm";
import { useAuth } from "../../components/providers/AuthProvider";
import { dbService } from "../../lib/services/db";
import type { FarmMessage, TeamMember } from "../../lib/types";

const POLL_MS = 20_000; // refresh the board while the tab is visible
const MAX_LENGTH = 2000; // matches the farm_messages CHECK constraint

function timeAgo(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function CommunicationPage() {
  const { user } = useAuth();
  const { team, currentUserRole, loading: farmLoading } = useFarm();
  const isManager = currentUserRole === "owner" || currentUserRole === "manager";
  const [messages, setMessages] = useState<FarmMessage[] | null>(null);
  const [loadedAt, setLoadedAt] = useState(0); // when the board was last fetched, for "this week" counts
  const [draft, setDraft] = useState("");
  const [announce, setAnnounce] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const reload = () => dbService.getMessages().then((m) => { setMessages(m); setLoadedAt(Date.now()); });
  useEffect(() => {
    reload();
    const timer = setInterval(() => { if (document.visibilityState === "visible") reload(); }, POLL_MS);
    return () => clearInterval(timer);
  }, []);

  const members = team as TeamMember[];
  const byUser = useMemo(() => Object.fromEntries(members.map((m) => [m.user_id, m])), [members]);
  const announcements = (messages || []).filter((m) => m.is_announcement).slice(0, 3);
  const feed = messages || [];
  const weekCount = feed.filter((m) => loadedAt - new Date(m.created_at).getTime() < 7 * 86400000).length;

  async function post(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = draft;
    if (!text.trim()) return;
    // Clear the box straight away so typing the next message isn't wiped when this one finishes
    setDraft("");
    setPosting(true);
    setError("");
    const ok = await dbService.postMessage(text, announce && isManager);
    setPosting(false);
    if (!ok) {
      setDraft((current) => current || text); // give the text back unless they've started a new one
      setError("Could not post your message. Try again.");
      return;
    }
    setAnnounce(false);
    reload();
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    if (await dbService.deleteMessage(id)) reload();
  }

  return (
    <DashboardLayout>
      <PagePanel title="Messages" subtitle="Keep the whole farm team informed: announcements, updates from the field and SMS alerts.">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatTile label="Messages this week" value={weekCount} icon={MessageSquare} />
          <StatTile label="Announcements" value={feed.filter((m) => m.is_announcement).length} icon={Megaphone} tone="amber" />
          <StatTile label="Team members" value={members.length} icon={Users} tone="sky" />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Pinned announcements */}
            {announcements.length > 0 && (
              <section className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                  <Pin className="w-3.5 h-3.5" /> Latest announcements
                </div>
                {announcements.map((a) => (
                  <div key={a.id} className="text-sm">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{a.body}</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{byUser[a.author_id]?.name || "Team member"} · {timeAgo(a.created_at)}</p>
                  </div>
                ))}
              </section>
            )}

            {/* Composer */}
            <form onSubmit={post} className={`${sectionCardClass} space-y-3`}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, MAX_LENGTH))}
                rows={3}
                placeholder="Share an update with the team, e.g. “Finished weeding block B. Need more fertilizer for block C.”"
                className="sf-input resize-none"
                aria-label="Message"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                {isManager ? (
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={announce} onChange={(e) => setAnnounce(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                    <Megaphone className="w-3.5 h-3.5 text-amber-500" /> Post as announcement
                  </label>
                ) : <span />}
                <button
                  type="submit"
                  disabled={posting || !draft.trim()}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-white text-sm font-bold disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post
                </button>
              </div>
              {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
            </form>

            {/* Feed */}
            <section className="space-y-3">
              {messages === null ? <Spinner /> : feed.length === 0 ? (
                <EmptyState icon={MessageSquare} title="No messages yet" detail="Post the first update. Everyone on the farm will see it here." />
              ) : (
                <AnimatePresence initial={false}>
                  {feed.map((m) => {
                    const author = byUser[m.author_id];
                    const mine = m.author_id === user?.id;
                    return (
                      <motion.article
                        key={m.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`sf-card p-4 ${m.is_announcement ? "border-amber-500/30" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{author?.name || "Former member"}</span>
                            {author && <span className="sf-pill text-slate-500 dark:text-zinc-400">{author.role}</span>}
                            {m.is_announcement && (
                              <span className="sf-pill inline-flex items-center gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                <Megaphone className="w-3 h-3" /> Announcement
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400">{timeAgo(m.created_at)}</span>
                          </div>
                          {(mine || isManager) && (
                            <button onClick={() => remove(m.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer" aria-label="Delete message">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-zinc-300 whitespace-pre-wrap break-words">{m.body}</p>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              )}
            </section>
          </div>

          {/* SMS alerts */}
          <aside className="space-y-6">
            <section className={sectionCardClass}>
              <div className="flex items-center gap-2 mb-1">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">SMS alerts</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">Reach workers in the field who aren&apos;t using the app.</p>
              {farmLoading ? <Spinner /> : isManager ? (
                <SmsComposer team={members} />
              ) : (
                <p className="text-sm text-slate-500 dark:text-zinc-400">Only farm owners and managers can send SMS. Post on the board instead.</p>
              )}
            </section>
          </aside>
        </div>
      </PagePanel>
    </DashboardLayout>
  );
}
