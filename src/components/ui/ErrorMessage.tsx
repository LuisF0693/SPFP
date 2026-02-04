/**
 * ErrorMessage Component
 * Accessible error display with role="alert"
 * STY-014: WCAG 2.1 AA Accessibility
 *
 * Usage:
 * <ErrorMessage id="amount-error" message="Amount must be greater than 0"/>
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  id: string;
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * ErrorMessage Component
 * Displays error messages with proper ARIA attributes
 * Used with aria-describedby on form inputs
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  id,
  message,
  icon = <AlertCircle size={16} />,
  className = ''
}) => {
  if (!message) return null;

  return (
    <div
      id={id}
      role="alert"
      className={`flex items-center gap-2 text-red-500 text-sm font-medium mt-1 ${className}`}
      aria-live="assertive"
    >
      {icon}
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
