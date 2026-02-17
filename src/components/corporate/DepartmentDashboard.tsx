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

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border-2 border-blue-500 rounded-lg shadow-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-700 sticky top-0 bg-slate-800">
          <h2 className="text-xl font-bold text-white capitalize">{selectedDepartment}</h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="p-2 hover:bg-slate-700 rounded"
          >
            <X size={24} className="text-slate-300" />
          </button>
        </div>

        <div className="p-6">
          <DashboardComponent />
        </div>
      </div>
    </div>
  );
}
