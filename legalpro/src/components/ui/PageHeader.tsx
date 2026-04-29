import { useState, useEffect, useRef, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Bell, Plus, User, Calendar, CheckSquare, FileText, Clock, Search } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockNotifications, mockCases, mockClients, STORAGE_KEYS } from '@/data/mockData';
import type { Notification, Case, Client } from '@/types';

interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  showNewCase?: boolean;
  showSearch?: boolean;
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).toLowerCase();
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'hearing': return Calendar;
    case 'task': return CheckSquare;
    case 'invoice': return FileText;
    case 'deadline': return Clock;
  }
}

export function PageHeader({ title, icon: Icon, showNewCase = false }: PageHeaderProps) {
  const [notifications, { set: setNotifications }] = useLocalStorage<Notification>(STORAGE_KEYS.notifications, mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [cases] = useLocalStorage<Case>(STORAGE_KEYS.cases, mockCases);
  const [clients] = useLocalStorage<Client>(STORAGE_KEYS.clients, mockClients);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function markAllAsRead() {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  }

  function markAsRead(id: string) {
    setNotifications(notifications.map((n) => n.id === id ? { ...n, isRead: true } : n));
  }

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { cases: [], clients: [] };
    const q = searchQuery.toLowerCase();
    const matchedCases = cases.filter(
      (c) =>
        c.caseNumber.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    ).slice(0, 5);
    const matchedClients = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    ).slice(0, 5);
    return { cases: matchedCases, clients: matchedClients };
  }, [searchQuery, cases, clients]);

  const hasResults = searchResults.cases.length > 0 || searchResults.clients.length > 0;

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-6 h-6 text-accent-primary" />}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          <p className="text-sm text-text-secondary">
            {formatDate()} • {formatTime()}
          </p>
        </div>
      </div>

      {/* Global Search */}
      <div ref={searchRef} className="relative flex-1 max-w-xs hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
          onFocus={() => setShowSearchResults(true)}
          placeholder="Search cases, clients..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-bg-card border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm"
        />
        {showSearchResults && searchQuery.trim() && (
          <div className="absolute top-full mt-2 left-0 right-0 glass-card p-3 z-50 max-h-80 overflow-y-auto">
            {!hasResults && (
              <p className="text-sm text-text-muted text-center py-2">No results found</p>
            )}
            {searchResults.cases.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-text-muted uppercase mb-2">Cases</p>
                {searchResults.cases.map((c) => (
                  <a
                    key={c.id}
                    href="/cases"
                    className="block px-2 py-1.5 rounded-lg hover:bg-bg-elevated/50 transition-colors"
                  >
                    <p className="text-sm text-text-primary font-medium">{c.caseNumber}</p>
                    <p className="text-xs text-text-secondary">{c.clientName} — {c.description}</p>
                  </a>
                ))}
              </div>
            )}
            {searchResults.clients.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase mb-2">Clients</p>
                {searchResults.clients.map((c) => (
                  <a
                    key={c.id}
                    href="/clients"
                    className="block px-2 py-1.5 rounded-lg hover:bg-bg-elevated/50 transition-colors"
                  >
                    <p className="text-sm text-text-primary font-medium">{c.name}</p>
                    <p className="text-xs text-text-secondary">{c.email}</p>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showNewCase && (
          <button className="gradient-btn flex items-center gap-2 px-4 py-2 text-sm font-medium">
            <Plus className="w-4 h-4" />
            New Case
          </button>
        )}

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-bg-elevated transition-colors"
          >
            <Bell className="w-5 h-5 text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full mt-2 right-0 w-80 glass-card p-3 z-50 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-text-primary">Notifications</p>
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-accent-primary hover:text-accent-secondary transition-colors"
                >
                  Mark all as read
                </button>
              </div>
              <div className="space-y-2">
                {notifications.map((notif) => {
                  const TypeIcon = getNotificationIcon(notif.type);
                  return (
                    <button
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`w-full text-left flex items-start gap-3 p-2 rounded-lg transition-colors ${
                        notif.isRead ? 'opacity-60' : 'bg-bg-elevated/50'
                      } hover:bg-bg-elevated`}
                    >
                      <TypeIcon className="w-4 h-4 text-accent-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary">{notif.title}</p>
                        <p className="text-xs text-text-secondary truncate">{notif.message}</p>
                        <p className="text-xs text-text-muted mt-0.5">{timeAgo(notif.createdAt)}</p>
                      </div>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-accent-primary shrink-0 mt-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-accent-primary" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-text-primary">Adv. Sharma</p>
            <p className="text-xs text-text-muted">Senior Advocate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
