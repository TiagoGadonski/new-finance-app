'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

/**
 * Navbar is now a shell that renders Sidebar (desktop) + MobileNav (mobile).
 * It also applies the sidebar margin to the content area via a wrapping div.
 * Kept as Navbar export for backwards compatibility with all route layouts.
 */
export function Navbar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  if (!mounted) return null;

  return (
    <>
      <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      <MobileNav />
      <style>{`
        @media (min-width: 1024px) {
          .navbar-content-offset { margin-left: ${collapsed ? '72px' : '260px'}; }
        }
      `}</style>
    </>
  );
}
