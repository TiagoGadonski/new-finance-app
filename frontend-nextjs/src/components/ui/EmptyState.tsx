import { memo, ReactNode } from 'react';
import { Button } from './Button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export const EmptyState = memo(function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fadeIn">
      <div
        className="p-4 rounded-full mb-4"
        style={{ backgroundColor: 'var(--primary-light)' }}
      >
        <Icon className="w-12 h-12 opacity-50" style={{ color: 'var(--foreground)' }} />
      </div>

      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--foreground)' }}
      >
        {title}
      </h3>

      <p
        className="text-sm max-w-sm mb-6 opacity-70"
        style={{ color: 'var(--foreground)' }}
      >
        {description}
      </p>

      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}

      {children}
    </div>
  );
});
