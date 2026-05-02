import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  Brain,
  CreditCard,
  ShieldCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Scale,
  FileSearch,
  UserSearch,
  Gavel,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Cases', path: '/cases', icon: Briefcase },
  { label: 'Clients', path: '/clients', icon: Users },
  { label: 'Calendar', path: '/calendar', icon: Calendar },
  { label: 'Analyser', path: '/analyser', icon: Brain },
  { label: 'Billing', path: '/billing', icon: CreditCard },
  { label: 'Compliance', path: '/compliance', icon: ShieldCheck },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'FIR Hub', path: '/fir', icon: FileSearch },
  { label: 'Profiling', path: '/profiling', icon: UserSearch },
  { label: 'Court', path: '/court', icon: Gavel },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-bg-card border border-border md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          glass-sidebar fixed left-0 top-0 h-full z-40 border-r border-border
          flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? 'w-16' : 'w-60'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Brand */}
        <div className={`flex items-center gap-3 p-4 border-b border-border ${collapsed ? 'justify-center' : ''}`}>
          <img src="/logo.png" alt="Juryfy" className="w-[72px] h-[72px] shrink-0 brightness-150 contrast-125 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
          {!collapsed && (
            <span className="gradient-text text-2xl font-bold tracking-tight">Juryfy</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-accent-primary/20 text-accent-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                    }
                    ${collapsed ? 'justify-center' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-border px-2 py-3 space-y-1">
          {/* Lawyers Near You link */}
          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-text-secondary hover:text-text-primary hover:bg-bg-elevated ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Lawyers Near You' : undefined}
          >
            <Scale className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Lawyers Near You</span>}
          </NavLink>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-danger hover:bg-danger/10 w-full ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          className="hidden md:flex items-center justify-center p-3 border-t border-border text-text-muted hover:text-text-primary transition-colors"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>
    </>
  );
}
