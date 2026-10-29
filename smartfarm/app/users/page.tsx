"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ShieldCheck, HardHat, PhoneOff, Phone, Mail, LogOut, Trash2, Loader2, Check, UserCircle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { PagePanel, StatTile, Spinner, sectionCardClass } from "../../components/shared/PagePanel";
import { InviteCodeCard } from "../../components/team/InviteCodeCard";
import { useFarm } from "../../lib/hooks/useFarm";
import { useAuth } from "../../components/providers/AuthProvider";
import { dbService } from "../../lib/services/db";
import { PHONE_PATTERN } from "../../lib/constants";
import type { TeamMember, TeamRole } from "../../lib/types";

const ROLE_STYLE: Record<TeamRole, string> = {
  owner: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  manager: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
  worker: "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700",
};
const ROLE_HELP: Record<TeamRole, string> = {
  owner: "Full control, including deleting the farm and naming other owners.",
  manager: "Runs day-to-day work, finances and the team (except owners).",
  worker: "Records field work, livestock, stock and tasks. No finance access.",
};

/** Roles the signed-in user may assign to this member (empty = no control). Mirrors the RLS rules. */
function assignableRoles(myRole: string, member: TeamMember, isSelf: boolean): TeamRole[] {
  if (isSelf) return myRole === "owner" ? ["owner", "manager", "worker"] : [];
  if (myRole === "owner") return ["owner", "manager", "worker"];
  if (myRole === "manager" && member.role !== "owner") return ["manager", "worker"];
  return [];
}

const initials = (name: string) => name.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

function MyProfileCard({ onSaved }: { onSaved: () => void }) {
  const [profile, setProfile] = useState<{ full_name: string; phone: string; email: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { dbService.getMyProfile().then(setProfile); }, []);

  async function save(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    const phone = profile.phone.replace(/[\s-]/g, "");
    if (phone && !PHONE_PATTERN.test(phone)) {
      setMessage({ ok: false, text: "Use international format, e.g. +237650000000" });
      return;
    }
    setSaving(true);
    const ok = await dbService.updateMyProfile({ full_name: profile.full_name, phone });
    setSaving(false);
    setMessage(ok ? { ok: true, text: "Saved" } : { ok: false, text: "Could not save. Try again." });
    if (ok) onSaved();
  }

  if (!profile) return <section className={sectionCardClass}><Spinner /></section>;

  return (
    <section className={sectionCardClass}>
      <div className="flex items-center gap-2 mb-1">
        <UserCircle className="w-4 h-4 text-emerald-500" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Your contact details</h3>
      </div>
      <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">Your teammates see these. Managers use your phone number for SMS alerts.</p>
      <form onSubmit={save} className="space-y-3">
        <input className="sf-input" placeholder="Full name" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} aria-label="Full name" />
        <input className="sf-input" placeholder="Phone, e.g. +237650000000" inputMode="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} aria-label="Phone number" />
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors cursor-pointer">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
          </button>
          {message && <span className={`text-xs font-semibold ${message.ok ? "text-emerald-500" : "text-rose-500"}`}>{message.text}</span>}
        </div>
      </form>
    </section>
  );
}

