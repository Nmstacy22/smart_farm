'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type Livestock = {
  id?: string;
  name: string;
  type: string;
  count: number;
  status: 'healthy' | 'sick' | 'quarantine';
  feed: string;
  health_check: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  livestock?: Livestock | null;
  onSave: (livestock: Livestock) => Promise<boolean>;
};

export default function AddEditLivestockDialog({ open, onOpenChange, livestock, onSave }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState('Poultry');
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<'healthy' | 'sick' | 'quarantine'>('healthy');
  const [feed, setFeed] = useState('');
  const [healthCheck, setHealthCheck] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (livestock) {
      setName(livestock.name);
      setType(livestock.type || 'Poultry');
      setCount(livestock.count || 0);
      setStatus(livestock.status || 'healthy');
      setFeed(livestock.feed || '');
      setHealthCheck(livestock.health_check || new Date().toISOString().split('T')[0]);
    } else {
      setName('');
      setType('Poultry');
      setCount(0);
      setStatus('healthy');
      setFeed('');
      setHealthCheck(new Date().toISOString().split('T')[0]);
    }
    setErrorMsg('');
  }, [livestock, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setErrorMsg('');
    setSubmitting(true);
    const success = await onSave({
      id: livestock?.id,
      name,
      type,
      count: Number(count),
      status,
      feed,
      health_check: healthCheck,
    });
    setSubmitting(false);

    if (success) {
      onOpenChange(false);
    } else {
      setErrorMsg('Failed to save livestock. Please make sure your account is fully set up.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white font-extrabold text-lg">
            {livestock ? 'Edit Livestock Profile' : 'Register Livestock Herd'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-zinc-400">
            Define headcounts, feed requirements, and health check-ups for animal management.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm p-3 rounded-lg mt-2 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Herd / Batch Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Broiler Batch B"
              className="bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="type" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Animal Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 p-2 text-sm focus:outline-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 h-9"
              >
                <option value="Poultry">Poultry (Chickens, Ducks)</option>
                <option value="Cattle">Cattle (Cows, Bulls)</option>
                <option value="Goats">Goats & Sheep</option>
                <option value="Pigs">Pigs</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="count" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Head Count</Label>
              <Input
                id="count"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                placeholder="0"
                type="number"
                min="0"
                className="bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="feed" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Feed Details</Label>
            <Input
              id="feed"
              value={feed}
              onChange={(e) => setFeed(e.target.value)}
              placeholder="e.g. Grower Mash (1 bag/day)"
              className="bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="status" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Health Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 p-2 text-sm focus:outline-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 h-9"
              >
                <option value="healthy">Healthy</option>
                <option value="sick">Sick</option>
                <option value="quarantine">Quarantine</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="healthCheck" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Last Health Check</Label>
              <Input
                id="healthCheck"
                value={healthCheck}
                onChange={(e) => setHealthCheck(e.target.value)}
                type="date"
                className="bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800"
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl w-full sm:w-auto"
            >
              {submitting ? 'Saving...' : 'Save Livestock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
