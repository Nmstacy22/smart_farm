'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, UserPlus, Plus, Loader2 } from 'lucide-react';
import { dbService } from '../../lib/services/db';

export default function OnboardingView() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [joinCode, setJoinCode] = useState('');
  const [farmName, setFarmName] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setLoading(true);
    setError('');
    
    const res = await dbService.joinFarm(joinCode.trim());
    if (res.success) {
      window.location.reload();
    } else {
      setError(res.error || 'Failed to join farm');
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) return;
    setLoading(true);
    setError('');
    
    const res = await dbService.createFarm(farmName.trim());
    if (res?.id) {
      window.location.reload();
    } else {
      setError('Failed to create farm');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100vh] flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-4xl w-full"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">Welcome to SmartFarm</h1>
          <p className="text-lg text-slate-500 dark:text-zinc-400 max-w-xl mx-auto font-medium">
            You are not currently linked to any farm. Please choose an option below to get started.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Join Farm Card */}
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
              <UserPlus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Join a Farm</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
              Have an invite code from your farm owner? Enter it below to join their team as a worker.
            </p>
            <form onSubmit={handleJoin} className="space-y-4">
              <input
                type="text"
                placeholder="Enter Farm Join Code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                disabled={loading}
                className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-medium"
                required
              />
              <button
                type="submit"
                disabled={loading || !joinCode.trim()}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Farm'}
              </button>
            </form>
          </div>

          {/* Create Farm Card */}
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 shadow-xl shadow-emerald-500/5 dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sprout className="w-32 h-32 text-emerald-500" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Plus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Create New Farm</h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
                Are you a farm owner? Create a new farm workspace to manage your crops, livestock, and team.
              </p>
              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  type="text"
                  placeholder="e.g. Sunrise Acres"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  disabled={loading}
                  className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border border-emerald-100 dark:border-emerald-900/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-sm font-medium"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !farmName.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Farm'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-6 text-center max-w-md mx-auto p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold border border-rose-100 dark:border-rose-500/20"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
