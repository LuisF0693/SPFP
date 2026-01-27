import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface DashboardHeaderProps {
  userName: string;
  currentMonth: string;
  onRecapClick: () => void;
}

/**
 * Dashboard header with greeting, month display, and action buttons
 * ~75 LOC
 */
export const DashboardHeader = memo<DashboardHeaderProps>(
  ({ userName, currentMonth, onRecapClick }) => {
    const navigate = useNavigate();

    return (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Olá, {userName}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Visão geral financeira de {currentMonth}
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <button
            onClick={onRecapClick}
            className="bg-white/5 hover:bg-white/10 text-blue-400 border border-blue-500/20 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-blue-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Sparkles size={16} className="mr-2 animate-pulse" /> ✨ Ver
            Retrospectiva
          </button>

          <button
            onClick={() => navigate('/transactions/add')}
            className="bg-accent hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center"
          >
            <span className="mr-2">+</span> Adicionar Transação
          </button>
        </div>
      </div>
    );
  }
);

DashboardHeader.displayName = 'DashboardHeader';
