'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';
import { notificationsApi } from '@/lib/api';
import { NotificationDto, NotificationType } from '@/types';

const typeConfig = {
  [NotificationType.Info]: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  [NotificationType.Warning]: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  [NotificationType.Alert]: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  [NotificationType.Success]: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll(1, 10),
    refetchInterval: 30000,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: notificationsApi.getUnreadCount,
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: NotificationDto) => {
    if (!notification.isRead) {
      markRead.mutate(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
      setOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        title="Notificações"
      >
        <Bell className="w-5 h-5" style={{ color: 'var(--foreground)' }} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute left-0 bottom-full mb-2 w-80 max-h-96 overflow-y-auto rounded-xl shadow-xl border z-50"
          style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                Marcar todas
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Sem notificações
            </div>
          ) : (
            notifications.map((n) => {
              const config = typeConfig[n.type] || typeConfig[NotificationType.Info];
              const Icon = config.icon;

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={clsx(
                    'flex items-start gap-3 p-3 border-b cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
                    !n.isRead && 'bg-emerald-50/50 dark:bg-emerald-900/10'
                  )}
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div className={clsx('p-1.5 rounded-lg flex-shrink-0', config.bg)}>
                    <Icon className={clsx('w-4 h-4', config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{n.title}</p>
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{n.message}</p>
                    <p className="text-xs mt-1 opacity-50">{timeAgo(n.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markRead.mutate(n.id); }}
                        className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                        title="Marcar como lida"
                      >
                        <Check className="w-3 h-3 text-emerald-500" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotification.mutate(n.id); }}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                      title="Apagar"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
