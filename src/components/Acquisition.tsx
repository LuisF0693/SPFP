/**
 * Acquisition Component
 * STY-054: Tool for comparing acquisition methods (cash, financing, consortium)
 *
 * Features:
 * - Input form for asset value and financing details
 * - Comparison table of 3 scenarios
 * - Bar chart visualization
 * - Recommendation based on total cost
 */

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { Building, Car, Calculator, Check, AlertTriangle, Info } from 'lucide-react';

type AssetType = 'REAL_ESTATE' | 'VEHICLE';

interface AcquisitionInput {
  assetType: AssetType;
  assetValue: number;
  availableDownPayment: number;
  financingRate: number; // annual rate
  financingTerm: number; // months
  consortiumAdminRate: number; // total admin rate
  consortiumTerm: number; // months
}

interface AcquisitionScenario {
  type: 'CASH' | 'FINANCING' | 'CONSORTIUM';
  name: string;
  totalCost: number;
  monthlyPayment: number;
  term: number;
  savings: number; // compared to most expensive
  pros: string[];
  cons: string[];
}

const COLORS = {
  CASH: '#10B981',
  FINANCING: '#EF4444',
  CONSORTIUM: '#3B82F6',
};

const DEFAULT_VALUES: Record<AssetType, Partial<AcquisitionInput>> = {
  REAL_ESTATE: {
    assetValue: 500000,
    availableDownPayment: 100000,
    financingRate: 12,
    financingTerm: 360,
    consortiumAdminRate: 18,
    consortiumTerm: 200,
  },
  VEHICLE: {
    assetValue: 80000,
    availableDownPayment: 20000,
    financingRate: 24,
    financingTerm: 48,
    consortiumAdminRate: 15,
    consortiumTerm: 72,
  },
};

