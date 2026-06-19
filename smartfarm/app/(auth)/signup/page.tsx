'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../components/providers/AuthProvider';
import {
  Sprout, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck,
  Sparkles, Globe, Wheat, BarChart3, Users, CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const benefits = [
  { icon: Wheat, label: 'Track crops & fields in real time', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: BarChart3, label: 'Monitor income & expenses (FCFA)', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  { icon: Users, label: 'Assign tasks to your farm team', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  { icon: CheckCircle, label: 'Low stock alerts & inventory control', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
];

export default function SignupPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isPasswordStrong = (v: string) => v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v);

  useEffect(() => {
    try { document.title = 'Sign Up — SmartFarm'; } catch (_) {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) { setError('Please fill in all fields'); return; }
    if (!isValidEmail(email)) { setError('Please enter a valid email address'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (!isPasswordStrong(password)) { setError('Password must be 8+ characters with at least one uppercase letter and one number'); return; }
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);
    const res = await signUp(email, password);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccessMessage(res.message || 'Account created! Please confirm your email before signing in.');
      setEmail(''); setPassword(''); setConfirmPassword('');
    }
    setSubmitting(false);
  };

  return (
    /* ── Full-viewport shell ── */
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans text-slate-100 overflow-hidden bg-slate-950">

      {/* ── Full-viewport gradient backdrop ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Static radial spots */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.18),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(79,70,229,0.16),transparent_40%)]" />
        {/* Animated glow orbs */}
        <motion.div
          animate={{ scale: [1, 1.1, 0.95, 1], x: [0, -30, 20, 0], y: [0, 20, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -right-24 w-[560px] h-[560px] rounded-full bg-emerald-500/14 blur-[160px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 0.9, 1], x: [0, 40, -20, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-36 -left-36 w-[520px] h-[520px] rounded-full bg-indigo-500/12 blur-[150px]"
        />
        <motion.div
          animate={{ scale: [1, 0.85, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[280px] h-[280px] rounded-full bg-teal-400/6 blur-[100px]"
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      {/* ── Page content (above backdrop) ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-12 flex items-center justify-center gap-12 lg:gap-16">

        {/* ── LEFT: auth card ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md order-2 lg:order-1"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-6 justify-center">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
              <Sprout className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-lg font-extrabold text-white">SmartFarm</span>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/60 rounded-3xl shadow-2xl shadow-black/50 p-8">
            {/* ── Card title ── */}
            <div className="mb-7 space-y-1">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Create your account</h2>
              <p className="text-sm text-slate-400">Join SmartFarm and take control of your farm operations.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Error banner */}
              {error && (
                <div
                  role="alert"
                  aria-live="assertive"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', color: '#fca5a5', fontSize: '14px', fontWeight: 500 }}
                >
                  <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, color: '#f87171' }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Success banner */}
              {successMessage && (
                <div
                  role="alert"
                  aria-live="assertive"
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', fontSize: '14px', fontWeight: 500 }}
                >
                  <ShieldCheck style={{ width: 16, height: 16, flexShrink: 0, color: '#34d399' }} />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700 rounded-xl text-sm font-medium placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60 outline-none transition-all text-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700 rounded-xl text-sm font-medium placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60 outline-none transition-all text-white"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="signup-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700 rounded-xl text-sm font-medium placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60 outline-none transition-all text-white"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                id="signup-submit"
                type="submit"
                disabled={submitting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-extrabold py-3.5 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 transition-all text-sm mt-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col gap-3 text-center text-sm">
              <p className="text-slate-500">
                Already registered?{' '}
                <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                  Sign in here
                </Link>
              </p>
              <Link
                href="/landing"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                Explore SmartFarm features
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT: branding panel (desktop only) ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          className="hidden lg:flex flex-col gap-8 flex-1 max-w-sm order-1 lg:order-2"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-white tracking-tight">SmartFarm</p>
              <p className="text-xs text-slate-400 font-medium">Farm Intelligence Platform</p>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
              Your farm,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">fully connected.</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Create your account and start managing everything from crop cycles to financials in one powerful platform.
            </p>
          </div>

          {/* Benefit list */}
          <div className="space-y-3">
            {benefits.map(({ icon: Icon, label, color, bg }) => (
              <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} backdrop-blur-sm`}>
                <Icon className={`w-5 h-5 ${color} shrink-0`} />
                <span className="text-sm font-semibold text-slate-200">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Free to get started — no credit card required</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
