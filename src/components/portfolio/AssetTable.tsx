import React from 'react';
import { Trash2, Edit2, TrendingUp, TrendingDown } from 'lucide-react';
import { DataTable, Column } from '../ui/DataTable';
import { Investment, INVESTMENT_TYPE_LABELS } from '../../types/investments';

interface AssetTableProps {
  investments: Investment[];
  loading?: boolean;
  onEdit?: (investment: Investment) => void;
  onDelete?: (id: string) => void;
}

export const AssetTable: React.FC<AssetTableProps> = ({
  investments,
  loading,
  onEdit,
  onDelete,
}) => {
  const formatCurrency = (value: number, currency: string = 'BRL'): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(value);
  };

  const columns: Column<Investment>[] = [
    {
      key: 'name',
      header: 'Ativo',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-white dark:bg-[#2e374a] flex items-center justify-center text-xs font-bold shadow-sm border border-gray-100 dark:border-gray-700">
            {item.ticker || item.name.substring(0, 4).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-bold text-[#111418] dark:text-white">
              {item.name}
            </p>
            <p className="text-xs text-[#637588] dark:text-[#92a4c9]">
              {INVESTMENT_TYPE_LABELS[item.type] || item.type}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantidade',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="text-sm font-medium text-[#111418] dark:text-white">
          {item.quantity.toLocaleString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'average_price',
      header: 'Preço Médio',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="text-sm text-[#637588] dark:text-[#92a4c9]">
          {formatCurrency(item.average_price, item.currency)}
        </span>
      ),
    },
    {
      key: 'current_price',
      header: 'Preço Atual',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="text-sm font-medium text-[#111418] dark:text-white">
          {item.current_price
            ? formatCurrency(item.current_price, item.currency)
            : '-'}
        </span>
      ),
    },
    {
      key: 'total_value',
      header: 'Valor Total',
      sortable: true,
      align: 'right',
      render: (item) => {
        const total = item.quantity * (item.current_price || item.average_price);
        return (
          <span className="text-sm font-bold text-[#111418] dark:text-white">
            {formatCurrency(total, item.currency)}
          </span>
        );
      },
    },
    {
      key: 'return_percentage',
      header: 'Rentabilidade',
      sortable: true,
      align: 'right',
      render: (item) => {
        if (!item.current_price) return <span className="text-[#637588]">-</span>;

        const returnPct =
          ((item.current_price - item.average_price) / item.average_price) * 100;
        const isPositive = returnPct >= 0;

        return (
          <div
            className={`
              inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
              ${isPositive
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
              }
            `}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isPositive ? '+' : ''}{returnPct.toFixed(2)}%
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '80px',
      render: (item) => (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="p-1.5 rounded-lg hover:bg-[#f0f2f5] dark:hover:bg-[#2e374a] text-[#637588] hover:text-[#135bec] transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Tem certeza que deseja excluir este investimento?')) {
                  onDelete(item.id);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[#637588] hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const filterOptions = [
    { label: 'Ações', value: 'acao' },
    { label: 'FIIs', value: 'fii' },
    { label: 'Renda Fixa', value: 'renda_fixa' },
    { label: 'Tesouro', value: 'tesouro' },
    { label: 'CDB', value: 'cdb' },
    { label: 'Stocks', value: 'stock' },
    { label: 'REITs', value: 'reit' },
    { label: 'Fundos', value: 'fundo' },
  ];

  const handleExport = () => {
    // Generate CSV
    const headers = ['Ativo', 'Tipo', 'Quantidade', 'Preço Médio', 'Preço Atual', 'Valor Total', 'Rentabilidade'];
    const rows = investments.map((inv) => {
      const total = inv.quantity * (inv.current_price || inv.average_price);
      const returnPct = inv.current_price
        ? ((inv.current_price - inv.average_price) / inv.average_price) * 100
        : 0;

      return [
        inv.name,
        INVESTMENT_TYPE_LABELS[inv.type],
        inv.quantity,
        inv.average_price,
        inv.current_price || inv.average_price,
        total,
        `${returnPct.toFixed(2)}%`,
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `portfolio_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <DataTable
      title="Meus Ativos"
      columns={columns}
      data={investments}
      keyExtractor={(item) => item.id}
      loading={loading}
      searchable
      searchPlaceholder="Buscar ativo..."
      searchKeys={['name', 'ticker']}
      filterable
      filterOptions={filterOptions}
      exportable
      onExport={handleExport}
      emptyMessage="Nenhum investimento cadastrado. Adicione seu primeiro aporte!"
      showFooter
      footerContent={
        <button className="text-sm font-semibold text-[#135bec] hover:text-[#1048c7] transition-colors">
          Ver todos os ativos
        </button>
      }
    />
  );
};

export default AssetTable;
