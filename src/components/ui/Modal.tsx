import React, { useEffect, useRef } from 'react';
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
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

const sizeClasses = {
  sm: 'max-w-full sm:max-w-sm',
  md: 'max-w-full sm:max-w-md',
  lg: 'max-w-full md:max-w-lg',
  xl: 'max-w-full md:max-w-2xl',
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
 * WCAG 2.1 AA accessible: aria-modal, aria-labelledby, focus trap, ESC to close
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
  ariaLabel,
  ariaLabelledBy,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`).current;

  // Focus trap and ESC to close handler
  useEffect(() => {
    if (!isOpen) return;

    // Store the previously focused element so we can restore it
    const previouslyFocusedElement = document.activeElement as HTMLElement;

    // Focus the modal container
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Focus trap: cycle through focusable elements
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus when modal closes
      if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantStyle = variantClasses[variant];

  return (
    <div
      role="presentation"
      className={`fixed inset-0 z-[100] flex md:items-center items-end justify-center p-2 md:p-4 ${variantStyle.overlay} backdrop-blur-sm animate-fade-in`}
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy || (title ? titleId : undefined)}
        aria-label={ariaLabel}
        className={`w-full ${sizeClasses[size]} ${variantStyle.modal} md:rounded-2xl rounded-t-2xl shadow-2xl animate-slide-up md:animate-slide-up animate-slide-from-bottom overflow-hidden border max-h-[85vh] md:max-h-[90vh] ${className}`}
        style={variant === 'dark' ? {
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        } : undefined}
      >
        {/* Header */}
        {(title || headerIcon || closeButton) && (
          <div className={`flex items-center justify-between p-4 md:p-6 border-b ${variantStyle.header} ${headerClassName}`}>
            <div className="flex items-center gap-3">
              {headerIcon && <div aria-hidden="true">{headerIcon}</div>}
              {title && (
                <h2 id={titleId} className={`text-xl font-bold ${variant === 'dark' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {title}
                </h2>
              )}
            </div>
            {closeButton && (
              <button
                onClick={onClose}
                aria-label="Fechar diálogo"
                className={`p-3 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  variant === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                <X size={20} aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`p-4 md:p-6 overflow-y-auto max-h-[calc(85vh_-_140px)] md:max-h-[calc(90vh_-_140px)] ${contentClassName}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`p-4 md:p-6 border-t ${variantStyle.footer} ${footerClassName}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
