import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    label?: string;
    direction?: 'up' | 'down' | 'neutral';
  };
  iconBgColor?: string;
  iconColor?: string;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  iconBgColor = 'bg-[#135bec]/10',
  iconColor = 'text-[#135bec]',
  loading = false,
  className = '',
  onClick,
}) => {
  if (loading) {
    return (
      <div className={`flex flex-col justify-between gap-4 rounded-2xl p-6 bg-white dark:bg-[#1A2233] border border-[#e6e8eb] dark:border-[#2e374a] shadow-sm ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="size-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className={`
        flex flex-col justify-between gap-4 rounded-2xl p-6
        bg-white dark:bg-[#1A2233]
        border border-[#e6e8eb] dark:border-[#2e374a]
        shadow-sm hover:shadow-md transition-all duration-200
        ${onClick ? 'cursor-pointer hover:scale-[1.01]' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-[#637588] dark:text-[#92a4c9] text-sm font-medium uppercase tracking-wider">
            {title}
          </p>
          <p className="text-[#111418] dark:text-white text-2xl xl:text-3xl font-bold tracking-tight">
            {typeof value === 'number' ? formatCurrency(value) : value}
          </p>
          {subtitle && (
            <p className="text-[#637588] dark:text-[#6e85a3] text-xs">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={`size-10 rounded-full ${iconBgColor} flex items-center justify-center ${iconColor}`}>
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-2">
          {(() => {
            const isPositive = trend.direction === 'up' || (typeof trend.value === 'number' && trend.value >= 0);
            const isNegative = trend.direction === 'down' || (typeof trend.value === 'number' && trend.value < 0);
            const isNeutral = trend.direction === 'neutral';

            return (
              <>
                <span
                  className={`
                    text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1
                    ${isPositive ? 'bg-green-500/10 text-green-600 dark:text-green-400' : ''}
                    ${isNegative ? 'bg-red-500/10 text-red-600 dark:text-red-400' : ''}
                    ${isNeutral ? 'bg-gray-500/10 text-gray-600 dark:text-gray-400' : ''}
                  `}
                >
                  {isPositive && <TrendingUp className="w-3 h-3" />}
                  {isNegative && <TrendingDown className="w-3 h-3" />}
                  {typeof trend.value === 'number' ? `${trend.value >= 0 ? '+' : ''}${trend.value}%` : trend.value}
                </span>
                {trend.label && (
                  <p className="text-[#637588] dark:text-[#6e85a3] text-sm">
                    {trend.label}
                  </p>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

// Helper function
function formatCurrency(value: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

export default StatCard;
