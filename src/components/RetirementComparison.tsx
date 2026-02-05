/**
 * Retirement Scenario Comparison & Alerts
 * FASE 2: STY-069 + STY-070 (Scenario Comparison & Alerts)
 */

import React, { useMemo } from 'react';
import { RetirementScenarioProjection, RetirementScenario, SCENARIO_CONFIG } from '../types/retirement';
import { formatCurrency } from '../utils';
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface RetirementComparisonProps {
  scenarios: RetirementScenarioProjection[];
  onSelectScenario: (scenario: RetirementScenario) => void;
  selectedScenario?: RetirementScenario;
}

export const RetirementComparison: React.FC<RetirementComparisonProps> = ({
  scenarios,
  onSelectScenario,
  selectedScenario
}) => {
  // Find best case scenario
  const bestScenario = useMemo(() => {
    return scenarios.reduce((best, current) =>
      current.finalPatrimony > best.finalPatrimony ? current : best
    );
  }, [scenarios]);

  // Generate alerts
  const alerts = useMemo(() => {
    const result = [];

    // Alert for low final patrimony
    const avgFinal = scenarios.reduce((sum, s) => sum + s.finalPatrimony, 0) / scenarios.length;
    if (avgFinal < 500000) {
      result.push({
        type: 'warning',
        message: 'Patrimônio final pode ser insuficiente. Considere aumentar contribuições.',
        icon: AlertCircle
      });
    }

    // Alert for best scenario
    result.push({
      type: 'success',
      message: `${SCENARIO_CONFIG[bestScenario.scenario].label} oferece melhor retorno`,
      icon: CheckCircle
    });

    // Milestone alert
    const moderateScenario = scenarios.find(s => s.scenario === RetirementScenario.MODERATE);
    if (moderateScenario && moderateScenario.yearsToRetirement < 10) {
      result.push({
        type: 'info',
        message: 'Você pode se aposentar em menos de 10 anos! 🎉',
        icon: TrendingUp
      });
    }

    return result;
  }, [scenarios, bestScenario]);

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-300 uppercase">Alertas e Milestones</h3>
        {alerts.map((alert, idx) => {
          const Icon = alert.icon;
          const bgColor = alert.type === 'success' ? 'bg-green-500/10' : alert.type === 'warning' ? 'bg-yellow-500/10' : 'bg-blue-500/10';
          const borderColor = alert.type === 'success' ? 'border-green-500/30' : alert.type === 'warning' ? 'border-yellow-500/30' : 'border-blue-500/30';
          const textColor = alert.type === 'success' ? 'text-green-400' : alert.type === 'warning' ? 'text-yellow-400' : 'text-blue-400';

          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${bgColor} ${borderColor} flex items-start space-x-2`}
            >
              <Icon size={16} className={`mt-0.5 flex-shrink-0 ${textColor}`} />
              <p className="text-xs text-gray-300">{alert.message}</p>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="bg-card-dark border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-bold text-gray-300 uppercase">Comparação de Cenários</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-gray-800">
                <th className="px-4 py-3 text-left text-gray-400 font-semibold">Métrica</th>
                {scenarios.map(scenario => (
                  <th
                    key={scenario.scenario}
                    className={`px-4 py-3 text-right font-semibold ${
                      bestScenario.scenario === scenario.scenario
                        ? 'bg-blue-500/10 text-blue-300'
                        : 'text-gray-400'
                    }`}
                  >
                    {SCENARIO_CONFIG[scenario.scenario].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800 hover:bg-white/5">
                <td className="px-4 py-3 text-gray-300 font-medium">Patrimônio Final</td>
                {scenarios.map(scenario => (
                  <td
                    key={scenario.scenario}
                    className={`px-4 py-3 text-right ${
                      bestScenario.scenario === scenario.scenario ? 'bg-blue-500/10' : ''
                    }`}
                  >
                    <span className="font-semibold text-white">{formatCurrency(scenario.finalPatrimony)}</span>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-800 hover:bg-white/5">
                <td className="px-4 py-3 text-gray-300 font-medium">Renda Anual</td>
                {scenarios.map(scenario => (
                  <td
                    key={scenario.scenario}
                    className={`px-4 py-3 text-right ${
                      bestScenario.scenario === scenario.scenario ? 'bg-blue-500/10' : ''
                    }`}
                  >
                    {formatCurrency(scenario.annualIncome)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-800 hover:bg-white/5">
                <td className="px-4 py-3 text-gray-300 font-medium">Anos até Aposentadoria</td>
                {scenarios.map(scenario => (
                  <td
                    key={scenario.scenario}
                    className={`px-4 py-3 text-right ${
                      bestScenario.scenario === scenario.scenario ? 'bg-blue-500/10' : ''
                    }`}
                  >
                    <span className="font-semibold text-white">{scenario.yearsToRetirement}</span>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-800 hover:bg-white/5">
                <td className="px-4 py-3 text-gray-300 font-medium">Retorno Anual Médio</td>
                {scenarios.map(scenario => (
                  <td
                    key={scenario.scenario}
                    className={`px-4 py-3 text-right ${
                      bestScenario.scenario === scenario.scenario ? 'bg-blue-500/10' : ''
                    }`}
                  >
                    <span className="font-semibold text-white">{scenario.averageReturn.toFixed(1)}%</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-800 flex gap-2">
          {scenarios.map(scenario => (
            <button
              key={scenario.scenario}
              onClick={() => onSelectScenario(scenario.scenario)}
              className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                selectedScenario === scenario.scenario
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-gray-700'
              }`}
            >
              {SCENARIO_CONFIG[scenario.scenario].label}
            </button>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          <strong>Dica:</strong> Escolha um cenário acima para ver recomendações de alocação de investimentos.
          Cenários mais agressivos oferecem maior retorno mas com mais volatilidade.
        </p>
      </div>
    </div>
  );
};

export default RetirementComparison;
