'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type Item = {
  id?: string;
  name: string;
  category: string;
  qty: number;
  unit: string;
  lowStock: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Item | null;
  onSave: (item: Item) => Promise<boolean>;
};

export default function AddEditItemDialog({ open, onOpenChange, item, onSave }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Seeds');
  const [qty, setQty] = useState(0);
  const [unit, setUnit] = useState('kg');
  const [lowStock, setLowStock] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category || 'Seeds');
      setQty(item.qty || 0);
      setUnit(item.unit || 'kg');
      setLowStock(!!item.lowStock);
    } else {
      setName('');
      setCategory('Seeds');
      setQty(0);
      setUnit('kg');
      setLowStock(false);
    }
    setErrorMsg('');
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setErrorMsg('');
    setSubmitting(true);
    const success = await onSave({
      id: item?.id,
      name,
      category,
      qty: Number(qty),
      unit,
      lowStock: lowStock || Number(qty) <= 5, // Auto alert if qty <= 5
    });
    setSubmitting(false);

    if (success) {
      onOpenChange(false);
    } else {
      setErrorMsg('Failed to save item. Please make sure your account is fully set up.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white font-extrabold text-lg">
            {item ? 'Modify Stock Item' : 'Add Stock Item'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-zinc-400">
            Define item details, current quantity levels, and set low stock warning indicators.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm p-3 rounded-lg mt-2 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Item Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NPK Fertilizer"
              className="bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="category" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 p-2 text-sm focus:outline-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 h-9"
              >
                <option value="Seeds">Seeds & Suckers</option>
                <option value="Feed">Animal Feed</option>
                <option value="Fertilizer">Fertilizer</option>
                <option value="Medicine">Medicine & Vets</option>
                <option value="Other">Other Equipment</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="unit" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Unit of Measure</Label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 p-2 text-sm focus:outline-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 h-9"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="bags">Bags</option>
                <option value="bales">Bales</option>
                <option value="bottles">Bottles</option>
                <option value="liters">Liters</option>
                <option value="pcs">Pieces (pcs)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center pt-2">
            <div className="space-y-1">
              <Label htmlFor="qty" className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Current Quantity</Label>
              <Input
                id="qty"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                placeholder="0"
                type="number"
                min="0"
                className="bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800"
                required
              />
            </div>
            <div className="flex items-center gap-2 mt-5">
              <input
                id="lowStock"
                type="checkbox"
                checked={lowStock}
                onChange={(e) => setLowStock(e.target.checked)}
                className="w-4 h-4 rounded border-slate-350 text-emerald-600 focus:ring-emerald-500"
              />
              <Label htmlFor="lowStock" className="text-xs font-bold text-slate-600 dark:text-zinc-400 cursor-pointer">Force Low Stock Alert</Label>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl w-full sm:w-auto"
            >
              {submitting ? 'Saving...' : 'Save Stock Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
