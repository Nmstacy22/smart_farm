'use client';
import React from 'react';
import MobileBottomNav from '../layout/MobileBottomNav';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sprout, Package, Wallet, CheckSquare, LogOut, Info } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

type Props = {
  children: React.ReactNode;
};

const sidebarLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/farm', label: 'Farm', icon: Sprout },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/finance', label: 'Finance', icon: Wallet },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
];

export default function DashboardLayout({ children }: Props) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

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
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="sticky top-8"
            >
              <div className="bg-white/70 dark:bg-zinc-900/50 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/50 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 px-2 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold">SF</div>
                  <span className="font-bold text-lg tracking-tight">SmartFarm</span>
                </div>
                
                <div className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-4 px-2">Navigation</div>
                <ul className="space-y-1.5">
                  {sidebarLinks.map((l) => {
                    const isActive = pathname === l.href;
                    const Icon = l.icon;
                    return (
                      <li key={l.href}>
                        <Link 
                          href={l.href} 
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-zinc-500'}`} />
                          {l.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* Profile and Logout Section */}
                {user && (
                  <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-zinc-800/60 px-2 flex flex-col gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 truncate">{user.email}</div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">{user.role}</div>
                    </div>
                    <button 
                      onClick={() => signOut()}
                      className="flex items-center gap-2 text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-450 transition-colors cursor-pointer"
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
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
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
