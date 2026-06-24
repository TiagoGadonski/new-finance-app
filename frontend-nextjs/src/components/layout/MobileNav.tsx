'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, ArrowLeftRight, PiggyBank, Target, Menu, X,
  ShoppingCart, CalendarCheck, Briefcase, BarChart3,
  TrendingUp, Bell, Scissors, ListTodo, Shield, Settings,
  Moon, Sun, LogOut, User, Send,
} from 'lucide-react';
import { clsx } from 'clsx';
import { authApi } from '@/lib/api';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

const mainTabs = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, matchPaths: ['/dashboard'] },
  { href: '/transactions', label: 'Transacoes', icon: ArrowLeftRight, matchPaths: ['/transactions'] },
  { href: '/budgets', label: 'Orcamentos', icon: PiggyBank, matchPaths: ['/budgets'] },
  { href: '/goals', label: 'Metas', icon: Target, matchPaths: ['/goals'] },
];

const drawerSections = [
  {
    label: 'Financas',
    items: [
      { href: '/monthly-bills', label: 'Contas do Mes', icon: CalendarCheck },
      { href: '/investments', label: 'Investimentos', icon: TrendingUp },
      { href: '/reports', label: 'Relatorios', icon: BarChart3 },
    ],
  },
  {
    label: 'Ferramentas',
    items: [
      { href: '/shopping-lists', label: 'Compras', icon: ShoppingCart },
      { href: '/todos', label: 'Tarefas', icon: ListTodo },
      { href: '/applications', label: 'Vagas', icon: Send },
      { href: '/alerts', label: 'Alertas', icon: Bell },
      { href: '/splits', label: 'Divisoes', icon: Scissors },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/settings', label: 'Configuracoes', icon: Settings },
    ],
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
    setUser(authApi.getUser());
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

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

  const isTabActive = (matchPaths: string[]) => matchPaths.some(p => pathname === p);
  const isMenuActive = !mainTabs.some(tab => isTabActive(tab.matchPaths));

  if (!mounted) return null;

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-md"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-around h-16">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab.matchPaths);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(
                  'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]',
                  active
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'opacity-60'
                )}
                style={!active ? { color: 'var(--foreground)' } : undefined}
              >
                <Icon className={clsx('w-5 h-5', active && 'fill-emerald-600/20 dark:fill-emerald-400/20')} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
          {/* Menu button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={clsx(
              'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px]',
              isMenuActive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'opacity-60'
            )}
            style={!isMenuActive ? { color: 'var(--foreground)' } : undefined}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </nav>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl overflow-y-auto animate-slideUp"
            style={{ backgroundColor: 'var(--background)', paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
          >
            {/* Drawer handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--border-color)' }} />
            </div>

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <div className="flex items-center gap-2.5">
                <Image src="/orbit-logo.svg" alt="Orbit" width={28} height={28} />
                <span className="text-lg font-bold gradient-text">Orbit</span>
              </div>
              <div className="flex items-center gap-2">
                <NotificationDropdown />
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                  style={{ color: 'var(--foreground)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* User info */}
            {user && (
              <div className="mx-5 mb-4 p-3 rounded-xl flex items-center gap-3" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>@{user.username}</p>
                  <p className="text-xs opacity-60 truncate" style={{ color: 'var(--foreground)' }}>{user.familyName}</p>
                </div>
              </div>
            )}

            {/* Nav sections */}
            <div className="px-3 space-y-4 pb-4">
              {drawerSections.map((section) => (
                <div key={section.label}>
                  <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-50" style={{ color: 'var(--foreground)' }}>
                    {section.label}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={clsx(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all',
                            isActive
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                          )}
                          style={!isActive ? { color: 'var(--foreground)' } : undefined}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Trabalho — only for MEI-enabled users */}
              {user?.isMeiEnabled && (
                <div>
                  <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-50" style={{ color: 'var(--foreground)' }}>
                    PJ / Trabalho
                  </p>
                  <Link
                    href="/trabalho"
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all',
                      pathname === '/trabalho'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    )}
                    style={pathname !== '/trabalho' ? { color: 'var(--foreground)' } : undefined}
                  >
                    <Briefcase className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">Trabalho</span>
                  </Link>
                </div>
              )}

              {/* Admin */}
              {user?.role === 'Admin' && (
                <div>
                  <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-50" style={{ color: 'var(--foreground)' }}>
                    Admin
                  </p>
                  <Link
                    href="/admin"
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all',
                      pathname === '/admin'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    )}
                    style={pathname !== '/admin' ? { color: 'var(--foreground)' } : undefined}
                  >
                    <Shield className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">Admin</span>
                  </Link>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center gap-2 px-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex-1"
                  style={{ color: 'var(--foreground)' }}
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                  <span className="text-sm">{theme === 'light' ? 'Modo escuro' : 'Modo claro'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
                  style={{ color: 'var(--foreground)' }}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
