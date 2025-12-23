import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const variants = {
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-900 dark:text-blue-200',
      content: 'text-blue-700 dark:text-blue-300',
      Icon: Info,
    },
    success: {
      container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      title: 'text-green-900 dark:text-green-200',
      content: 'text-green-700 dark:text-green-300',
      Icon: CheckCircle,
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      title: 'text-yellow-900 dark:text-yellow-200',
      content: 'text-yellow-700 dark:text-yellow-300',
      Icon: AlertCircle,
    },
    danger: {
      container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      title: 'text-red-900 dark:text-red-200',
      content: 'text-red-700 dark:text-red-300',
      Icon: XCircle,
    },
  };

  const style = variants[variant];
  const Icon = style.Icon;

  return (
    <div
      className={clsx(
        'rounded-lg border p-4 transition-colors duration-200',
        style.container,
        className
      )}
    >
      <div className="flex">
        <Icon className={clsx('w-5 h-5 flex-shrink-0', style.icon)} />
        <div className="ml-3">
          {title && (
            <h3 className={clsx('text-sm font-medium', style.title)}>{title}</h3>
          )}
          <div className={clsx('text-sm', title && 'mt-2', style.content)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
