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
    if (currentUserRole === 'worker') {
      if (l.href === '/reports') return false;
      if (l.href === '/finance') return false;
    }
    return true;
  });

  return (
    <div className="min-h-[100vh] font-sans text-slate-900 dark:text-slate-100 selection:bg-slate-200 dark:selection:bg-zinc-800">
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
              <div className="sf-card p-5">

                {/* Logo */}
                <div className="flex items-center gap-3 px-1 mb-8">
                  <div className="relative w-8 h-8 bg-slate-900 dark:bg-white rounded-md flex items-center justify-center shrink-0 shadow-sm">
                    <Sprout className="w-5 h-5 text-white dark:text-black" />
                  </div>
                  <div>
                    <div className="font-bold text-sm tracking-tight leading-none text-slate-900 dark:text-zinc-100">SmartFarm</div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase tracking-widest mt-1">Intelligence</div>
                  </div>
                </div>

                <div className="sf-subheading px-2">Navigation</div>

                <ul className="space-y-0.5">
                  {visibleLinks.map((l) => {
                    const isActive = pathname === l.href;
                    const Icon = l.icon;
                    return (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-all group ${
                            isActive
                              ? 'bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white'
                              : 'text-slate-600 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200'
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="sidebar-active"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full bg-slate-900 dark:bg-white"
                              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                            />
                          )}
                          <div className={`transition-all ${
                            isActive
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {l.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* User profile */}
                {user && (
                  <div className="mt-8 pt-5 border-t border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 px-1 mb-3">
                      <div className="w-8 h-8 rounded-md bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 text-xs font-bold shrink-0">
                        {getInitials(user.email)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">{user.email}</div>
                        <div className={`sf-pill inline-flex mt-1 ${
                          currentUserRole === 'owner' || currentUserRole === 'manager'
                            ? 'bg-slate-100 text-slate-700 dark:bg-zinc-900 dark:text-zinc-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-zinc-900 dark:text-zinc-300'
                        }`}>
                          {currentUserRole === 'owner' ? 'Owner' : currentUserRole === 'manager' ? 'Manager' : 'Worker'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 dark:text-rose-400 transition-all cursor-pointer"
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
