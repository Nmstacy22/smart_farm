'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { MarketPrice } from '../../lib/types';

// Common crops and markets in Cameroon, offered as suggestions (free text is still allowed)
const COMMODITIES = ['Maize', 'Cassava', 'Cocoa', 'Coffee', 'Plantain', 'Banana', 'Beans', 'Groundnut', 'Irish potato', 'Tomato', 'Rice', 'Yam', 'Cocoyam', 'Palm oil', 'Pepper', 'Onion', 'Eggs', 'Live chicken', 'Pork'];
const MARKETS = ['Muea', 'Buea', 'Limbe', 'Mutengene', 'Kumba', 'Douala – Sandaga', 'Douala – Marché Central', 'Bamenda', 'Yaoundé – Mokolo'];
const UNITS = ['kg', 'bag (50 kg)', 'bag (100 kg)', 'bunch', 'basin', 'bucket', 'litre', 'crate', 'tray (30)', 'head', 'tonne'];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knownMarkets: string[];
  defaults?: { commodity?: string; unit?: string };
  onSave: (entry: Omit<MarketPrice, 'id' | 'recorded_by'>) => Promise<boolean>;
};

const today = () => new Date().toISOString().slice(0, 10);
const labelClass = 'text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider';
const fieldClass = 'bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800';

export default function AddMarketPriceDialog({ open, onOpenChange, knownMarkets, defaults, onSave }: Props) {
  // The parent remounts the dialog (via `key`) each time it opens, so initial state is fresh
  const [commodity, setCommodity] = useState(defaults?.commodity || '');
  const [market, setMarket] = useState('');
  const [unit, setUnit] = useState(defaults?.unit || 'kg');
  const [price, setPrice] = useState('');
  const [observedOn, setObservedOn] = useState(today());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const markets = [...new Set([...knownMarkets, ...MARKETS])];

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = Number(price);
    if (!commodity.trim() || !Number.isFinite(value) || value < 0) {
      setErrorMsg('Enter a crop and a valid price.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    const ok = await onSave({ commodity: commodity.trim(), market: market.trim() || null, unit, price: value, currency: 'XAF', observed_on: observedOn, notes: notes.trim() || null });
    setSubmitting(false);
    if (ok) onOpenChange(false);
    else setErrorMsg('Could not save this price. Please try again.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-white dark:bg-zinc-900 border dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white font-extrabold text-lg">Record Market Price</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-zinc-400">
            Log a price you saw or were offered, so the team can follow trends and pick the best market.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm p-3 rounded-lg font-medium">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="mp-commodity" className={labelClass}>Crop / Product</Label>
              <Input id="mp-commodity" list="mp-commodities" value={commodity} onChange={(e) => setCommodity(e.target.value)} placeholder="e.g. Maize" className={fieldClass} required />
              <datalist id="mp-commodities">{COMMODITIES.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div className="space-y-1">
              <Label htmlFor="mp-market" className={labelClass}>Market</Label>
              <Input id="mp-market" list="mp-markets" value={market} onChange={(e) => setMarket(e.target.value)} placeholder="e.g. Muea" className={fieldClass} />
              <datalist id="mp-markets">{markets.map((m) => <option key={m} value={m} />)}</datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="mp-price" className={labelClass}>Price (FCFA)</Label>
              <Input id="mp-price" type="number" min="0" step="1" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 250" className={fieldClass} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mp-unit" className={labelClass}>Per</Label>
              <select
                id="mp-unit" value={unit} onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 p-2 text-sm focus:outline-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 h-9"
              >
                {[...new Set([unit, ...UNITS])].map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="mp-date" className={labelClass}>Date seen</Label>
            <Input id="mp-date" type="date" max={today()} value={observedOn} onChange={(e) => setObservedOn(e.target.value)} className={fieldClass} required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="mp-notes" className={labelClass}>Notes</Label>
            <Input id="mp-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Quality, buyer, quantity…" className={fieldClass} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              {submitting ? 'Saving…' : 'Save Price'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
