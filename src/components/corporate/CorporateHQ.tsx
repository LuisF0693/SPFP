import { useEffect } from 'react';
import { PhaserGame } from './phaser';
import { DepartmentModal } from './DepartmentModal';
import { ActivityFeed } from './ActivityFeed';
import { CorporateProvider } from './CorporateContext';
import { useCorporateStore } from '@/stores/corporateStore';
import { setupPhaserBridge, handlePhaserClick } from './phaser-bridge';

export function CorporateHQ() {
  const setSelectedDepartment = useCorporateStore((state) => state.setSelectedDepartment);
  const setIsModalOpen = useCorporateStore((state) => state.setIsModalOpen);

  useEffect(() => {
    // Setup Zustand ↔ Phaser bridge
    setupPhaserBridge();
  }, []);

  const handleDepartmentClick = (deptId: string) => {
    handlePhaserClick(deptId);
  };

  return (
    <CorporateProvider>
      <div className="w-full h-full flex flex-col md:flex-row bg-slate-900 gap-0 p-0">
        {/* Phaser Game - Mapa 2D (50% desktop, full mobile) */}
        <div className="flex-1 flex flex-col min-h-0 md:min-h-screen">
          <PhaserGame onDepartmentClick={handleDepartmentClick} />
        </div>

        {/* ActivityFeed - (50% desktop, hidden mobile) */}
        <div className="hidden md:flex flex-1 flex-col min-h-0 min-h-screen border-l border-slate-700">
          <ActivityFeed />
        </div>

        {/* Department Modal */}
        <DepartmentModal />
      </div>
    </CorporateProvider>
  );
}

export default CorporateHQ;
