"use client";

import React from 'react';
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useFarm } from "../../lib/hooks/useFarm";
import { TeamManagement } from "../../components/settings/TeamManagement";
import { Loader2, Settings2, User } from 'lucide-react';
import { useAuth } from "../../components/providers/AuthProvider";

export default function SettingsPage() {
  const { profile, team, loading } = useFarm();
  const { user } = useAuth();

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
              <div className="bg-white/60 dark:bg-zinc-900/60 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50">
                <div className="flex items-center gap-2 mb-4">
                  <Settings2 className="w-5 h-5 text-slate-500" />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Farm Profile</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Farm Name</label>
                    <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">{profile?.name || 'Loading...'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-zinc-900/60 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-slate-500" />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Your Account</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Email</label>
                    <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Role</label>
                    <p className="font-medium text-slate-900 dark:text-slate-100 mt-1 capitalize">{user?.role || 'Farm Owner'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white/60 dark:bg-zinc-900/60 p-6 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50">
                <TeamManagement team={team} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
