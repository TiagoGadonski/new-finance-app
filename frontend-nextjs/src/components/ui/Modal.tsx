'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div
          className={clsx(
            'relative rounded-lg shadow-xl w-full',
            sizes[size]
          )}
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
          }}
        >
          {title && (
            <div
              className="flex items-center justify-between p-6 border-b"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h2>
              <button
                onClick={onClose}
                className="opacity-50 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--foreground)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
