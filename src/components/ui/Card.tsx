import React from 'react';

type CardVariant = 'dark' | 'light' | 'glass' | 'outlined' | 'elevated';
type CardSize = 'sm' | 'md' | 'lg';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  size?: CardSize;
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isHoverable?: boolean;
  isClickable?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const variantClasses = {
  dark: 'bg-[#0f172a] border border-gray-800 text-white',
  light: 'bg-white text-gray-900 border border-gray-200 shadow-sm',
  glass: 'bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 text-white backdrop-blur-sm',
  outlined: 'bg-transparent border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white',
  elevated: 'bg-[#1e293b] border border-gray-700 text-white shadow-lg',
};

const sizeClasses = {
  sm: 'p-3 rounded-lg',
  md: 'p-6 rounded-xl',
  lg: 'p-8 rounded-2xl',
};

const hoverClasses = {
  dark: 'hover:border-gray-700 hover:bg-[#0f172a]/80 transition-all',
  light: 'hover:shadow-md hover:border-gray-300 transition-all',
  glass: 'hover:bg-white/10 hover:border-white/20 transition-all',
  outlined: 'hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all',
  elevated: 'hover:shadow-xl hover:border-gray-600 transition-all',
};

/**
 * Reusable Card component
 * Consolidates 7 distinct card patterns across 18+ files
 * Supports variants (dark, light, glass, outlined, elevated) and sizes (sm, md, lg)
 */
export const Card: React.FC<CardProps> = ({
  variant = 'dark',
  size = 'md',
  children,
  header,
  footer,
  isHoverable = false,
  isClickable = false,
  icon,
  className = '',
  role = isClickable ? 'button' : 'article',
  tabIndex = isClickable ? 0 : undefined,
  ...props
}) => {
  const cardClasses = `
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${isHoverable ? hoverClasses[variant] : ''}
    ${isClickable ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400' : ''}
    overflow-hidden
    relative group
    ${className}
  `.trim();

  return (
    <div
      className={cardClasses}
      role={role}
      tabIndex={tabIndex}
      {...props}
    >
      {/* Header */}
      {header && (
        <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-current border-opacity-10">
          <div className="flex items-center gap-3">
            {icon && <div className="text-xl" aria-hidden="true">{icon}</div>}
            <div>{header}</div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-10">
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * Preset card variants for common use cases
 */
export const DarkCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="dark" {...props} />
);

export const GlassCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="glass" {...props} />
);

export const LightCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="light" {...props} />
);
