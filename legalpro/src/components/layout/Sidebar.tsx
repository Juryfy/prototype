import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router';
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
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, type Theme } from '@/contexts/ThemeContext';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { label: 'Cases', path: '/app/cases', icon: Briefcase },
  { label: 'Clients', path: '/app/clients', icon: Users },
  { label: 'Calendar', path: '/app/calendar', icon: Calendar },
  { label: 'Analyser', path: '/app/analyser', icon: Brain },
  { label: 'Billing', path: '/app/billing', icon: CreditCard },
  { label: 'Compliance', path: '/app/compliance', icon: ShieldCheck },
  { label: 'Reports', path: '/app/reports', icon: BarChart3 },
  { label: 'FIR Hub', path: '/app/fir', icon: FileSearch },
  { label: 'Profiling', path: '/app/profiling', icon: UserSearch },
  { label: 'Court', path: '/app/court', icon: Gavel },
  { label: 'Settings', path: '/app/settings', icon: Settings },
];

const themeOptions: { value: Theme; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'gold', label: 'Gold', icon: Sparkles },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  function handleLogout() {
    logout();
    navigate('/app/login');
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setThemeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentThemeOption = themeOptions.find(t => t.value === theme)!;
  const CurrentIcon = currentThemeOption.icon;

  // Nav link active/inactive classes per theme
  function getNavLinkClasses(isActive: boolean): string {
    if (isActive) {
      switch (theme) {
        case 'dark':
          return 'bg-accent-primary/20 text-accent-primary';
        case 'gold':
          return 'bg-[#D4A853]/20 text-[#D4A853]';
        case 'light':
          return 'bg-accent-primary/10 text-accent-primary font-semibold';
        default:
          return 'bg-white/15 text-white';
      }
    }
    switch (theme) {
      case 'gold':
        return 'text-[#E0D0B0] hover:text-[#F3DE9A] hover:bg-[#D4A853]/10';
      case 'light':
        return 'text-text-secondary hover:text-accent-primary hover:bg-accent-primary/5';
      default:
        return 'text-white/60 hover:text-white hover:bg-white/10';
    }
  }

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-bg-card border border-border text-text-primary md:hidden"
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
        <div className={`flex items-center gap-3 p-4 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
          <img src="/logo.png" alt="Juryfy" className="w-[72px] h-[72px] shrink-0 brightness-150 contrast-125 drop-shadow-[0_0_8px_rgba(17,205,239,0.4)]" />
          {!collapsed && (
            <span className={`text-2xl font-bold tracking-tight ${theme === 'light' ? 'text-text-primary' : 'text-white'}`}>Juryfy</span>
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
                    ${getNavLinkClasses(isActive)}
                    ${collapsed ? 'justify-center' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-white/10 px-2 py-3 space-y-1">
          {/* Lawyers Near You link */}
          <NavLink
            to="/app/home"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${getNavLinkClasses(false)} ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Lawyers Near You' : undefined}
          >
            <Scale className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Lawyers Near You</span>}
          </NavLink>

          {/* Theme Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full ${getNavLinkClasses(false)} ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? `Theme: ${currentThemeOption.label}` : undefined}
              aria-label="Change theme"
            >
              <CurrentIcon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Theme: {currentThemeOption.label}</span>}
            </button>

            {/* Dropdown */}
            {themeDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-full min-w-[140px] rounded-xl overflow-hidden bg-bg-elevated border border-border shadow-lg z-50">
                {themeOptions.map(option => {
                  const Icon = option.icon;
                  const isSelected = theme === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTheme(option.value);
                        setThemeDropdownOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium w-full transition-colors
                        ${isSelected
                          ? 'bg-accent-primary/20 text-accent-primary'
                          : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
                        }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-red-400 hover:bg-red-500/10 w-full ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          className={`hidden md:flex items-center justify-center p-3 border-t ${theme === 'light' ? 'border-border text-text-muted hover:text-text-primary' : 'border-white/10 text-white/40 hover:text-white'} transition-colors`}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>
    </>
  );
}
