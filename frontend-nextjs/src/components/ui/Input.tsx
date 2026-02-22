import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--foreground)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={clsx(
            'block w-full px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500',
            'placeholder:opacity-50',
            'sm:text-sm',
            error
              ? 'border-red-300 dark:border-red-700 text-red-900 dark:text-red-200 placeholder-red-300 dark:placeholder-red-500 bg-red-50 dark:bg-red-900/10'
              : '',
            className
          )}
          style={!error ? {
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--foreground)',
            borderWidth: '1px',
            borderStyle: 'solid'
          } : undefined}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{helperText}</p>
        )}
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
