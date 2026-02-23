'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, ShoppingCart, LogOut, User, ArrowLeftRight, PiggyBank, Target,
  Shield, Moon, Sun, Settings, CalendarCheck, Briefcase, BarChart3,
  TrendingUp, Bell, Scissors, ListTodo, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { authApi } from '@/lib/api';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navSections = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: Home, matchPaths: ['/dashboard'] },
      { href: '/transactions', label: 'Transacoes', icon: ArrowLeftRight, matchPaths: ['/transactions'] },
      { href: '/monthly-bills', label: 'Contas do Mes', icon: CalendarCheck, matchPaths: ['/monthly-bills', '/subscriptions', '/debts'] },
    ],
  },
  {
    label: 'Financas',
    items: [
      { href: '/budgets', label: 'Orcamentos', icon: PiggyBank, matchPaths: ['/budgets'] },
      { href: '/goals', label: 'Metas', icon: Target, matchPaths: ['/goals'] },
      { href: '/investments', label: 'Investimentos', icon: TrendingUp, matchPaths: ['/investments'] },
      { href: '/reports', label: 'Relatorios', icon: BarChart3, matchPaths: ['/reports'] },
    ],
  },
  {
    label: 'Ferramentas',
    items: [
      { href: '/shopping-lists', label: 'Compras', icon: ShoppingCart, matchPaths: ['/shopping-lists'] },
      { href: '/todos', label: 'Tarefas', icon: ListTodo, matchPaths: ['/todos'] },
      { href: '/alerts', label: 'Alertas', icon: Bell, matchPaths: ['/alerts'] },
      { href: '/splits', label: 'Divisoes', icon: Scissors, matchPaths: ['/splits'] },
    ],
  },
];

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
    setUser(authApi.getUser());
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const handleLogout = () => {
    authApi.logout();
    router.push('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (!mounted) return null;

  return (
    <aside
      className={clsx(
        'hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 border-r sidebar-transition',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
    >
      {/* Logo + Collapse Toggle */}
      <div className="flex items-center justify-between px-4 h-16 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <Image src="/orbit-logo.svg" alt="Orbit" width={32} height={32} className="flex-shrink-0" />
          {!collapsed && (
            <span className="text-lg font-bold gradient-text truncate">Orbit</span>
          )}
        </Link>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors flex-shrink-0"
          style={{ color: 'var(--foreground)' }}
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-hide">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-50" style={{ color: 'var(--foreground)' }}>
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.matchPaths.some(p => pathname === p);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={clsx(
                      'flex items-center gap-3 rounded-lg font-medium transition-all duration-200',
                      collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
                      isActive
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    )}
                    style={!isActive ? { color: 'var(--foreground)' } : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Trabalho — only for MEI-enabled users */}
        {user?.isMeiEnabled && (
          <div>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-50" style={{ color: 'var(--foreground)' }}>
                PJ / Trabalho
              </p>
            )}
            <Link
              href="/trabalho"
              title={collapsed ? 'Trabalho' : undefined}
              className={clsx(
                'flex items-center gap-3 rounded-lg font-medium transition-all duration-200',
                collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
                ['/trabalho', '/mei', '/work-calendar'].some(p => pathname === p)
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              )}
              style={!['/trabalho', '/mei', '/work-calendar'].some(p => pathname === p) ? { color: 'var(--foreground)' } : undefined}
            >
              <Briefcase className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm truncate">Trabalho</span>}
            </Link>
          </div>
        )}

        {/* Admin */}
        {user?.role === 'Admin' && (
          <div>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-50" style={{ color: 'var(--foreground)' }}>
                Admin
              </p>
            )}
            <Link
              href="/admin"
              title={collapsed ? 'Admin' : undefined}
              className={clsx(
                'flex items-center gap-3 rounded-lg font-medium transition-all duration-200',
                collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
                pathname === '/admin'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              )}
              style={pathname !== '/admin' ? { color: 'var(--foreground)' } : undefined}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">Admin</span>}
            </Link>
          </div>
        )}

        {/* Settings */}
        <div>
          <Link
            href="/settings"
            title={collapsed ? 'Configuracoes' : undefined}
            className={clsx(
              'flex items-center gap-3 rounded-lg font-medium transition-all duration-200',
              collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
              pathname === '/settings'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
            )}
            style={pathname !== '/settings' ? { color: 'var(--foreground)' } : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Configuracoes</span>}
          </Link>
        </div>
      </nav>

      {/* Footer: Notifications + User + Theme + Logout */}
      <div className="border-t p-3 space-y-2" style={{ borderColor: 'var(--border-color)' }}>
        {/* Notification */}
        <div className={clsx('flex', collapsed ? 'justify-center' : 'justify-start px-1')}>
          <NotificationDropdown />
        </div>

        {/* User info */}
        {user && !collapsed && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--background-secondary)' }}>
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>@{user.username}</p>
              <p className="text-[11px] opacity-60 truncate" style={{ color: 'var(--foreground)' }}>{user.familyName}</p>
            </div>
          </div>
        )}

        {/* Theme + Logout */}
        <div className={clsx('flex gap-1', collapsed ? 'flex-col items-center' : 'items-center')}>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
            style={{ color: 'var(--foreground)' }}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-500" />}
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
            title="Sair"
            style={{ color: 'var(--foreground)' }}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
