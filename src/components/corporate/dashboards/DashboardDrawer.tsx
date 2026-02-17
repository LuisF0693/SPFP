/**
 * DashboardDrawer
 * Modal/Drawer para exibir dashboards de departamentos
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useVirtualOffice } from '@/context/VirtualOfficeContext';
import { FinancialDashboard } from './FinancialDashboard';
import { SalesDashboard } from './SalesDashboard';

export function DashboardDrawer() {
  const { selectedRoom, isModalOpen, closeModal } = useVirtualOffice();

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

  if (!isModalOpen || !selectedRoom) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/80 z-40 md:relative md:bg-transparent"
        onClick={closeModal}
      />

      {/* Drawer/Modal */}
      <div className="fixed right-0 top-0 h-screen w-full md:relative md:w-auto md:h-auto bg-slate-800 border-l border-slate-700 z-50 md:z-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedRoom.icon}</span>
            <h2 className="text-xl font-bold text-white">{selectedRoom.name}</h2>
          </div>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedRoom.department === 'financeiro' && <FinancialDashboard />}
          {selectedRoom.department === 'comercial' && <SalesDashboard />}

          {selectedRoom.department !== 'financeiro' && selectedRoom.department !== 'comercial' && (
            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Informações da Sala</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-slate-400">Departamento:</dt>
                    <dd className="text-white font-medium">{selectedRoom.department}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Posição:</dt>
                    <dd className="text-white font-medium">
                      X: {selectedRoom.x}, Y: {selectedRoom.y}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Tamanho:</dt>
                    <dd className="text-white font-medium">
                      {selectedRoom.width} x {selectedRoom.height} tiles
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Placeholder for other dashboards */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Dashboard</h3>
                <p className="text-slate-400 text-sm">
                  Dashboard de {selectedRoom.name} será carregado aqui em breve...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4 flex gap-2">
          <button
            onClick={closeModal}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </>
  );
}
