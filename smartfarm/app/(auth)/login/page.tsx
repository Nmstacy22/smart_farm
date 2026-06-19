'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/providers/AuthProvider';
import {
  Sprout, Lock, Mail, ArrowRight, AlertCircle,
  ShieldCheck, Sparkles, Globe, Wheat, BarChart3, Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  useEffect(() => {
    try { document.title = 'Sign In — SmartFarm'; } catch (_) {}
  }, []);

  useEffect(() => {
    try { document.title = 'Sign In — SmartFarm'; } catch (_) {}
  }, []);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (!isValidEmail(email)) { setError('Enter a valid email address'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError(null);
    setSubmitting(true);
    const res = await signIn(email, password);
    if (res.error) { setError(res.error); setSubmitting(false); }
    else { router.replace('/dashboard'); }
  };

  return (
    /* ── Full-viewport shell ── */
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans text-slate-100 overflow-hidden bg-slate-950">

      {/* ── Full-viewport gradient backdrop ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Static radial spots */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.18),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(79,70,229,0.16),transparent_40%)]" />
        {/* Animated glow orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-emerald-500/14 blur-[160px]"
        />
        <motion.div
          animate={{ scale: [1, 0.9, 1.15, 1], x: [0, -40, 20, 0], y: [0, 40, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full bg-indigo-500/12 blur-[150px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 0.95, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-teal-400/6 blur-[120px]"
        />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      {/* ── Page content (above backdrop) ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-12 flex items-center justify-center gap-12 lg:gap-16">

        {/* ── LEFT: branding panel (desktop only) ── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="hidden lg:flex flex-col gap-8 flex-1 max-w-sm"
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
              Manage your farm<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">smarter, faster.</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Sign in to access your fields, financials, and farm team — all in one dashboard.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              { icon: Wheat, label: 'Crop & Field Management', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { icon: BarChart3, label: 'Financial Analytics', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
              { icon: Users, label: 'Worker Task Tracking', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
            ].map(({ icon: Icon, label, color, bg }) => (
              <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} backdrop-blur-sm`}>
                <Icon className={`w-5 h-5 ${color} shrink-0`} />
                <span className="text-sm font-semibold text-slate-200">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secured with Supabase authentication</span>
          </div>
        </motion.div>

        {/* ── RIGHT: auth card ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="w-full max-w-md"
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
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome back</h2>
              <p className="text-sm text-slate-400">Sign in to your SmartFarm account to continue.</p>
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

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="login-email"
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
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-700 rounded-xl text-sm font-medium placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/60 outline-none transition-all text-white"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={submitting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-extrabold py-3.5 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 transition-all text-sm mt-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col gap-3 text-center text-sm">
              <p className="text-slate-500">
                Need a new account?{' '}
                <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                  Register here
                </Link>
              </p>
              <Link
                href="/landing"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                Learn more about SmartFarm
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
