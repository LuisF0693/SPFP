import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { ChartCard } from '../ui/ChartCard';
import { ActionButton } from '../ui/ActionButton';
import { PortfolioStats } from './PortfolioStats';
import { AssetAllocation } from './AssetAllocation';
import { AssetTable } from './AssetTable';
import { InvestmentFormModal } from './InvestmentFormModal';
import { EvolutionChart } from './EvolutionChart';
import { usePortfolio } from '../../hooks/usePortfolio';

export const Portfolio: React.FC = () => {
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const {
    investments,
    loading,
    stats,
    allocationData,
    evolutionData,
    addInvestment,
    updateInvestment,
    deleteInvestment
  } = usePortfolio();

  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#101622]">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-[#111418] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
              Painel de Investimentos
            </h2>
            <p className="text-[#637588] dark:text-[#92a4c9] text-base font-normal">
              {stats.dailyReturn >= 0
                ? `Bem-vindo de volta. Seus rendimentos aumentaram ${stats.dailyReturn.toFixed(1)}% hoje.`
                : `Bem-vindo de volta. Seus rendimentos caíram ${Math.abs(stats.dailyReturn).toFixed(1)}% hoje.`
              }
            </p>
          </div>
          <ActionButton
            label="Novo Aporte"
            icon={<Plus className="w-5 h-5" />}
            onClick={() => setShowInvestmentModal(true)}
          />
        </div>

        {/* Stats Cards */}
        <PortfolioStats stats={stats} loading={loading} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Evolution Chart (2/3) */}
          <div className="xl:col-span-2">
            <ChartCard
              title="Evolução Patrimonial"
              subtitle="Histórico de valorização dos ativos"
              loading={loading}
            >
              <EvolutionChart data={evolutionData} />
            </ChartCard>
          </div>

          {/* Allocation Chart (1/3) */}
          <AssetAllocation data={allocationData} loading={loading} />
        </div>

        {/* Assets Table */}
        <AssetTable
          investments={investments}
          loading={loading}
          onEdit={(investment) => {
            // TODO: Open edit modal
            console.log('Edit:', investment);
          }}
          onDelete={deleteInvestment}
        />

        {/* Investment Modal */}
        {showInvestmentModal && (
          <InvestmentFormModal
            onClose={() => setShowInvestmentModal(false)}
            onSave={addInvestment}
          />
        )}
      </div>
    </div>
  );
};

export default Portfolio;
