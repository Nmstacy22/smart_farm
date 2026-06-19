"use client";

import React, { useState } from 'react';
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useFarm } from "../../lib/hooks/useFarm";
import { TeamManagement } from "../../components/settings/TeamManagement";
import { Loader2, Settings2, User, MapPin, Edit3, Check, X } from 'lucide-react';
import { useAuth } from "../../components/providers/AuthProvider";
import { dbService } from "../../lib/services/db";

export default function SettingsPage() {
  const { profile, team, loading, currentUserRole } = useFarm();
  const { user } = useAuth();

  const [editing, setEditing] = useState(false);
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function startEdit() {
    setFarmName(profile?.name || '');
    setFarmLocation(profile?.location || '');
    setSaveMsg(null);
    setEditing(true);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!farmName.trim()) return;
    setSaving(true);
    const ok = await dbService.updateFarmProfile({ name: farmName.trim(), location: farmLocation.trim() || undefined });
    setSaving(false);
    setSaveMsg(ok ? { ok: true, text: 'Farm profile updated!' } : { ok: false, text: 'Failed to update. Try again.' });
    if (ok) {
      setEditing(false);
      setTimeout(() => setSaveMsg(null), 3000);
      window.location.reload();
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] w-full items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto pb-10">
        <div className="grid gap-6 rounded-[2rem] border border-slate-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl p-6 shadow-sm">
          <header>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Settings</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">Manage your farm profile and team members.</p>
          </header>

          <div className="grid md:grid-cols-2 gap-8 mt-6">
            <div className="space-y-6">
              {/* Farm Profile Card */}
              <div className="bg-white/60 dark:bg-zinc-900/60 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-slate-500" />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Farm Profile</h2>
                  </div>
                  {!editing && currentUserRole !== 'worker' && (
                    <button
                      onClick={startEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>

                {editing && currentUserRole !== 'worker' ? (
                  <form onSubmit={saveEdit} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Farm Name</label>
                      <input
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        placeholder="e.g. Sunrise Farm"
                        required
                        className="mt-1 w-full p-2.5 text-sm border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Location</label>
                      <input
                        value={farmLocation}
                        onChange={(e) => setFarmLocation(e.target.value)}
                        placeholder="e.g. Buea, Cameroon"
                        className="mt-1 w-full p-2.5 text-sm border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                      >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                    {saveMsg && (
                      <p className={`text-xs font-semibold mt-1 ${saveMsg.ok ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {saveMsg.text}
                      </p>
                    )}
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Farm Name</label>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1">{profile?.name || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Location
                      </label>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1">{profile?.location || 'Not set'}</p>
                    </div>
                    {saveMsg?.ok && (
                      <p className="text-xs font-semibold text-emerald-500">{saveMsg.text}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Account Card */}
              <div className="bg-white/60 dark:bg-zinc-900/60 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-slate-500" />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Your Account</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Email</label>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Farm Role</label>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1 capitalize">{currentUserRole}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white/60 dark:bg-zinc-900/60 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50">
                {currentUserRole !== 'worker' ? (
                  <TeamManagement team={team} farmId={profile?.id} />
                ) : (
                  <div className="text-center py-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Worker Access</h3>
                    <p className="text-sm text-slate-500 mt-2">Team management features are restricted to farm owners and managers.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

