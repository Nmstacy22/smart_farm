'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { dbService } from '../../lib/services/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, User, CheckCircle2, Circle, Clock, Trash2, Loader2, ClipboardList } from 'lucide-react';

import { useFarm } from '../../lib/hooks/useFarm';

function TaskCard({ t, currentUserRole, currentUserId, onToggle, onDelete }: { t: any, currentUserRole: string, currentUserId?: string, onToggle: (id: string) => void, onDelete: (id: string) => void }) {
  const isDone = t.status === 'done';
  const canToggle = currentUserRole !== 'worker' || t.assignee_id === currentUserId;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className={`p-5 rounded-2xl border backdrop-blur-md shadow-sm transition-all ${
        isDone 
          ? 'bg-slate-50/50 border-slate-200/50 dark:bg-zinc-900/40 dark:border-zinc-800/50 opacity-70 grayscale-[30%]' 
          : 'bg-white/80 border-emerald-100/50 dark:bg-zinc-900/80 dark:border-emerald-900/30 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.06)]'
      }`}
    >
      <div className="flex items-start gap-4">
        <button 
          onClick={() => {
            if (canToggle) onToggle(t.id);
          }}
          disabled={!canToggle}
          className={`mt-1 transition-colors ${canToggle ? 'cursor-pointer hover:text-emerald-500 dark:hover:text-emerald-400' : 'cursor-not-allowed opacity-50'} ${isDone ? 'text-emerald-500' : 'text-slate-350 dark:text-zinc-650'}`}
        >
          {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-base mb-1.5 break-words ${isDone ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-800 dark:text-slate-100'}`}>
            {t.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold">
            <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
              <User className="w-3.5 h-3.5" />
              {t.assignee}
            </div>
            {t.dueDate && (
              <div className={`flex items-center gap-1 ${isDone ? 'text-slate-400' : 'text-amber-600 dark:text-amber-400'}`}>
                <Calendar className="w-3.5 h-3.5" />
                {new Date(t.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
            isDone ? 'bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/10'
          }`}>
            {t.status === 'in_progress' ? 'doing' : t.status}
          </div>
          {currentUserRole !== 'worker' && (
            <button 
              onClick={() => onDelete(t.id)}
              className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function TasksPage() {
  const { currentUserRole, profile } = useFarm();
  const [list, setList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any[]>([]);

  async function loadData() {
    try {
      const [tasksData, teamData] = await Promise.all([
        dbService.getTasks(),
        dbService.getFarmTeam()
      ]);
      setList(tasksData);
      setTeam(teamData);
    } catch (e) {
      console.error('Failed to load tasks:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const n = { 
      title, 
      assignee_id: assigneeId || undefined, 
      due_date: dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0], 
      status: 'pending' 
    };

    // DB call
    await dbService.createTask(n);
    
    // Reset inputs
    setTitle('');
    setAssigneeId('');
    setDueDate('');
    setOpen(false);
    loadData();
  }

  async function toggleStatus(id: string) {
    const matched = list.find((t) => t.id === id);
    if (!matched) return;

    const nextStatus = matched.status === 'done' ? 'pending' : 'done';

    // Optimistic Update
    setList((s) => s.map((t) => t.id === id ? { ...t, status: nextStatus } : t));

    // Save to DB
    await dbService.updateTask(id, { status: nextStatus });
    loadData();
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      await dbService.deleteTask(id);
      loadData();
    }
  }

  const pendingTasks = useMemo(() => list.filter(t => t.status !== 'done'), [list]);
  const completedTasks = useMemo(() => list.filter(t => t.status === 'done'), [list]);

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
      <div className="space-y-8 max-w-5xl mx-auto pb-10">
        <div className="grid gap-6 rounded-[2rem] border border-slate-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl p-6 shadow-sm">
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Task Management</h1>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">Assign, track, and complete farm operations.</p>
            </div>
            <div className="flex items-center gap-3">
              {currentUserRole !== 'worker' && (
                <button 
                  onClick={() => setOpen((v) => !v)} 
                  className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {open ? 'Cancel' : 'New Task'}
                </button>
              )}
            </div>
          </header>
        </div>

        {/* Task Form Drawer */}
        <AnimatePresence>
          {open && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -20 }} 
              animate={{ opacity: 1, height: 'auto', y: 0 }} 
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="overflow-hidden"
            >
              <form onSubmit={create} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-lg mb-6 space-y-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Create New Task</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Task description (e.g. Apply pesticide to maize)" 
                    className="p-3 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-900 dark:text-white" 
                    autoFocus
                    required
                  />
                  <select 
                    value={assigneeId} 
                    onChange={(e) => setAssigneeId(e.target.value)} 
                    className="p-3 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-900 dark:text-white" 
                  >
                    <option value="">Unassigned</option>
                    {team.map((member) => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.users?.email || 'Unknown User'} ({member.role})
                      </option>
                    ))}
                  </select>
                  <input 
                    type="date"
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)} 
                    className="p-3 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-500 dark:text-zinc-400" 
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer">
                    Save Task
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Tasks Panel */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Pending ({pendingTasks.length})</h2>
            </div>
            <motion.div layout className="space-y-4">
              <AnimatePresence mode="popLayout">
                {pendingTasks.map((t) => (
                  <TaskCard key={t.id} t={t} currentUserRole={currentUserRole} currentUserId={profile?.currentUserId} onToggle={toggleStatus} onDelete={handleDelete} />
                ))}
              </AnimatePresence>
              {pendingTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center p-10 bg-slate-50/50 dark:bg-zinc-900/20 border border-dashed rounded-2xl border-slate-200 dark:border-zinc-800 text-center text-slate-400">
                  <ClipboardList className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-xs font-semibold">No pending operations logged. You are all caught up!</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Completed Tasks Panel */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
              <h2 className="text-xl font-bold text-slate-600 dark:text-slate-400">Completed ({completedTasks.length})</h2>
            </div>
            <motion.div layout className="space-y-4">
              <AnimatePresence mode="popLayout">
                {completedTasks.map((t) => (
                  <TaskCard key={t.id} t={t} currentUserRole={currentUserRole} currentUserId={profile?.currentUserId} onToggle={toggleStatus} onDelete={handleDelete} />
                ))}
              </AnimatePresence>
              {completedTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center p-10 bg-slate-50/50 dark:bg-zinc-900/20 border border-dashed rounded-2xl border-slate-200 dark:border-zinc-800 text-center text-slate-400">
                  <ClipboardList className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-xs font-semibold">No finished tasks logged for today.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
