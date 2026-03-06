import { toast as sonner } from 'sonner';

/**
 * Helper centralizado de toast notifications.
 * Uso: import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
 */

export const showSuccess = (message: string, description?: string) => {
  sonner.success(message, {
    description,
    duration: 4000,
  });
};

export const showError = (message: string, description?: string) => {
  sonner.error(message, {
    description,
    duration: 6000,
  });
};

export const showWarning = (message: string, description?: string) => {
  sonner.warning(message, {
    description,
    duration: 5000,
  });
};

export const showLoading = (message: string): string | number => {
  return sonner.loading(message, { duration: Infinity });
};

export const dismissToast = (id?: string | number) => {
  if (id !== undefined) {
    sonner.dismiss(id);
  } else {
    sonner.dismiss();
  }
};

export const showInfo = (message: string, description?: string) => {
  sonner.info(message, {
    description,
    duration: 4000,
  });
};

export const showPromise = <T>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string }
) => {
  return sonner.promise(promise, messages);
};
