import React from 'react';
import { ArrowLeft, Plus, LayoutGrid, Clock } from 'lucide-react';
import { CompanyBoard } from '../../types/company';

interface BoardViewProps {
  board: CompanyBoard;
  onBack: () => void;
}

// Stub Kanban — será implementado na Story 9.4
export const BoardView: React.FC<BoardViewProps> = ({ board, onBack }) => {
  const columns: { id: string; label: string; color: string }[] = [
    { id: 'TODO',        label: 'A Fazer',     color: 'border-gray-500' },
    { id: 'IN_PROGRESS', label: 'Em Andamento', color: 'border-blue-500' },
    { id: 'REVIEW',      label: 'Em Revisão',  color: 'border-amber-500' },
    { id: 'DONE',        label: 'Concluído',   color: 'border-emerald-500' },
  ];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Board header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
        <button
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <span
          className="text-xl w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ backgroundColor: `${board.color}20` }}
        >
          {board.icon}
        </span>
        <div>
          <h3 className="text-white font-bold text-base">{board.name}</h3>
          {board.description && (
            <p className="text-gray-500 text-xs">{board.description}</p>
          )}
        </div>
        <button className="ml-auto flex items-center gap-2 px-3 py-2 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/80 transition-colors">
          <Plus size={14} />
          Nova Task
        </button>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((col) => (
            <div
              key={col.id}
              className={`w-72 flex flex-col rounded-2xl bg-white/3 border-t-2 ${col.color} overflow-hidden`}
            >
              {/* Column header */}
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-300">{col.label}</span>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">0</span>
              </div>

              {/* Empty state */}
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="p-3 rounded-xl bg-white/5 text-gray-600 mb-3">
                  <LayoutGrid size={20} />
                </div>
                <p className="text-xs text-gray-600">Nenhuma task ainda</p>
                <p className="text-[10px] text-gray-700 mt-1">Drag & drop disponível na Story 9.4</p>
              </div>

              {/* Add task button */}
              <button className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-400 hover:bg-white/3 transition-colors text-sm border-t border-white/5">
                <Plus size={14} />
                Adicionar task
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Coming soon banner */}
      <div className="px-6 py-3 border-t border-white/5 flex items-center gap-2 text-gray-600 text-xs">
        <Clock size={12} />
        Drag &amp; drop entre colunas disponível na Story 9.4
      </div>
    </div>
  );
};
