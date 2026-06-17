'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type Field = {
  id?: string;
  title: string;
  crop: string;
  area: string;
  workers: number;
  status: 'healthy' | 'attention' | 'critical';
  moisture: number;
  image?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field?: Field | null;
  onSave: (field: Field) => Promise<void>;
};

export default function AddEditFieldDialog({ open, onOpenChange, field, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [crop, setCrop] = useState('');
  const [area, setArea] = useState('');
  const [workers, setWorkers] = useState(0);
  const [status, setStatus] = useState<'healthy' | 'attention' | 'critical'>('healthy');
  const [moisture, setMoisture] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (field) {
      setTitle(field.title);
      setCrop(field.crop || '');
      setArea(field.area || '');
      setWorkers(field.workers || 0);
      setStatus(field.status || 'healthy');
      setMoisture(field.moisture || 50);
    } else {
      setTitle('');
      setCrop('');
      setArea('');
      setWorkers(0);
      setStatus('healthy');
      setMoisture(50);
    }
  }, [field, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    await onSave({
      id: field?.id,
      title,
      crop,
      area: area.includes('ha') ? area : `${area} ha`,
      workers: Number(workers),
      status,
      moisture: Number(moisture),
      image: field?.image || '/images/corn-field.png'
    });
    setSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white font-extrabold text-lg">
            {field ? 'Edit Field Settings' : 'Register New Field'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-zinc-400">
            Provide the dimensions, crops, and initial tracking state for the farm plot.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="title" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Field Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. North Orchard"
              className="bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="crop" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Active Crop</Label>
              <Input
                id="crop"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder="e.g. Cassava"
                className="bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="area" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Area Size (ha)</Label>
              <Input
                id="area"
                value={area.replace(' ha', '')}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. 1.2"
                type="number"
                step="0.1"
                className="bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="workers" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Active Workers</Label>
              <Input
                id="workers"
                value={workers}
                onChange={(e) => setWorkers(Number(e.target.value))}
                placeholder="0"
                type="number"
                min="0"
                className="bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="moisture" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Moisture (%)</Label>
              <Input
                id="moisture"
                value={moisture}
                onChange={(e) => setMoisture(Number(e.target.value))}
                placeholder="50"
                type="number"
                min="0"
                max="100"
                className="bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="status" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Health Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 p-2 text-sm focus:outline-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
            >
              <option value="healthy">Healthy</option>
              <option value="attention">Needs Attention</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl w-full sm:w-auto"
            >
              {submitting ? 'Saving...' : 'Save Field'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
