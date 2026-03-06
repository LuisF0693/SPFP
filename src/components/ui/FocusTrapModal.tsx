import React, { useEffect, useRef } from 'react';

interface FocusTrapModalProps {
  active: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  initialFocusSelector?: string;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * FocusTrapModal — componente wrapper que garante que o foco do teclado fique
 * contido dentro do modal enquanto ele esta aberto (WCAG 2.1 — 2.1.2 No Keyboard Trap).
 *
 * Uso:
 * <FocusTrapModal active={isOpen} onClose={() => setOpen(false)} ariaLabel="Titulo do modal">
 *   <div role="dialog" aria-modal="true">...</div>
 * </FocusTrapModal>
 */
export const FocusTrapModal: React.FC<FocusTrapModalProps> = ({
  active,
  children,
  onClose,
  initialFocusSelector,
  role = 'dialog',
  ariaLabel,
  ariaLabelledBy,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Salvar elemento com foco atual para restaurar ao fechar
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Mover foco para o primeiro elemento focavel ou o seletor especificado
    const container = containerRef.current;
    if (!container) return;

    const setInitialFocus = () => {
      if (initialFocusSelector) {
        const target = container.querySelector<HTMLElement>(initialFocusSelector);
        if (target) { target.focus(); return; }
      }
      const firstFocusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)[0];
      if (firstFocusable) firstFocusable.focus();
    };

    // Pequeno delay para garantir que o DOM esta pronto
    const timer = setTimeout(setInitialFocus, 50);
    return () => clearTimeout(timer);
  }, [active, initialFocusSelector]);

  useEffect(() => {
    if (!active) {
      // Restaurar foco ao elemento anterior quando o modal fecha
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      // Fechar ao pressionar Escape
      if (e.key === 'Escape' && onClose) {
        e.preventDefault();
        onClose();
        return;
      }

      // Trapping de Tab
      if (e.key !== 'Tab') return;

      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter(el => !el.closest('[disabled]') && el.offsetParent !== null);

      if (focusables.length === 0) { e.preventDefault(); return; }

      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: se foco esta no primeiro, ir para o ultimo
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        // Tab: se foco esta no ultimo, ir para o primeiro
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active, onClose]);

  if (!active) return <>{children}</>;

  return (
    <div
      ref={containerRef}
      role={role}
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </div>
  );
};

export default FocusTrapModal;
