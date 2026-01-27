import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerIcon?: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

const variantClasses = {
  dark: {
    overlay: 'bg-black/70',
    modal: 'bg-[#0f172a]/95 border-rose-500/20',
    header: 'border-white/10',
    footer: 'border-white/10 bg-black/20',
  },
  light: {
    overlay: 'bg-black/50',
    modal: 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800',
    header: 'border-gray-100 dark:border-gray-800',
    footer: 'border-gray-100 dark:border-gray-800',
  },
};

/**
 * Reusable Modal component that consolidates modal implementations
 * Supports dark/light variants with configurable header, content, and footer
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen = true,
  onClose,
  title,
  children,
  footer,
  className = '',
  headerIcon,
  headerClassName = '',
  contentClassName = '',
  footerClassName = '',
  variant = 'dark',
  size = 'lg',
  closeButton = true,
}) => {
  if (!isOpen) return null;

  const variantStyle = variantClasses[variant];

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${variantStyle.overlay} backdrop-blur-sm animate-fade-in`}>
      <div
        className={`w-full ${sizeClasses[size]} ${variantStyle.modal} rounded-2xl shadow-2xl animate-slide-up overflow-hidden border ${className}`}
        style={variant === 'dark' ? {
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        } : undefined}
      >
        {/* Header */}
        {(title || headerIcon || closeButton) && (
          <div className={`flex items-center justify-between p-6 border-b ${variantStyle.header} ${headerClassName}`}>
            <div className="flex items-center gap-3">
              {headerIcon && <div>{headerIcon}</div>}
              {title && (
                <h2 className={`text-xl font-bold ${variant === 'dark' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {title}
                </h2>
              )}
            </div>
            {closeButton && (
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-all ${
                  variant === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`p-6 ${contentClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`p-6 border-t ${variantStyle.footer} ${footerClassName}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
