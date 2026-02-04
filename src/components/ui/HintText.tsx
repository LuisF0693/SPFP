/**
 * HintText Component
 * Helper text linked to form inputs via aria-describedby
 * STY-014: WCAG 2.1 AA Accessibility
 *
 * Usage:
 * <HintText id="amount-hint" text="Max 999,999.99"/>
 */

import React from 'react';

interface HintTextProps {
  id: string;
  text: string;
  className?: string;
}

/**
 * HintText Component
 * Displays helper text with unique ID for aria-describedby linking
 */
export const HintText: React.FC<HintTextProps> = ({
  id,
  text,
  className = ''
}) => {
  if (!text) return null;

  return (
    <span
      id={id}
      className={`text-xs text-gray-400 dark:text-gray-500 block mt-1 ${className}`}
      aria-live="polite"
    >
      {text}
    </span>
  );
};

export default HintText;
