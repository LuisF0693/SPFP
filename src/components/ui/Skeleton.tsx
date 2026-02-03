import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'table-row' | 'chart';
  count?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
}

/**
 * Skeleton Loader Component (STY-019)
 * Displays placeholder content while data is loading
 * Supports multiple variants for different content types
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  count = 1,
  width = '100%',
  height = variant === 'avatar' ? 40 : variant === 'button' ? 40 : 16,
  className = ''
}) => {
  const getSkeletonClass = () => {
    const base = 'bg-gray-700/30 dark:bg-gray-600/20 rounded animate-pulse';

    switch (variant) {
      case 'avatar':
        return `${base} rounded-full`;
      case 'card':
        return `${base} rounded-2xl`;
      case 'button':
        return `${base} rounded-lg`;
      case 'table-row':
        return base;
      case 'chart':
        return `${base} rounded-lg`;
      default:
        return base;
    }
  };

  const renderSkeleton = () => {
    const style = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
    };

    if (variant === 'card') {
      return (
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 space-y-3">
              <div className="h-6 bg-gray-700/30 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700/30 rounded"></div>
              <div className="h-4 bg-gray-700/30 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      );
    }

    if (variant === 'table-row') {
      return (
        <div className="space-y-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex gap-4 h-12 bg-[#0f172a] border border-gray-800 rounded-lg p-4 items-center">
              <div className="w-6 h-6 bg-gray-700/30 rounded"></div>
              <div className="h-4 bg-gray-700/30 rounded flex-1"></div>
              <div className="h-4 bg-gray-700/30 rounded w-1/4"></div>
              <div className="h-4 bg-gray-700/30 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      );
    }

    if (variant === 'chart') {
      return (
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="h-6 bg-gray-700/30 rounded w-1/2"></div>
          <div className="flex items-end gap-2 h-48">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gray-700/30 rounded-t"
                style={{ height: `${Math.random() * 100 + 20}px` }}
              ></div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={getSkeletonClass()}
            style={style}
          />
        ))}
      </div>
    );
  };

  return <div className={className}>{renderSkeleton()}</div>;
};

export default Skeleton;
