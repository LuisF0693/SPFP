/**
 * FormGroup Molecule Component
 * Wrapper for radio/checkbox groups with proper ARIA fieldset/legend
 * STY-014: WCAG 2.1 AA Accessibility
 *
 * Usage:
 * <FormGroup legend="Choose a category" name="category">
 *   <label>
 *     <input type="radio" name="category" value="food" /> Groceries
 *   </label>
 * </FormGroup>
 */

import React from 'react';

interface FormGroupProps {
  legend: string;
  name: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * FormGroup Molecule Component
 * Wrapper using <fieldset> and <legend> for proper ARIA grouping
 * Use for radio groups, checkbox groups, or other related form elements
 */
export const FormGroup: React.FC<FormGroupProps> = ({
  legend,
  name,
  required = false,
  error,
  className = '',
  children
}) => {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <fieldset
      className={`space-y-3 border border-gray-700 rounded-lg p-4 ${className}`}
      role="group"
      {...(errorId && { 'aria-describedby': errorId })}
    >
      <legend className="text-sm font-medium text-gray-200 dark:text-gray-100">
        {legend}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </legend>

      <div className="space-y-2">
        {children}
      </div>

      {error && (
        <div
          id={errorId}
          role="alert"
          className="flex items-center gap-2 text-red-500 text-sm font-medium mt-2"
          aria-live="assertive"
        >
          <span>{error}</span>
        </div>
      )}
    </fieldset>
  );
};

export default FormGroup;
