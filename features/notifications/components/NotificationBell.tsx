'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trophy, Eye, Flame, FileText, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PortfolioMode } from '@/features/portfolio/types/portfolio';

// =============================================================================
// Types
// =============================================================================

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// =============================================================================
// Helpers
// =============================================================================

const TYPE_ICON: Record<string, React.ElementType> = {
  QUEST_COMPLETED: Trophy,
  PORTFOLIO_VIEW: Eye,
  STREAK_AT_RISK: Flame,
  CV_GENERATED: FileText,
  SYSTEM: Info,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// =============================================================================
// Component
// =============================================================================

interface NotificationBellProps {
  portfolioMode: PortfolioMode;
}

export function NotificationBell({ portfolioMode }: NotificationBellProps) {
  const isTech = portfolioMode === 'tech';
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH' });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Poll for unread count on mount (lightweight)
  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => setUnreadCount(d.unreadCount ?? 0))
      .catch(() => {});
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className={cn(
          'relative p-1.5 transition-colors',
          isTech
            ? 'text-[hsl(174,100%,50%,0.6)] hover:text-[hsl(174,100%,50%)]'
            : 'text-gray-500 hover:text-gray-700'
        )}
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className={cn(
            'absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full text-[9px] font-bold flex items-center justify-center px-0.5',
            isTech
              ? 'bg-[hsl(174,100%,50%)] text-[hsl(200,25%,8%)]'
              : 'bg-red-500 text-white'
          )}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={cn(
          'absolute right-0 top-8 w-72 z-50 shadow-2xl',
          isTech
            ? 'border border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,6%)]'
            : 'border border-gray-200 bg-white rounded-xl'
        )}>
          {/* Header */}
          <div className={cn(
            'flex items-center justify-between px-4 py-2.5 border-b',
            isTech
              ? 'border-[hsl(174,100%,50%,0.15)]'
              : 'border-gray-100'
          )}>
            <span className={cn(
              'text-xs font-semibold',
              isTech ? 'font-mono uppercase tracking-wider text-[hsl(174,100%,50%)]' : 'text-gray-900'
            )}>
              {isTech ? '> NOTIFICATIONS' : 'Notifications'}
            </span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className={cn(
                    'text-[10px]',
                    isTech
                      ? 'font-mono text-[hsl(174,100%,50%,0.6)] hover:text-[hsl(174,100%,50%)]'
                      : 'text-blue-600 hover:text-blue-700'
                  )}
                >
                  {isTech ? 'MARK_READ' : 'Mark all read'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={cn(
                  isTech ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className={cn(
                'text-center py-6 text-xs',
                isTech ? 'font-mono text-muted-foreground' : 'text-gray-400'
              )}>
                {isTech ? '> LOADING...' : 'Loading...'}
              </div>
            ) : notifications.length === 0 ? (
              <div className={cn(
                'text-center py-6 text-xs',
                isTech ? 'font-mono text-muted-foreground' : 'text-gray-400'
              )}>
                {isTech ? '> NO_NOTIFICATIONS' : 'No notifications yet'}
              </div>
            ) : (
              notifications.map(n => {
                const Icon = TYPE_ICON[n.type] ?? Info;
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors',
                      isTech
                        ? 'border-[hsl(174,100%,50%,0.08)] hover:bg-[hsl(174,100%,50%,0.04)]'
                        : 'border-gray-50 hover:bg-gray-50',
                      !n.read && (isTech
                        ? 'bg-[hsl(174,100%,50%,0.04)]'
                        : 'bg-blue-50/50'
                      )
                    )}
                  >
                    <Icon className={cn(
                      'w-3.5 h-3.5 flex-shrink-0 mt-0.5',
                      isTech ? 'text-[hsl(174,100%,50%,0.7)]' : 'text-blue-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-xs font-medium',
                        isTech ? 'font-mono text-white' : 'text-gray-900'
                      )}>
                        {n.title}
                      </p>
                      <p className={cn(
                        'text-[11px] mt-0.5',
                        isTech ? 'font-mono text-gray-400' : 'text-gray-500'
                      )}>
                        {n.message}
                      </p>
                      <p className={cn(
                        'text-[9px] mt-1',
                        isTech ? 'font-mono text-gray-600' : 'text-gray-400'
                      )}>
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5',
                        isTech ? 'bg-[hsl(174,100%,50%)]' : 'bg-blue-500'
                      )} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
