import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing focus within modal and dialog components
 * Implements WCAG 2.1 AA focus management:
 * - Traps focus within modal
 * - Restores focus to triggering element on close
 * - Sets initial focus to appropriate element
 * - Handles keyboard escape to close
 */
export const useFocusManager = (
  isOpen: boolean,
  onClose: () => void,
  containerRef: React.RefObject<HTMLElement>,
  initialFocusSelector?: string
) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Store previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Get focusable elements
    const focusableSelectors = [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]',
    ].join(', ');

    const focusableElements = Array.from(
      containerRef.current.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    if (focusableElements.length === 0) return;

    // Set initial focus
    let initialElement: HTMLElement | null = null;

    if (initialFocusSelector) {
      initialElement = containerRef.current.querySelector(
        initialFocusSelector
      ) as HTMLElement | null;
    }

    if (!initialElement) {
      // Find first interactive element (skip close button if possible)
      initialElement = focusableElements.find((el) => {
        const isCloseBtn = el.getAttribute('aria-label')?.toLowerCase().includes('fechar');
        const isHidden = el.offsetParent === null;
        return !isCloseBtn && !isHidden;
      }) || focusableElements[0];
    }

    // Focus with slight delay to allow DOM to settle
    if (initialElement) {
      requestAnimationFrame(() => {
        initialElement?.focus();
      });
    }

    // Keyboard event handler
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key closes modal
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Tab key cycles focus
      if (e.key === 'Tab' && focusableElements.length > 0) {
        const currentIndex = focusableElements.indexOf(
          document.activeElement as HTMLElement
        );

        if (e.shiftKey) {
          // Shift+Tab backwards
          if (currentIndex === 0) {
            e.preventDefault();
            focusableElements[focusableElements.length - 1]?.focus();
          }
        } else {
          // Tab forwards
          if (currentIndex === focusableElements.length - 1) {
            e.preventDefault();
            focusableElements[0]?.focus();
          }
        }
      }
    };

    // Prevent scrolling on Tab
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Allow browser to handle tab naturally within modal
      }
    };

    containerRef.current.addEventListener('keydown', handleKeyDown);
    containerRef.current.addEventListener('keyup', handleKeyUp);

    // Cleanup: restore focus when modal closes
    return () => {
      containerRef.current?.removeEventListener('keydown', handleKeyDown);
      containerRef.current?.removeEventListener('keyup', handleKeyUp);

      if (previousFocusRef.current && previousFocusRef.current.offsetParent !== null) {
        requestAnimationFrame(() => {
          previousFocusRef.current?.focus();
        });
      }
    };
  }, [isOpen, onClose, containerRef, initialFocusSelector]);
};

/**
 * Hook to handle global keyboard shortcuts (Escape key)
 * Useful for overlay dismissal
 */
export const useEscapeKey = (callback: () => void, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callback, enabled]);
};

/**
 * Hook to manage focus visibility and styling
 * Adds/removes focus-visible class based on interaction type
 */
export const useFocusVisible = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    const handleMouseDown = () => {
      element.classList.remove('focus-visible');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        element.classList.add('focus-visible');
      }
    };

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref]);
};
