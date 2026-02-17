/**
 * Phaser-Bridge
 * Integração entre Zustand store e Phaser scene
 * Source-of-truth: Zustand
 */

import { useCorporateStore } from '@/stores/corporateStore';

/**
 * Setup listeners do Zustand para sincronizar com Phaser
 */
export function setupPhaserBridge() {
  const store = useCorporateStore.getState();

  // Listen mudanças no selectedDepartment
  useCorporateStore.subscribe(
    (state) => state.selectedDepartment,
    (selectedDept) => {
      if (selectedDept) {
        // Aqui poderia disparar evento para Phaser se necessário
        console.log('[PhaserBridge] selectedDepartment:', selectedDept);
      }
    }
  );

  // Listen mudanças nas atividades (ActivityFeed realtime)
  useCorporateStore.subscribe(
    (state) => state.activities,
    (activities) => {
      // Atualizar visual badges ou status no mapa se necessário
      console.log('[PhaserBridge] activities updated:', activities.length);
    }
  );

  // Listen conexão realtime
  useCorporateStore.subscribe(
    (state) => state.isRealtimeConnected,
    (isConnected) => {
      console.log('[PhaserBridge] realtime status:', isConnected ? 'CONECTADO' : 'OFFLINE');
    }
  );
}

/**
 * Handle click do mapa Phaser
 * Dispara ação no Zustand
 */
export function handlePhaserClick(departmentId: string) {
  const store = useCorporateStore.getState();

  store.setSelectedDepartment(departmentId);
  store.setIsModalOpen(true);

  console.log('[PhaserBridge] click handler:', departmentId);
}
