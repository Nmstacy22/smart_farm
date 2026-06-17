'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/providers/AuthProvider';
import { Sprout, Lock, Mail, ArrowRight, AlertCircle, Info, ShieldCheck, Sparkles, Globe } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setError(null);
    setSubmitting(true);
    const res = await signIn(email, password);
    if (res.error) {
      setError(res.error);
      setSubmitting(false);
    } else {
      router.replace('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 font-sans text-slate-100 overflow-hidden">
      
      {/* Background visual graphics */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{
            scale: [1, 1.1, 0.95, 1],
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[15%] left-[10%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[100px]"
        />
        <motion.div 
          animate={{
            scale: [1, 0.9, 1.15, 1],
            x: [0, -40, 30, 0],
            y: [0, 40, -30, 0]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[120px]"
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6 py-12"
      >
        {/* Logo Container */}
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 border border-emerald-400 shadow-lg shadow-emerald-500/30 mb-4"
          >
            <Sprout className="h-8 w-8 text-slate-950" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-1.5 font-medium">Access your intelligent farming dashboard</p>
        </div>


        {/* Card Form */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-medium placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-medium placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50 transition-all text-sm mt-8"
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

          <div className="mt-6 space-y-4">
            <div className="text-center text-sm">
              <span className="text-slate-500">Need a new account? </span>
              <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                Register here
              </Link>
            </div>
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 text-slate-300 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm font-semibold text-white">SmartFarm highlights</p>
                  <p className="text-xs text-slate-500">Powered by motion, modern visuals, and fast auth.</p>
                </div>
                <Link href="/landing" className="text-emerald-300 text-xs font-semibold hover:text-emerald-200">
                  Learn More
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-white">Secure sign in</p>
                    <p className="text-sm text-slate-400">Supabase-backed login for secure farm access.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-1 h-5 w-5 text-sky-400" />
                  <div>
                    <p className="font-semibold text-white">Animated experience</p>
                    <p className="text-sm text-slate-400">Every screen uses subtle motion and polished layout for clarity.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="mt-1 h-5 w-5 text-violet-400" />
                  <div>
                    <p className="font-semibold text-white">Farm-ready overview</p>
                    <p className="text-sm text-slate-400">See your farm story before you sign in with the landing page.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
