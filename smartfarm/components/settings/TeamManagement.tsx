"use client";

import React from 'react';

export function TeamManagement({ team }: { team: any[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Farm Team</h3>
      {team.length === 0 ? (
        <p className="text-sm text-slate-500">No team members linked.</p>
      ) : (
        <div className="grid gap-4">
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
  );
}