export default function TeamPage() {
  const { user } = useAuth();
  const { currentUserRole, loading: farmLoading } = useFarm();
  const isManager = currentUserRole === "owner" || currentUserRole === "manager";
  const [team, setTeam] = useState<TeamMember[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const reload = () => dbService.getFarmTeam().then(setTeam);
  useEffect(() => { reload(); }, []);

  const stats = useMemo(() => ({
    total: team?.length ?? 0,
    leads: team?.filter((m) => m.role !== "worker").length ?? 0,
    workers: team?.filter((m) => m.role === "worker").length ?? 0,
    noPhone: team?.filter((m) => !m.phone).length ?? 0,
  }), [team]);

  async function changeRole(member: TeamMember, role: TeamRole) {
    if (role === member.role) return;
    if (role === "owner" && !confirm(`Make ${member.name} an owner? Owners have full control of the farm.`)) return;
    setBusyId(member.id);
    setError("");
    const res = await dbService.updateMemberRole(member.user_id, role);
    if (!res.success) setError(res.error || "Could not change role.");
    await reload();
    setBusyId(null);
    // Changing your own role changes what you can see; reload the app
    if (res.success && member.user_id === user?.id) window.location.reload();
  }

  async function remove(member: TeamMember) {
    const isSelf = member.user_id === user?.id;
    if (!confirm(isSelf ? "Leave this farm? You will need a new invite code to rejoin." : `Remove ${member.name} from the farm?`)) return;
    setBusyId(member.id);
    setError("");
    const res = await dbService.removeMember(member.user_id);
    if (!res.success) {
      setError(res.error || "Could not remove member.");
      setBusyId(null);
      return;
    }
    if (isSelf) {
      try { localStorage.removeItem("active_farm_id"); } catch { /* storage unavailable */ }
      window.location.href = "/dashboard";
      return;
    }
    await reload();
    setBusyId(null);
  }

  return (
    <DashboardLayout>
      <PagePanel title="Team" subtitle="Everyone working on this farm, their roles and how to reach them.">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile label="Members" value={stats.total} icon={Users} />
          <StatTile label="Owners & managers" value={stats.leads} icon={ShieldCheck} tone="sky" />
          <StatTile label="Workers" value={stats.workers} icon={HardHat} tone="violet" />
          <StatTile label="Missing phone" value={stats.noPhone} hint="Can't receive SMS" icon={PhoneOff} tone={stats.noPhone > 0 ? "amber" : "slate"} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-6 lg:order-2">
            {!farmLoading && isManager && (
              <section className={sectionCardClass}><InviteCodeCard /></section>
            )}
            <MyProfileCard onSaved={reload} />
            <section className={`${sectionCardClass} space-y-3`}>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">What each role can do</h3>
              {(["owner", "manager", "worker"] as TeamRole[]).map((r) => (
                <div key={r} className="flex gap-3 items-start">
                  <span className={`sf-pill shrink-0 ${ROLE_STYLE[r]}`}>{r}</span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">{ROLE_HELP[r]}</span>
                </div>
              ))}
            </section>
          </div>

          <section className="lg:col-span-2 lg:order-1 space-y-3">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-3 text-sm font-semibold text-rose-600 dark:text-rose-400">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {team === null || farmLoading ? <Spinner /> : team.map((m) => {
              const isSelf = m.user_id === user?.id;
              const roles = assignableRoles(currentUserRole, m, isSelf);
              const canRemove = isSelf || (isManager && (m.role !== "owner" || currentUserRole === "owner"));
              return (
                <motion.article
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sf-card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-extrabold shrink-0">
                      {initials(m.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white truncate">{m.name}</span>
                        {isSelf && <span className="text-[10px] font-bold text-slate-400 uppercase">You</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        {m.email && <span className="inline-flex items-center gap-1 truncate"><Mail className="w-3 h-3" />{m.email}</span>}
                        <span className={`inline-flex items-center gap-1 ${m.phone ? "" : "text-amber-600 dark:text-amber-400"}`}>
                          {m.phone ? <Phone className="w-3 h-3" /> : <PhoneOff className="w-3 h-3" />}{m.phone || "No phone"}
                        </span>
                        <span>Joined {new Date(m.joined_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    {busyId === m.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                    ) : roles.length > 0 ? (
                      <select
                        value={m.role}
                        onChange={(e) => changeRole(m, e.target.value as TeamRole)}
                        aria-label={`Role for ${m.name}`}
                        className={`sf-pill py-1.5 pr-6 cursor-pointer ${ROLE_STYLE[m.role]}`}
                      >
                        {[...new Set([m.role, ...roles])].map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    ) : (
                      <span className={`sf-pill ${ROLE_STYLE[m.role]}`}>{m.role}</span>
                    )}
                    {canRemove && busyId !== m.id && (
                      <button
                        onClick={() => remove(m)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title={isSelf ? "Leave farm" : "Remove from farm"}
                        aria-label={isSelf ? "Leave farm" : `Remove ${m.name}`}
                      >
                        {isSelf ? <LogOut className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </section>
        </div>
      </PagePanel>
    </DashboardLayout>
  );
}
