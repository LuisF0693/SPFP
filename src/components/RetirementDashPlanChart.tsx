/**
 * Retirement DashPlan Chart Component
 * FASE 2: STY-067 (Retirement DashPlan-Style Visualization)
 *
 * LineChart showing 3 retirement scenarios with evolution over time
 */

import React from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { RetirementScenarioProjection, RetirementScenario, SCENARIO_CONFIG } from '../types/retirement';
import { formatCurrency } from '../utils';

interface RetirementDashPlanChartProps {
  scenarios: RetirementScenarioProjection[];
  targetYear?: number;
}

export const RetirementDashPlanChart: React.FC<RetirementDashPlanChartProps> = ({
  scenarios,
  targetYear
}) => {
  // Merge all projections into single array for chart
  const chartData = scenarios[0]?.projections.map((projection, index) => {
    const dataPoint: Record<string, any> = {
      year: projection.year,
      age: projection.age
    };

    scenarios.forEach(scenario => {
      const proj = scenario.projections[index];
      const scenarioLabel = SCENARIO_CONFIG[scenario.scenario].label;
      dataPoint[scenarioLabel] = Math.round(proj.patrimony / 1000000); // Convert to millions
    });

    return dataPoint;
  }) || [];

  const handleTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card-dark border border-gray-700 rounded-lg p-3 text-xs">
          <p className="text-gray-300 font-semibold mb-1">Ano {data.year} (Idade: {data.age})</p>
          {payload.map((entry: any) => (
            <p key={entry.dataKey} style={{ color: entry.color }}>
              {entry.dataKey}: {formatCurrency(entry.value * 1000000)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card-dark border border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-bold text-white mb-4">Projeção de Aposentadoria</h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="year"
            stroke="#9CA3AF"
            label={{ value: 'Anos', position: 'insideBottomRight', offset: -10 }}
          />
          <YAxis
            stroke="#9CA3AF"
            label={{ value: 'Patrimônio (milhões)', angle: -90, position: 'insideLeft' }}
          />

          {/* Reference line for target retirement year */}
          {targetYear && (
            <ReferenceLine
              x={targetYear}
              stroke="#EF4444"
              strokeDasharray="5 5"
              label={{ value: 'Meta', position: 'top', fill: '#EF4444' }}
            />
          )}

          {/* Scenario lines */}
          {scenarios.map(scenario => (
            <Line
              key={scenario.scenario}
              type="monotone"
              dataKey={SCENARIO_CONFIG[scenario.scenario].label}
              stroke={scenario.color}
              strokeWidth={2}
              dot={false}
              name={SCENARIO_CONFIG[scenario.scenario].label}
            />
          ))}

          <Tooltip content={handleTooltip} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend Info */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {scenarios.map(scenario => (
          <div key={scenario.scenario} className="p-3 rounded-lg bg-white/5">
            <div className="flex items-center space-x-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: scenario.color }}
              />
              <span className="text-sm font-semibold text-gray-300">
                {SCENARIO_CONFIG[scenario.scenario].label}
              </span>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Patrimônio: {formatCurrency(scenario.finalPatrimony)}</p>
              <p>Retorno: {(scenario.averageReturn).toFixed(1)}% a.a.</p>
              <p>Anos: {scenario.yearsToRetirement}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RetirementDashPlanChart;
