/**
 * DepartmentDashboard - Modal genérico para dashboards
 */

import React from 'react';
import { X } from 'lucide-react';
import { useCorporateStore } from '@/stores/corporateStore';
import { FinancialDashboard } from './FinancialDashboard';
import { MarketingDashboard } from './MarketingDashboard';
import { OperationalDashboard } from './OperationalDashboard';
import { CommercialDashboard } from './CommercialDashboard';

const DEPARTMENT_COMPONENTS: Record<string, React.ComponentType> = {
  financeiro: FinancialDashboard,
  marketing: MarketingDashboard,
  operacional: OperationalDashboard,
  comercial: CommercialDashboard,
};

export function DepartmentDashboard() {
  const selectedDepartment = useCorporateStore((state) => state.selectedDepartment);
  const isModalOpen = useCorporateStore((state) => state.isModalOpen);
  const setIsModalOpen = useCorporateStore((state) => state.setIsModalOpen);

  if (!isModalOpen || !selectedDepartment) return null;

  const DashboardComponent = DEPARTMENT_COMPONENTS[selectedDepartment];

  if (!DashboardComponent) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
          <p className="text-white">Dashboard não encontrado</p>
          <button
            onClick={() => setIsModalOpen(false)}
            className="mt-4 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const departmentEmojis: Record<string, string> = {
    financeiro: '💰',
    marketing: '📣',
    operacional: '⚙️',
    comercial: '🤝',
  };

  const departmentColors: Record<string, string> = {
    financeiro: 'from-emerald-600 to-emerald-800',
    marketing: 'from-violet-600 to-violet-800',
    operacional: 'from-amber-600 to-amber-800',
    comercial: 'from-blue-600 to-blue-800',
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-800 border-4 border-blue-500 rounded-xl shadow-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className={`bg-gradient-to-r ${departmentColors[selectedDepartment] || 'from-blue-600 to-blue-800'} p-6 border-b-4 border-blue-400 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-5xl">{departmentEmojis[selectedDepartment]}</span>
            <h2 className="text-3xl font-black text-white capitalize tracking-wider">
              {selectedDepartment}
            </h2>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition hover:scale-110"
          >
            <X size={28} className="text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <DashboardComponent />
        </div>

        <div className="border-t border-slate-700 bg-slate-900 p-4 sticky bottom-0">
          <button
            onClick={() => setIsModalOpen(false)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
