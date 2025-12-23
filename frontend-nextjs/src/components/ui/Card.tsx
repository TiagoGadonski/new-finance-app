import { ReactNode, memo } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = memo(function Card({ children, className, padding = 'none' }: CardProps) {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={clsx(
        'rounded-xl overflow-hidden transition-all duration-300',
        'border',
        paddings[padding],
        className
      )}
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {children}
    </div>
  );
});

export const CardHeader = memo(function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('mb-4', className)}>{children}</div>;
});

export const CardTitle = memo(function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3
      className={clsx('text-lg font-semibold', className)}
      style={{ color: 'var(--foreground)' }}
    >
      {children}
    </h3>
  );
});

export const CardContent = memo(function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx(className)}>{children}</div>;
});
