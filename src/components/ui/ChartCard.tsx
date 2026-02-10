import React, { useState } from 'react';

export type PeriodFilter = '1S' | '1M' | '3M' | '6M' | '1A' | 'ALL';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  filters?: PeriodFilter[];
  defaultFilter?: PeriodFilter;
  onFilterChange?: (filter: PeriodFilter) => void;
  actions?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

const FILTER_LABELS: Record<PeriodFilter, string> = {
  '1S': '1S',
  '1M': '1M',
  '3M': '3M',
  '6M': '6M',
  '1A': '1A',
  'ALL': 'Todos',
};

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  filters = ['1S', '1M', '6M', '1A', 'ALL'],
  defaultFilter = '6M',
  onFilterChange,
  actions,
  loading = false,
  className = '',
}) => {
  const [activeFilter, setActiveFilter] = useState<PeriodFilter>(defaultFilter);

  const handleFilterClick = (filter: PeriodFilter) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  return (
    <div
      className={`
        rounded-2xl bg-white dark:bg-[#1A2233]
        border border-[#e6e8eb] dark:border-[#2e374a]
        p-6 shadow-sm
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-[#111418] dark:text-white text-lg font-bold">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[#637588] dark:text-[#92a4c9] text-sm">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Period Filters */}
          {filters.length > 0 && (
            <div className="flex bg-[#f0f2f5] dark:bg-[#111722] p-1 rounded-lg">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  className={`
                    px-3 py-1 text-xs font-semibold rounded-md transition-all
                    ${activeFilter === filter
                      ? 'bg-white dark:bg-[#2e374a] text-[#135bec] shadow-sm'
                      : 'text-[#637588] dark:text-[#92a4c9] hover:text-[#111418] dark:hover:text-white'
                    }
                  `}
                >
                  {FILTER_LABELS[filter]}
                </button>
              ))}
            </div>
          )}

          {/* Custom Actions */}
          {actions}
        </div>
      </div>

      {/* Chart Content */}
      <div className="relative">
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#135bec]" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default ChartCard;
