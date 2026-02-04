/**
 * Landmark Component
 * Wrapper for ARIA landmark regions to help screen reader navigation
 * STY-014: WCAG 2.1 AA Accessibility
 *
 * Usage:
 * <Landmark role="main" label="Main Content">
 *   Page content
 * </Landmark>
 */

import React from 'react';
import { AriaLandmarks, AriaLandmark } from '../../types/aria.types';

interface LandmarkProps {
  role: AriaLandmark['role'];
  label?: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
  ariaLabelledBy?: string;
}

/**
 * Landmark Component
 * Renders a semantic HTML section with ARIA landmark role and label
 */
export const Landmark: React.FC<LandmarkProps> = ({
  role,
  label,
  id,
  className = '',
  children,
  ariaLabelledBy
}) => {
  const ariaProps: Record<string, string | undefined> = {
    role,
    ...(label && { 'aria-label': label }),
    ...(ariaLabelledBy && { 'aria-labelledby': ariaLabelledBy })
  };

  return (
    <section
      id={id}
      className={className}
      {...ariaProps}
    >
      {children}
    </section>
  );
};

export default Landmark;