export const Acquisition: React.FC = () => {
  const [input, setInput] = useState<AcquisitionInput>({
    assetType: 'REAL_ESTATE',
    assetValue: 500000,
    availableDownPayment: 100000,
    financingRate: 12,
    financingTerm: 360,
    consortiumAdminRate: 18,
    consortiumTerm: 200,
  });

  // Handle asset type change
  const handleAssetTypeChange = (type: AssetType) => {
    setInput({
      ...input,
      assetType: type,
      ...DEFAULT_VALUES[type],
    });
  };

  // Calculate scenarios
  const scenarios = useMemo((): AcquisitionScenario[] => {
    const results: AcquisitionScenario[] = [];

    // 1. Cash (with 10% discount)
    const cashDiscount = 0.10;
    const cashTotal = input.assetValue * (1 - cashDiscount);
    results.push({
      type: 'CASH',
      name: 'À Vista',
      totalCost: cashTotal,
      monthlyPayment: 0,
      term: 0,
      savings: 0,
      pros: ['Sem juros', 'Desconto de 10%', 'Propriedade imediata', 'Poder de negociação'],
      cons: ['Imobiliza capital', 'Perde rendimentos do dinheiro'],
    });

    // 2. Financing (PRICE system)
    const pv = input.assetValue - input.availableDownPayment; // Principal
    const monthlyRate = input.financingRate / 100 / 12;
    const n = input.financingTerm;

    // PMT = PV * [r(1+r)^n] / [(1+r)^n - 1]
    const pmt = pv > 0 && monthlyRate > 0
      ? pv * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
      : pv / n;

    const financingTotal = input.availableDownPayment + (pmt * n);

    results.push({
      type: 'FINANCING',
      name: 'Financiamento',
      totalCost: financingTotal,
      monthlyPayment: pmt,
      term: n,
      savings: 0,
      pros: ['Possui o bem imediatamente', 'Parcelas fixas', 'Pode usar FGTS (imóveis)'],
      cons: ['Juros altos', 'Risco de inadimplência', 'Bem como garantia'],
    });

    // 3. Consortium
    const consortiumTotal = input.assetValue * (1 + input.consortiumAdminRate / 100);
    const consortiumMonthly = consortiumTotal / input.consortiumTerm;

    results.push({
      type: 'CONSORTIUM',
      name: 'Consórcio',
      totalCost: consortiumTotal,
      monthlyPayment: consortiumMonthly,
      term: input.consortiumTerm,
      savings: 0,
      pros: ['Sem juros', 'Disciplina de poupança', 'Taxa admin menor que juros'],
      cons: ['Não tem o bem imediatamente', 'Depende de sorteio ou lance'],
    });

    // Calculate savings (compared to most expensive)
    const maxCost = Math.max(...results.map(r => r.totalCost));
    results.forEach(r => {
      r.savings = maxCost - r.totalCost;
    });

    return results.sort((a, b) => a.totalCost - b.totalCost);
  }, [input]);

  // Best option
  const bestOption = scenarios[0];

  // Chart data
  const chartData = scenarios.map(s => ({
    name: s.name,
    value: s.totalCost,
    type: s.type,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-white font-bold">{data.name}</p>
        <p className="text-lg" style={{ color: COLORS[data.type as keyof typeof COLORS] }}>
          {formatCurrency(data.value)}
        </p>
      </div>
    );
  };

  return (
    <main className="p-4 md:p-6 min-h-full space-y-6 animate-fade-in pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span>🏠</span> Análise de Aquisição
        </h1>
        <p className="text-gray-500 mt-1">
          Compare as melhores formas de adquirir seu imóvel ou veículo
        </p>
      </div>

      {/* Asset Type Selector */}
      <div className="flex gap-4">
        <button
          onClick={() => handleAssetTypeChange('REAL_ESTATE')}
          className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${
            input.assetType === 'REAL_ESTATE'
              ? 'border-blue-500 bg-blue-500/10 text-blue-500'
              : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
          }`}
        >
          <Building size={24} />
          <span className="font-bold">Imóvel</span>
        </button>
        <button
          onClick={() => handleAssetTypeChange('VEHICLE')}
          className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${
            input.assetType === 'VEHICLE'
              ? 'border-blue-500 bg-blue-500/10 text-blue-500'
              : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
          }`}
        >
          <Car size={24} />
          <span className="font-bold">Veículo</span>
        </button>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calculator size={20} /> Dados do Bem
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Valor do Bem
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="number"
                value={input.assetValue}
                onChange={(e) => setInput({ ...input, assetValue: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Entrada Disponível
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="number"
                value={input.availableDownPayment}
                onChange={(e) => setInput({ ...input, availableDownPayment: parseFloat(e.target.value) || 0 })}
                className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-bold"
              />
            </div>
          </div>
        </div>

        {/* Financing Section */}
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30">
          <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-3">
            Opção: Financiamento
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Taxa Anual (%)</label>
              <input
                type="number"
                step="0.1"
                value={input.financingRate}
                onChange={(e) => setInput({ ...input, financingRate: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Prazo (meses)</label>
              <input
                type="number"
                value={input.financingTerm}
                onChange={(e) => setInput({ ...input, financingTerm: parseInt(e.target.value) || 0 })}
                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Consortium Section */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-900/30">
          <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3">
            Opção: Consórcio
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Taxa Administração Total (%)</label>
              <input
                type="number"
                step="0.1"
                value={input.consortiumAdminRate}
                onChange={(e) => setInput({ ...input, consortiumAdminRate: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Prazo (meses)</label>
              <input
                type="number"
                value={input.consortiumTerm}
                onChange={(e) => setInput({ ...input, consortiumTerm: parseInt(e.target.value) || 0 })}
                className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Comparação de Custo Total
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <XAxis
              type="number"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#9CA3AF', fontSize: 14, fontWeight: 'bold' }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[entry.type as keyof typeof COLORS]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Cenário
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Custo Total
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Parcela Mensal
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Prazo
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Economia
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {scenarios.map((scenario, index) => {
                const isBest = index === 0;
                return (
                  <tr
                    key={scenario.type}
                    className={isBest ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[scenario.type] }}
                        />
                        <span className="font-bold text-gray-900 dark:text-white">
                          {scenario.name}
                        </span>
                        {isBest && (
                          <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded">
                            Melhor
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                      {formatCurrency(scenario.totalCost)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                      {scenario.monthlyPayment > 0 ? formatCurrency(scenario.monthlyPayment) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                      {scenario.term > 0 ? `${scenario.term} meses` : 'Imediato'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-500">
                      {scenario.savings > 0 ? formatCurrency(scenario.savings) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pros and Cons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario) => (
          <div
            key={scenario.type}
            className="bg-white dark:bg-[#0f172a] rounded-xl p-4 border border-gray-100 dark:border-gray-800"
          >
            <h3
              className="font-bold text-lg mb-3"
              style={{ color: COLORS[scenario.type] }}
            >
              {scenario.name}
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-emerald-500 mb-1">Vantagens</p>
                <ul className="space-y-1">
                  {scenario.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-bold text-red-500 mb-1">Desvantagens</p>
                <ul className="space-y-1">
                  {scenario.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info size={24} className="text-emerald-500" />
          <div>
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              Recomendação: {bestOption.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {bestOption.type === 'CASH' && (
                <>
                  Se você tem o capital disponível, comprar à vista é a opção mais econômica,
                  economizando {formatCurrency(scenarios[scenarios.length - 1].totalCost - bestOption.totalCost)} comparado ao financiamento.
                </>
              )}
              {bestOption.type === 'CONSORTIUM' && (
                <>
                  O consórcio oferece um bom equilíbrio entre custo e prazo. Você economiza {formatCurrency(bestOption.savings)} comparado
                  ao financiamento, mas precisará aguardar o sorteio ou dar um lance.
                </>
              )}
              {bestOption.type === 'FINANCING' && (
                <>
                  Nas condições atuais, o financiamento pode ser a única opção viável,
                  mas considere aumentar a entrada para reduzir o custo total.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center">
        * Valores aproximados para fins de comparação. Consulte instituições financeiras para condições reais.
      </p>
    </main>
  );
};

export default Acquisition;
