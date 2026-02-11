'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingCart, LogOut, User, ArrowLeftRight, PiggyBank, Target, Shield, Moon, Sun, Settings, CalendarCheck, Briefcase, BarChart3, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, matchPaths: ['/dashboard'] },
  { href: '/monthly-bills', label: 'Contas do Mês', icon: CalendarCheck, matchPaths: ['/monthly-bills', '/subscriptions', '/debts'] },
  { href: '/transactions', label: 'Transações', icon: ArrowLeftRight, matchPaths: ['/transactions'] },
  { href: '/budgets', label: 'Orçamentos', icon: PiggyBank, matchPaths: ['/budgets'] },
  { href: '/goals', label: 'Metas', icon: Target, matchPaths: ['/goals'] },
  { href: '/reports', label: 'Relatórios', icon: BarChart3, matchPaths: ['/reports'] },
  { href: '/shopping-lists', label: 'Compras', icon: ShoppingCart, matchPaths: ['/shopping-lists'] },
  { href: '/investments', label: 'Investimentos', icon: TrendingUp, matchPaths: ['/investments'] },
  { href: '/trabalho', label: 'Trabalho', icon: Briefcase, matchPaths: ['/trabalho', '/mei', '/work-calendar'] },
  { href: '/settings', label: 'Configurações', icon: Settings, matchPaths: ['/settings'] },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
    setUser(authApi.getUser());

    // Initialize theme from localStorage or system preference
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

  if (!mounted) {
    return (
      <nav className="glass sticky top-0 z-50 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 sm:h-16" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="glass sticky top-0 z-50 border-b backdrop-blur-md" style={{ borderColor: 'var(--border-color)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          <Link href="/dashboard" className="flex items-center space-x-2 flex-shrink-0 group">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-1.5 sm:p-2 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-base sm:text-lg font-bold hidden sm:block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FinanceApp</span>
          </Link>

          <div className="flex items-center gap-1 overflow-x-auto flex-1 scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.matchPaths.some(p => pathname === p);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={clsx(
                    'flex items-center justify-center p-2.5 rounded-lg font-medium transition-all flex-shrink-0',
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  )}
                  style={!isActive ? { color: 'var(--foreground)' } : undefined}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
            {user?.role === 'Admin' && (
              <Link
                href="/admin"
                title="Admin"
                className={clsx(
                  'flex items-center justify-center p-2.5 rounded-lg font-medium transition-all flex-shrink-0',
                  pathname === '/admin'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                )}
                style={pathname !== '/admin' ? { color: 'var(--foreground)' } : undefined}
              >
                <Shield className="w-5 h-5" />
              </Link>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <NotificationDropdown />
              <div className="hidden md:flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg glass">
                <User className="w-4 h-4" />
                <div className="flex flex-col leading-tight">
                  <span className="font-medium">@{user.username}</span>
                  <span className="text-xs opacity-60">{user.familyName}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                title="Sair"
                className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 p-2 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
