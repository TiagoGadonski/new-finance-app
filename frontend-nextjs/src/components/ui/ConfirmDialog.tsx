'use client';

import { ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const icons = {
    danger: <AlertTriangle className="w-12 h-12 text-rose-600" />,
    warning: <AlertTriangle className="w-12 h-12 text-amber-600" />,
    info: <Info className="w-12 h-12 text-blue-600" />,
    success: <CheckCircle className="w-12 h-12 text-emerald-600" />,
  };

  const buttonVariants = {
    danger: 'danger' as const,
    warning: 'danger' as const,
    info: 'primary' as const,
    success: 'primary' as const,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          {icons[variant]}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <div className="text-slate-600 mb-6">{message}</div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={buttonVariants[variant]}
            className="flex-1"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
