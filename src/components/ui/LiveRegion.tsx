/**
 * LiveRegion Component
 * Wrapper for aria-live announcements
 * STY-014: WCAG 2.1 AA Accessibility
 *
 * Usage:
 * <LiveRegion type="status" message="Balance updated: $500"/>
 * <LiveRegion type="alert" message="Error: Invalid amount"/>
 */

import React from 'react';

type LiveRegionType = 'status' | 'alert' | 'log';

interface LiveRegionProps {
  type: LiveRegionType;
  message?: string;
  label?: string;
  id?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * LiveRegion Component
 * Renders an aria-live region for announcements
 * Use to announce data updates, errors, or status changes
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
  type,
  message,
  label,
  id,
  className = 'sr-only',
  children
}) => {
  const getAriaLive = (t: LiveRegionType) => {
    if (t === 'alert') return 'assertive';
    return 'polite';
  };

  const getRole = (t: LiveRegionType) => {
    if (t === 'alert') return 'alert';
    if (t === 'log') return 'log';
    return 'status';
  };

  return (
    <div
      id={id}
      role={getRole(type)}
      aria-live={getAriaLive(type)}
      aria-atomic="true"
      className={className}
      {...(label && { 'aria-label': label })}
    >
      {message || children}
    </div>
  );
};

export default LiveRegion;
