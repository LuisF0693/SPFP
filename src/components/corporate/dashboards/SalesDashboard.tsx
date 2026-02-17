/**
 * SalesDashboard
 * Sales Pipeline com 5 estágios e drag & drop (US-404)
 */

import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TrendingUp, DollarSign } from 'lucide-react';
import { SalesLead } from '@/types/virtual-office';
import { salesMockData, formatCurrency, calculateTotalByStage, getRealized, getPipelineTotal } from '@/data/salesData';

const STAGES = [
  { id: 'prospecting', label: 'Prospecção', color: '#9CA3AF' },
  { id: 'qualification', label: 'Qualificação', color: '#60A5FA' },
  { id: 'proposal', label: 'Proposta', color: '#34D399' },
  { id: 'negotiation', label: 'Negociação', color: '#FBBF24' },
  { id: 'closed_won', label: 'Fechado', color: '#10B981' },
];

// Draggable card component
function DraggableLeadCard({
  lead,
  stage,
  isSelected,
  onSelect,
}: {
  lead: SalesLead;
  stage: (typeof STAGES)[0];
  isSelected: boolean;
  onSelect: (lead: SalesLead) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(lead)}
      className={`p-3 rounded border cursor-move transition-all ${
        isDragging
          ? 'bg-slate-600 shadow-lg'
          : 'bg-slate-800 border-slate-600 hover:border-slate-500'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm font-semibold text-white truncate">{lead.name}</p>
          <p className="text-xs text-slate-400 truncate">{lead.company}</p>
        </div>
        <span
          className="text-xs font-bold px-2 py-1 rounded ml-2 whitespace-nowrap"
          style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
        >
          {lead.probability}%
        </span>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-emerald-400">{formatCurrency(lead.value)}</p>
      </div>
    </div>
  );
}

export function SalesDashboard() {
  const [leads, setLeads] = useState<SalesLead[]>(salesMockData.leads);
  const [selectedLead, setSelectedLead] = useState<SalesLead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor)
  );

  // Calculate metrics
  const realized = useMemo(() => getRealized(leads), [leads]);
  const pipelineTotal = useMemo(() => getPipelineTotal(leads), [leads]);
  const goal = salesMockData.goal.target;
  const percentage = useMemo(() => ((realized / goal) * 100).toFixed(1), [realized, goal]);

  // Group leads by stage
  const leadsByStage = useMemo(() => {
    const grouped: Record<string, SalesLead[]> = {};
    STAGES.forEach((stage) => {
      grouped[stage.id] = leads.filter((l) => l.stage === stage.id);
    });
    return grouped;
  }, [leads]);

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const draggedLead = leads.find((l) => l.id === active.id);
    if (!draggedLead) return;

    const newStage = over.id as SalesLead['stage'];
    if (draggedLead.stage === newStage) return;

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === draggedLead.id
          ? { ...lead, stage: newStage }
          : lead
      )
    );
  };

  return (
    <div className="space-y-6 p-6 bg-slate-800 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Pipeline de Vendas</h3>
      </div>

      {/* Meta vs Realizado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-4 rounded-lg border border-blue-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-300 text-sm font-semibold">Meta</span>
            <DollarSign size={18} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(goal)}</p>
          <p className="text-xs text-blue-300 mt-1">Fevereiro 2026</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 p-4 rounded-lg border border-emerald-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300 text-sm font-semibold">Realizado</span>
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(realized)}</p>
          <p className="text-xs text-emerald-300 mt-1">{percentage}% da meta</p>
        </div>

        <div className={`bg-gradient-to-br p-4 rounded-lg border ${
          realized >= goal * 0.8
            ? 'from-green-900 to-green-800 border-green-700'
            : realized >= goal * 0.5
              ? 'from-yellow-900 to-yellow-800 border-yellow-700'
              : 'from-red-900 to-red-800 border-red-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-semibold ${
              realized >= goal * 0.8
                ? 'text-green-300'
                : realized >= goal * 0.5
                  ? 'text-yellow-300'
                  : 'text-red-300'
            }`}>
              Status
            </span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all ${
                realized >= goal * 0.8
                  ? 'bg-green-500'
                  : realized >= goal * 0.5
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
            />
          </div>
          <p className="text-xs font-semibold">{percentage}% atingido</p>
        </div>
      </div>

      {/* Pipeline */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <div
              key={stage.id}
              className="flex-1 min-w-max md:min-w-0 bg-slate-700/50 rounded-lg p-4 transition-all"
            >
              {/* Header */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-white mb-1">{stage.label}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {leadsByStage[stage.id].length} lead(s)
                  </span>
                  <span className="text-xs font-bold" style={{ color: stage.color }}>
                    {formatCurrency(calculateTotalByStage(leads, stage.id))}
                  </span>
                </div>
              </div>

              {/* Lead Cards */}
              <SortableContext items={leadsByStage[stage.id].map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 min-h-20">
                  {leadsByStage[stage.id].map((lead) => (
                    <DraggableLeadCard
                      key={lead.id}
                      lead={lead}
                      stage={stage}
                      isSelected={selectedLead?.id === lead.id}
                      onSelect={setSelectedLead}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">{selectedLead.name}</h3>

            <dl className="space-y-3 mb-6">
              <div>
                <dt className="text-xs text-slate-400">Empresa</dt>
                <dd className="text-sm font-medium text-white">{selectedLead.company}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Email</dt>
                <dd className="text-sm font-medium text-white">{selectedLead.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Telefone</dt>
                <dd className="text-sm font-medium text-white">{selectedLead.phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Valor</dt>
                <dd className="text-sm font-bold text-emerald-400">{formatCurrency(selectedLead.value)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Probabilidade</dt>
                <dd className="text-sm font-medium text-white">{selectedLead.probability}%</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Estágio</dt>
                <dd className="text-sm font-medium text-white capitalize">{selectedLead.stage}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Origem</dt>
                <dd className="text-sm font-medium text-white">{selectedLead.source}</dd>
              </div>
              {selectedLead.notes && (
                <div>
                  <dt className="text-xs text-slate-400">Notas</dt>
                  <dd className="text-sm text-slate-300">{selectedLead.notes}</dd>
                </div>
              )}
            </dl>

            <button
              onClick={() => setSelectedLead(null)}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
