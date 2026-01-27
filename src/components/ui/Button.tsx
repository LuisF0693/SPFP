import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outlined';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50',
  secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600',
  danger: 'bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  ghost: 'text-gray-400 hover:bg-white/10 hover:text-white',
  outlined: 'border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800',
};

const sizeClasses = {
  sm: 'py-2 px-3 text-xs rounded-lg',
  md: 'py-3 px-4 text-sm rounded-xl',
  lg: 'py-3 px-6 text-base rounded-xl',
};

/**
 * Reusable Button component with variants and sizes
 * Consolidates 20+ hardcoded button patterns across the codebase
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const buttonClasses = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    font-bold
    transition-all
    flex items-center justify-center gap-2
    ${fullWidth ? 'w-full' : ''}
    ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  const isIconOnly = !children && icon;

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={buttonClasses}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText || children}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {!isIconOnly && children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
};
