import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Filter, Download, Search, X } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  title?: string;
  onRowClick?: (item: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  exportable?: boolean;
  onExport?: () => void;
  filterable?: boolean;
  filterOptions?: { label: string; value: string }[];
  onFilterChange?: (value: string) => void;
  emptyMessage?: string;
  loading?: boolean;
  maxHeight?: string;
  showFooter?: boolean;
  footerContent?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  title,
  onRowClick,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  searchKeys = [],
  exportable = false,
  onExport,
  filterable = false,
  filterOptions = [],
  onFilterChange,
  emptyMessage = 'Nenhum dado encontrado',
  loading = false,
  maxHeight,
  showFooter = false,
  footerContent,
  className = '',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');

  // Handle sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchTerm && searchKeys.length > 0) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          return value && String(value).toLowerCase().includes(lowerSearch);
        })
      );
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aValue = (a as any)[sortKey];
        const bValue = (b as any)[sortKey];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, searchKeys, sortKey, sortDirection]);

  const handleFilterClick = (value: string) => {
    setActiveFilter(value);
    onFilterChange?.(value);
  };

  return (
    <div
      className={`
        rounded-2xl bg-white dark:bg-[#1A2233]
        border border-[#e6e8eb] dark:border-[#2e374a]
        overflow-hidden shadow-sm
        ${className}
      `}
    >
      {/* Header */}
      {(title || searchable || filterable || exportable) && (
        <div className="p-6 border-b border-[#e6e8eb] dark:border-[#2e374a] flex flex-wrap justify-between items-center gap-4">
          {title && (
            <h3 className="text-[#111418] dark:text-white text-lg font-bold">
              {title}
            </h3>
          )}

          <div className="flex items-center gap-2">
            {/* Search */}
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#637588]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-9 pr-8 py-2 bg-[#f0f2f5] dark:bg-[#111722] border-none rounded-lg text-sm text-[#111418] dark:text-white placeholder-[#637588] focus:outline-none focus:ring-2 focus:ring-[#135bec] w-48"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#637588] hover:text-[#111418] dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Filter */}
            {filterable && filterOptions.length > 0 && (
              <div className="relative">
                <select
                  value={activeFilter}
                  onChange={(e) => handleFilterClick(e.target.value)}
                  className="appearance-none pl-9 pr-8 py-2 bg-[#f0f2f5] dark:bg-[#111722] border-none rounded-lg text-sm text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#135bec]"
                >
                  <option value="">Todos</option>
                  {filterOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#637588] pointer-events-none" />
              </div>
            )}

            {/* Export */}
            {exportable && (
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-4 py-2 bg-[#f0f2f5] dark:bg-[#111722] hover:bg-[#e4e6e9] dark:hover:bg-[#1a2233] rounded-lg text-sm font-medium text-[#111418] dark:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className={`overflow-x-auto ${maxHeight ? `max-h-[${maxHeight}] overflow-y-auto` : ''}`}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0">
            <tr className="bg-[#fcfcfd] dark:bg-[#151c2a] border-b border-[#e6e8eb] dark:border-[#2e374a]">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`
                    p-4 text-xs font-semibold text-[#637588] dark:text-[#92a4c9] uppercase tracking-wider
                    ${column.sortable ? 'cursor-pointer hover:text-[#111418] dark:hover:text-white select-none' : ''}
                    ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                  `}
                  style={column.width ? { width: column.width } : undefined}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className={`flex items-center gap-1 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : ''}`}>
                    {column.header}
                    {column.sortable && sortKey === column.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e8eb] dark:divide-[#2e374a]">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((column, j) => (
                    <td key={j} className="p-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : processedData.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-[#637588] dark:text-[#92a4c9]">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              // Data rows
              processedData.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className={`
                    group hover:bg-[#f8f9fa] dark:hover:bg-[#1e2532] transition-colors
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`
                        p-4 text-sm text-[#111418] dark:text-white
                        ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                      `}
                    >
                      {column.render
                        ? column.render(item)
                        : String((item as any)[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="p-4 border-t border-[#e6e8eb] dark:border-[#2e374a] flex justify-center">
          {footerContent || (
            <span className="text-sm text-[#637588] dark:text-[#92a4c9]">
              {processedData.length} item(s)
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default DataTable;
