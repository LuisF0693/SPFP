import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
  circle?: boolean;
  variant?: 'card' | 'text' | 'avatar' | 'line';
}

/**
 * Skeleton Loading Component
 * Displays placeholder animations while content loads
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  count = 1,
  height = 'h-4',
  width = 'w-full',
  circle = false,
  variant = 'text',
}) => {
  const baseClasses = 'bg-gradient-to-r from-gray-700/30 via-gray-600/30 to-gray-700/30 animate-pulse';

  const variantClasses = {
    card: 'rounded-3xl min-h-64',
    text: `rounded-md ${height} ${width}`,
    avatar: 'rounded-2xl h-16 w-16',
    line: `rounded-md ${height} ${width}`,
  };

  const circleClasses = circle ? 'rounded-full' : '';

  const baseClass = `${baseClasses} ${variantClasses[variant]} ${circleClasses} ${className}`;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={baseClass} />
      ))}
    </>
  );
};

/**
 * SkeletonCard: Skeleton for card-like content
 */
export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="glass p-6 rounded-3xl space-y-4">
        {/* Avatar + Header */}
        <div className="flex items-center space-x-4">
          <Skeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <Skeleton width="w-32" height="h-4" />
            <Skeleton width="w-48" height="h-3" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Skeleton width="w-full" height="h-3" />
          <Skeleton width="w-5/6" height="h-3" />
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-4 border-t border-white/5">
          <Skeleton width="w-20" height="h-3" />
          <Skeleton width="w-20" height="h-3" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * SkeletonGrid: Multiple skeleton cards in a grid
 */
export const SkeletonGrid: React.FC<{ cols?: number; count?: number }> = ({
  cols = 3,
  count = 6,
}) => {
  const gridClass = `grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols}`;

  return (
    <div className={gridClass}>
      <SkeletonCard count={count} />
    </div>
  );
};
