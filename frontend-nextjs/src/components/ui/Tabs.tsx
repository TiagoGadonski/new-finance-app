'use client';

import { memo } from 'react';
import { clsx } from 'clsx';

interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
}

export const Tabs = memo(function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--background-secondary)' }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={clsx(
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            activeTab === tab.key
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm'
              : 'hover:bg-slate-100 dark:hover:bg-slate-700'
          )}
          style={activeTab !== tab.key ? { color: 'var(--foreground)' } : undefined}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
});
