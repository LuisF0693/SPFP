/**
 * SidebarDrawer Component
 * FASE 1: STY-056 (Sidebar Mobile Drawer Implementation)
 *
 * Displays sidebar content as a slide-out drawer on mobile devices
 * Features:
 * - Smooth slide-in/out animation (300ms)
 * - Backdrop with blur effect
 * - Click outside to close
 * - Hamburger menu icon to toggle
 * - Full sidebar content reuse
 */

import React, { useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  children: React.ReactNode;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  onToggle,
  children,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside drawer
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={onToggle}
        className="md:hidden fixed top-6 left-6 z-40 p-2 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Abrir menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Menu size={24} className="text-white" />
        )}
      </button>

      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 md:hidden z-30 transition-opacity duration-300
          ${isOpen ? 'opacity-100 bg-black/40 backdrop-blur-sm' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        ref={drawerRef}
        className={`
          fixed left-0 top-0 h-screen w-72 bg-card-dark z-40
          transition-transform duration-300 ease-out
          border-r border-white/5 shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close button (mobile only) */}
        <div className="absolute top-4 right-4 md:hidden">
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Fechar menu"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          className="h-full overflow-y-auto no-scrollbar pt-14 md:pt-0"
        >
          {children}
        </div>
      </div>

      {/* Spacer for desktop (maintains layout) */}
      <div className="hidden md:block" />
    </>
  );
};

export default SidebarDrawer;
