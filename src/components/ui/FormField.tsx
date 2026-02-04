/**
 * FormField Molecule Component
 * Combines Label + Input + Hint + Error with proper ARIA associations
 * STY-014: WCAG 2.1 AA Accessibility
 *
 * Usage:
 * <FormField
 *   label="Amount"
 *   id="amount"
 *   type="number"
 *   error="Amount must be greater than 0"
 *   hint="Max 999,999.99"
 *   required
 * />
 */

import React, { useState } from 'react';
import { ErrorMessage } from './ErrorMessage';
import { HintText } from './HintText';

interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'tel';
  value?: string | number;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  inputMode?: 'text' | 'decimal' | 'numeric' | 'tel' | 'email' | 'url';
}

/**
 * FormField Molecule Component
 * Wrapper combining label, input, hint, and error with ARIA associations
 * Ensures accessibility with aria-describedby, aria-invalid, aria-required
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  name,
  type = 'text',
  value,
  placeholder,
  error,
  hint,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  onChange,
  onBlur,
  min,
  max,
  step,
  inputMode
}) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedByIds = [hintId, errorId].filter(Boolean).join(' ');

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-200 dark:text-gray-100"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          w-full px-3 py-2 min-h-[44px] text-base
          bg-white/5 border border-gray-700 rounded-lg
          text-gray-100 placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
          disabled:opacity-50 disabled:cursor-not-allowed
          dark:bg-white/5 dark:border-gray-700 dark:text-gray-100
          transition-all
          ${error ? 'border-red-500' : 'border-gray-700'}
          ${inputClassName}
        `}
        aria-label={label}
        aria-invalid={!!error}
        aria-required={required}
        {...(describedByIds && { 'aria-describedby': describedByIds })}
        onChange={onChange}
        onBlur={onBlur}
        {...(min !== undefined && { min })}
        {...(max !== undefined && { max })}
        {...(step !== undefined && { step })}
        {...(inputMode && { inputMode })}
      />

      {hint && <HintText id={hintId!} text={hint} />}
      {error && <ErrorMessage id={errorId!} message={error} />}
    </div>
  );
};

export default FormField;
