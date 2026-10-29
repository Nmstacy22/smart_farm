import { Home, Wheat, Beef, Package, Wallet, CheckSquare, BarChart, Settings, CloudSun, TrendingUp, MessageSquare, Users, type LucideIcon } from 'lucide-react';

export type NavLink = {
  href: string;
  label: string;
  shortLabel?: string; // used in the mobile bottom bar
  icon: LucideIcon;
  workerAllowed: boolean; // false = owners/managers only (finance data is restricted by RLS too)
};

/** Single source for the sidebar (DashboardLayout) and the mobile bottom bar (MobileBottomNav). */
export const NAV_LINKS: NavLink[] = [
  { href: '/dashboard', label: 'Home', icon: Home, workerAllowed: true },
  { href: '/crops', label: 'Crops', icon: Wheat, workerAllowed: true },
  { href: '/livestock', label: 'Livestock', icon: Beef, workerAllowed: true },
  { href: '/inventory', label: 'Inventory', shortLabel: 'Stock', icon: Package, workerAllowed: true },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare, workerAllowed: true },
  { href: '/weather', label: 'Weather', icon: CloudSun, workerAllowed: true },
  { href: '/market', label: 'Market Prices', shortLabel: 'Market', icon: TrendingUp, workerAllowed: true },
  { href: '/finance', label: 'Finance', icon: Wallet, workerAllowed: false },
  { href: '/reports', label: 'Reports', icon: BarChart, workerAllowed: false },
  { href: '/communication', label: 'Messages', icon: MessageSquare, workerAllowed: true },
  { href: '/users', label: 'Team', icon: Users, workerAllowed: true },
  { href: '/settings', label: 'Settings', icon: Settings, workerAllowed: true },
];

export function visibleNavLinks(role: string | undefined): NavLink[] {
  return NAV_LINKS.filter((l) => role !== 'worker' || l.workerAllowed);
}
