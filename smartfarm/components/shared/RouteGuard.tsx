'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import { Sprout } from 'lucide-react';
import { motion } from 'framer-motion';

const PUBLIC_PATHS = ['/', '/landing', '/login', '/signup'];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublic) {
        router.replace('/login');
      } else if (user && isPublic) {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, isPublic, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-900 text-white font-sans">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 mb-4"
        >
          <Sprout className="h-10 w-10 text-emerald-400" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg font-bold tracking-tight text-slate-100"
        >
          SmartFarm
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.8 }}
          className="text-xs mt-1 text-slate-400 font-medium"
        >
          Securing farm console...
        </motion.p>
      </div>
    );
  }

  // If loading is done, check authorization
  if (!user && !isPublic) {
    // Return empty while redirect is executing
    return null;
  }

  if (user && isPublic) {
    return null;
  }

  return <>{children}</>;
}
