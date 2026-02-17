/**
 * CommercialDashboard - Dashboard Comercial
 * Pipeline de vendas com drag & drop
 */

import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  company?: string;
  value: number;
  probability: number;
}

const initialPipeline = {
  prospecting: [
    { id: '1', name: 'Empresa A', company: 'TechCorp', value: 15000, probability: 20 },
    { id: '2', name: 'Empresa B', company: 'StartupXYZ', value: 8000, probability: 15 },
    { id: '3', name: 'Empresa C', company: 'RetailCo', value: 12000, probability: 25 },
    { id: '4', name: 'Empresa D', company: 'FinanceInc', value: 13000, probability: 30 },
  ],
  qualification: [
    { id: '5', name: 'Empresa E', company: 'TechFlow', value: 22000, probability: 40 },
    { id: '6', name: 'Empresa F', company: 'InnovateLab', value: 18000, probability: 45 },
  ],
  proposal: [
    { id: '7', name: 'Empresa G', company: 'CloudPro', value: 25000, probability: 60 },
    { id: '8', name: 'Empresa H', company: 'DataViz', value: 15000, probability: 50 },
  ],
  negotiation: [
    { id: '9', name: 'Empresa I', company: 'FutureState', value: 30000, probability: 75 },
    { id: '10', name: 'Empresa J', company: 'NextGen', value: 18000, probability: 70 },
  ],
  closed: [
    { id: '11', name: 'Empresa K', company: 'SuccessCo', value: 35000, probability: 100 },
    { id: '12', name: 'Empresa L', company: 'VictoryTech', value: 28000, probability: 100 },
  ],
};

const stageLabels: Record<string, string> = {
  prospecting: 'Prospecção',
  qualification: 'Qualificação',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  closed: 'Fechado',
};

export function CommercialDashboard() {
  const [pipeline, setPipeline] = useState(initialPipeline);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  const calculateStageTotal = (stage: string) => {
    return pipeline[stage as keyof typeof pipeline].reduce((sum, lead) => sum + lead.value, 0);
  };

  const moveLead = (leadId: string, fromStage: string, toStage: string) => {
    const lead = pipeline[fromStage as keyof typeof pipeline].find((l) => l.id === leadId);
    if (!lead) return;

    setPipeline({
      ...pipeline,
      [fromStage]: pipeline[fromStage as keyof typeof pipeline].filter((l) => l.id !== leadId),
      [toStage]: [...pipeline[toStage as keyof typeof pipeline], lead],
    });
  };

  const deleteLead = (leadId: string, stage: string) => {
    setPipeline({
      ...pipeline,
      [stage]: pipeline[stage as keyof typeof pipeline].filter((l) => l.id !== leadId),
    });
  };

  const totalValue = Object.values(pipeline).flat().reduce((sum, lead) => sum + lead.value, 0);
  const targetValue = 50000;
  const progress = (totalValue / targetValue) * 100;

  return (
    <div className="space-y-6">
      {/* Meta de Vendas */}
      <div className="bg-slate-700 p-4 rounded">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-semibold flex items-center gap-2">
            <TrendingUp size={20} /> Meta: R$ {targetValue.toLocaleString()}
          </span>
          <span className="text-green-400 font-bold">
            R$ {totalValue.toLocaleString()} ({Math.round(progress)}%)
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Pipeline */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-4">
          {Object.entries(stageLabels).map(([stage, label]) => {
            const leads = pipeline[stage as keyof typeof pipeline];
            const stageTotal = calculateStageTotal(stage);

            return (
              <div
                key={stage}
                className="bg-slate-700/50 border border-slate-600 rounded p-4 min-w-max w-80"
              >
                <div className="mb-3">
                  <h3 className="text-white font-semibold">{label}</h3>
                  <p className="text-slate-400 text-sm">
                    {leads.length} lead{leads.length !== 1 ? 's' : ''} • R$ {stageTotal.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-slate-800 p-3 rounded hover:bg-slate-700 cursor-pointer transition group"
                      onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm">{lead.name}</p>
                          <p className="text-slate-400 text-xs">{lead.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-semibold">R$ {lead.value.toLocaleString()}</p>
                          <p className="text-slate-400 text-xs">{lead.probability}%</p>
                        </div>
                      </div>

                      {expandedLead === lead.id && (
                        <div className="mt-3 pt-3 border-t border-slate-600 space-y-2">
                          <select
                            className="w-full bg-slate-700 text-white text-sm p-2 rounded"
                            onChange={(e) => {
                              if (e.target.value) {
                                moveLead(lead.id, stage, e.target.value);
                                setExpandedLead(null);
                              }
                            }}
                          >
                            <option value="">Mover para...</option>
                            {Object.entries(stageLabels)
                              .filter(([s]) => s !== stage)
                              .map(([s, l]) => (
                                <option key={s} value={s}>
                                  {l}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => deleteLead(lead.id, stage)}
                            className="w-full text-red-400 hover:text-red-300 text-xs py-1"
                          >
                            Deletar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button className="w-full mt-3 text-slate-400 hover:text-white text-sm py-2 border border-slate-600 rounded">
                  + Novo Lead
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Taxa de Conversão */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-slate-700 p-2 rounded text-center text-xs">
          <p className="text-slate-400">Prop → Neg</p>
          <p className="text-white font-bold">100%</p>
        </div>
        <div className="bg-slate-700 p-2 rounded text-center text-xs">
          <p className="text-slate-400">Qual → Prop</p>
          <p className="text-white font-bold">100%</p>
        </div>
        <div className="bg-slate-700 p-2 rounded text-center text-xs">
          <p className="text-slate-400">Prosp → Qual</p>
          <p className="text-white font-bold">50%</p>
        </div>
        <div className="bg-slate-700 p-2 rounded text-center text-xs">
          <p className="text-slate-400">Neg → Fechado</p>
          <p className="text-white font-bold">100%</p>
        </div>
      </div>
    </div>
  );
}
