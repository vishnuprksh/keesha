import { useState, useCallback } from 'react';

interface UseConfirmDialogReturn {
  isOpen: boolean;
  openDialog: (config: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'warning' | 'info';
  }) => void;
  closeDialog: () => void;
  dialogConfig: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel: string;
    cancelLabel: string;
    type: 'danger' | 'warning' | 'info';
  } | null;
}

export const useConfirmDialog = (): UseConfirmDialogReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel: string;
    cancelLabel: string;
    type: 'danger' | 'warning' | 'info';
  } | null>(null);

  const openDialog = useCallback((config: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'warning' | 'info';
  }) => {
    setDialogConfig({
      title: config.title,
      message: config.message,
      onConfirm: config.onConfirm,
      confirmLabel: config.confirmLabel || 'Confirm',
      cancelLabel: config.cancelLabel || 'Cancel',
      type: config.type || 'danger'
    });
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setDialogConfig(null);
  }, []);

  return {
    isOpen,
    openDialog,
    closeDialog,
    dialogConfig
  };
};
