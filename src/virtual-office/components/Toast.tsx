// AIOS Virtual Office - Toast Notification Component
import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const duration = toast.duration ?? 4000;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-green-500/30';
      case 'error':
        return 'border-red-500/30';
      case 'warning':
        return 'border-yellow-500/30';
      case 'info':
        return 'border-blue-500/30';
    }
  };

  const getGlowColor = () => {
    switch (toast.type) {
      case 'success':
        return '0 0 20px rgba(34, 197, 94, 0.2)';
      case 'error':
        return '0 0 20px rgba(239, 68, 68, 0.2)';
      case 'warning':
        return '0 0 20px rgba(234, 179, 8, 0.2)';
      case 'info':
        return '0 0 20px rgba(59, 130, 246, 0.2)';
    }
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        bg-gray-900/95 backdrop-blur-lg border ${getBorderColor()}
        shadow-2xl min-w-[280px] max-w-md
        transition-all duration-300 ease-out
        ${isLeaving
          ? 'opacity-0 translate-x-full'
          : 'opacity-100 translate-x-0 animate-slide-in-right'
        }
      `}
      style={{ boxShadow: getGlowColor() }}
      role="alert"
      aria-live="polite"
    >
      {getIcon()}
      <span className="flex-1 text-sm text-white">{toast.message}</span>
      <button
        onClick={handleDismiss}
        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}

// Toast Container - manages multiple toasts
interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    return addToast('success', message, duration);
  }, [addToast]);

  const error = useCallback((message: string, duration?: number) => {
    return addToast('error', message, duration);
  }, [addToast]);

  const warning = useCallback((message: string, duration?: number) => {
    return addToast('warning', message, duration);
  }, [addToast]);

  const info = useCallback((message: string, duration?: number) => {
    return addToast('info', message, duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    dismissToast,
    success,
    error,
    warning,
    info
  };
}

export default ToastContainer;
