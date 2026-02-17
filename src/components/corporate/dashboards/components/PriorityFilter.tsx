/**
 * PriorityFilter
 * Filtro por prioridade para o Kanban
 */

import React from 'react';

type PriorityFilter = 'todas' | 'alta' | 'media' | 'baixa';

interface PriorityFilterProps {
  selectedPriority: PriorityFilter;
  onSelectPriority: (priority: PriorityFilter) => void;
}

export default function PriorityFilter({
  selectedPriority,
  onSelectPriority,
}: PriorityFilterProps) {
  const options: { value: PriorityFilter; label: string; icon: string }[] = [
    { value: 'todas', label: 'Todas', icon: '📋' },
    { value: 'alta', label: 'Alta', icon: '🔴' },
    { value: 'media', label: 'Média', icon: '🟡' },
    { value: 'baixa', label: 'Baixa', icon: '🟢' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelectPriority(option.value)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedPriority === option.value
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {option.icon} {option.label}
        </button>
      ))}
    </div>
  );
}
