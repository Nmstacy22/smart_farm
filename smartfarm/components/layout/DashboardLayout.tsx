'use client';
import React from 'react';
import MobileBottomNav from '../layout/MobileBottomNav';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sprout, Package, Wallet, CheckSquare, LogOut, Info, ChevronRight, Wheat, Beef, BarChart, Settings } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useFarm } from '../../lib/hooks/useFarm';
import OnboardingView from './OnboardingView';

type Props = {
  children: React.ReactNode;
};

const sidebarLinks = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/crops', label: 'Crops', icon: Wheat },
  { href: '/livestock', label: 'Livestock', icon: Beef },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/finance', label: 'Finance', icon: Wallet },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/reports', label: 'Reports', icon: BarChart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function getInitials(email: string) {
  return email?.split('@')[0]?.slice(0, 2).toUpperCase() || 'SF';
}

export default function DashboardLayout({ children }: Props) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { profile, loading, currentUserRole } = useFarm();

  if (!loading && !profile && user) {
    return <OnboardingView />;
  }

  const visibleLinks = sidebarLinks.filter(l => {
    if (l.href === '/reports' && currentUserRole === 'worker') return false;
    return true;
  });

  const currentPage = visibleLinks.find(l => l.href === pathname)?.label || 'Dashboard';

  return (
    <div className="min-h-[100vh] bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-500/30">
      {/* Subtle background glow effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] dark:bg-emerald-500/10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] dark:bg-indigo-500/10"></div>
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 pb-28 md:pb-8">
          
          {/* Sidebar */}
          <aside className="hidden md:block md:col-span-3 lg:col-span-2">
            <motion.nav
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="sticky top-8"
            >
              <div className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-zinc-800/50 p-5 rounded-2xl shadow-sm">

                {/* Logo */}
                <div className="flex items-center gap-3 px-1 mb-8">
                  <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                    <Sprout className="w-5 h-5 text-white" />
                    <div className="absolute inset-0 rounded-xl ring-2 ring-emerald-400/40 ring-offset-1 ring-offset-transparent" />
                  </div>
                  <div>
                    <div className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">SmartFarm</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Farm Intelligence</div>
                  </div>
                </div>

                <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 px-2">Navigation</div>

                <ul className="space-y-1">
                  {visibleLinks.map((l) => {
                    const isActive = pathname === l.href;
                    const Icon = l.icon;
                    return (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100'
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="sidebar-active"
                              className="absolute inset-0 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 -z-10"
                              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                            />
                          )}
                          <div className={`p-1.5 rounded-lg transition-all ${
                            isActive
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {l.label}
                          {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-emerald-500 dark:text-emerald-400" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* User profile */}
                {user && (
                  <div className="mt-8 pt-5 border-t border-slate-200/60 dark:border-zinc-800/60">
                    <div className="flex items-center gap-3 px-1 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-emerald-500/20 shrink-0">
                        {getInitials(user.email)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-700 dark:text-zinc-200 truncate">{user.email}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold mt-0.5">{user.role || 'Farm Owner'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.nav>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-9 lg:col-span-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
              className="min-h-[80vh]"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
