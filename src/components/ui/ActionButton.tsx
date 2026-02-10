import React from 'react';
import { Plus } from 'lucide-react';

export interface ActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button',
}) => {
  const baseStyles = `
    group flex items-center justify-center gap-2 font-bold rounded-lg
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    primary: `
      bg-[#135bec] hover:bg-[#1048c7] text-white
      shadow-lg shadow-[#135bec]/20
      hover:shadow-xl hover:shadow-[#135bec]/30
      active:scale-[0.98]
    `,
    secondary: `
      bg-[#f0f2f5] dark:bg-[#111722]
      hover:bg-[#e4e6e9] dark:hover:bg-[#1a2233]
      text-[#111418] dark:text-white
      border border-[#e6e8eb] dark:border-[#2e374a]
    `,
    ghost: `
      bg-transparent hover:bg-[#f0f2f5] dark:hover:bg-[#1a2233]
      text-[#637588] dark:text-[#92a4c9]
      hover:text-[#111418] dark:hover:text-white
    `,
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {icon || (variant === 'primary' && <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />)}
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

export default ActionButton;
