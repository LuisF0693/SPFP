import React from 'react';
import { LucideIcon } from 'lucide-react';

type InputType = 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'url';
type InputSize = 'sm' | 'md' | 'lg';

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: InputType;
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon | React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: InputSize;
  variant?: 'default' | 'filled';
  helperText?: string;
  required?: boolean;
}

const sizeClasses = {
  sm: 'py-2 px-3 text-xs',
  md: 'py-3 px-4 text-sm',
  lg: 'py-4 px-5 text-base',
};

const variantClasses = {
  default: 'bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700',
  filled: 'bg-gray-100 dark:bg-gray-800 border-0',
};

/**
 * Reusable FormInput component
 * Consolidates 47+ hardcoded input patterns across form components
 */
export const FormInput: React.FC<FormInputProps> = ({
  type = 'text',
  label,
  error,
  hint,
  icon: Icon,
  iconPosition = 'left',
  size = 'md',
  variant = 'default',
  helperText,
  required,
  className = '',
  id,
  disabled,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const inputClasses = `
    w-full
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    rounded-xl
    outline-none
    text-gray-900 dark:text-white
    placeholder-gray-400 dark:placeholder-gray-500
    transition-colors
    focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20
    ${error ? 'border-red-500 dark:border-red-500 focus:ring-red-500/20' : ''}
    ${iconPosition === 'left' ? 'pl-9' : ''}
    ${iconPosition === 'right' ? 'pr-9' : ''}
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `.trim();

  const isIconReactNode = Icon && typeof Icon !== 'function';

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          type={type}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />

        {Icon && (
          <div className={`absolute top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none ${
            iconPosition === 'left' ? 'left-3' : 'right-3'
          }`}>
            {isIconReactNode ? Icon : <Icon size={18} />}
          </div>
        )}
      </div>

      {error && <span className="text-xs text-red-500">{error}</span>}
      {hint && <span className="text-xs text-gray-500 dark:text-gray-400">{hint}</span>}
      {helperText && <span className="text-xs text-gray-500 dark:text-gray-400">{helperText}</span>}
    </div>
  );
};
