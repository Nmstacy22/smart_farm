"use client";

import React, { useState } from 'react';
import { dbService } from '../../lib/services/db';
import { Copy, Check, UserPlus, Loader2 } from 'lucide-react';

export function TeamManagement({ team, farmId }: { team: any[], farmId?: string }) {
  const [copied, setCopied] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  const handleCopy = () => {
    if (!farmId) return;
    navigator.clipboard.writeText(farmId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    
    setIsJoining(true);
    setJoinError('');
    setJoinSuccess('');
    
    const { success, error } = await dbService.joinFarm(joinCodeInput.trim());
    
    if (success) {
      setJoinSuccess('Successfully joined farm! Refreshing...');
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setJoinError(error || 'Failed to join farm');
    }
    setIsJoining(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Farm Team</h3>
        {team.length === 0 ? (
          <p className="text-sm text-slate-500 mt-2">No team members linked.</p>
        ) : (
          <div className="grid gap-3 mt-4">
            {team.map((member, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{member.users?.email || 'Unknown User'}</p>
                  <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-6">
        {/* Invite others (owners share their code) */}
        {farmId && (
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Invite Members</h4>
            <p className="text-xs text-slate-500 mb-2">Share this code with others so they can join your farm.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 block p-2 text-xs bg-slate-100 dark:bg-zinc-800 rounded-lg text-slate-800 dark:text-slate-300 overflow-x-auto whitespace-nowrap">
                {farmId}
              </code>
              <button 
                onClick={handleCopy}
                className="p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                title="Copy Join Code"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Join a farm */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Join a Farm</h4>
          <p className="text-xs text-slate-500 mb-2">Enter a farm code to join an existing farm as a worker.</p>
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              placeholder="Paste farm code here..."
              className="flex-1 p-2 text-xs border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={isJoining || !joinCodeInput.trim()}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isJoining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              Join
            </button>
          </form>
          {joinError && <p className="text-xs text-rose-500 mt-1.5 font-medium">{joinError}</p>}
          {joinSuccess && <p className="text-xs text-emerald-600 mt-1.5 font-medium">{joinSuccess}</p>}
        </div>
      </div>
    </div>
  );
}
