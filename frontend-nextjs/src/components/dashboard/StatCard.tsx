import { memo, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  gradient: string;
  delay?: string;
}

export const StatCard = memo(function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  gradient,
  delay = '0s',
}: StatCardProps) {
  return (
    <Card className="card-hover group cursor-pointer overflow-hidden relative" style={{ animationDelay: delay }}>
      <div className="absolute inset-0 opacity-5" style={{ background: gradient }} />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium opacity-70" style={{ color: 'var(--foreground)' }}>
              {title}
            </p>
          </div>
          <div
            className="p-3 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300"
            style={{ background: gradient }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h3
            className="text-3xl font-bold animate-scaleIn"
            style={{ color: 'var(--foreground)' }}
          >
            {value}
          </h3>

          {subtitle && (
            <p className="text-xs opacity-60" style={{ color: 'var(--foreground)' }}>
              {subtitle}
            </p>
          )}

          {trend && (
            <div className="flex items-center gap-1 text-sm">
              <span className={trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs opacity-50" style={{ color: 'var(--foreground)' }}>
                vs. mês anterior
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});
