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
    if (!isOpen || !modalRef.current) return;

    // Store the previously focused element so we can restore it
    const previouslyFocusedElement = document.activeElement as HTMLElement;

    // Get all focusable elements within modal
    const getFocusableElements = () => {
      const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"]';
      return Array.from(modalRef.current?.querySelectorAll(focusableSelectors) || []) as HTMLElement[];
    };

    // Focus the first focusable element in modal
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Find first element that's not the close button or hidden
      const firstFocusable = focusableElements.find(el => {
        const isCloseBtn = el.getAttribute('aria-label')?.includes('Fechar');
        return !isCloseBtn && el.offsetParent !== null;
      }) || focusableElements[0];

      setTimeout(() => firstFocusable?.focus(), 0);
    }

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC key closes modal
      if (e.key === 'Escape' && e.target !== document.body) {
        e.preventDefault();
        onClose();
        return;
      }

      // Focus trap: cycle through focusable elements
      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];
        const activeElement = document.activeElement as HTMLElement;

        if (e.shiftKey) {
          if (activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    // Add event listener to modal instead of document for better isolation
    modalRef.current.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      modalRef.current?.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus when modal closes
      if (previouslyFocusedElement && previouslyFocusedElement.offsetParent !== null) {
        previouslyFocusedElement.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantStyle = variantClasses[variant];

  return (
    <div
      role="presentation"
      className={`fixed inset-0 z-[100] flex md:items-center items-end justify-center p-0 md:p-4 ${variantStyle.overlay} backdrop-blur-sm animate-fade-in`}
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
        className={`w-full md:w-auto md:${sizeClasses[size]} ${variantStyle.modal} rounded-t-2xl md:rounded-2xl shadow-2xl animate-slide-up md:animate-slide-up animate-slide-from-bottom overflow-hidden border max-h-[100vh] md:max-h-[90vh] md:max-w-lg ${className}`}
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
