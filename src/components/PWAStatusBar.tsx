/**
 * PWA Status Bar
 * FASE 3: STY-085 (Mobile PWA & Install Prompt)
 *
 * Displays offline/sync status and install prompt
 */

import React, { useEffect, useState } from 'react';
import { offlineSyncService } from '../services/offlineSyncService';
import { WiFiOff, Wifi, Download, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface PWAStatusBarProps {
  show?: boolean;
}

export const PWAStatusBar: React.FC<PWAStatusBarProps> = ({ show = true }) => {
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Initialize offline database
    offlineSyncService.init();

    // Check current status
    const updateStatus = async () => {
      const status = await offlineSyncService.getOfflineStatus();
      setIsOffline(status.isOffline);
      setPendingCount(status.pendingOperations);
    };

    updateStatus();

    // Listen for online/offline events
    const unsubscribe = offlineSyncService.registerSyncListeners({
      onOnline: async () => {
        setIsOffline(false);
        // Auto-sync pending operations
        await handleSync();
      },
      onOffline: () => {
        setIsOffline(true);
      }
    });

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      const result = await offlineSyncService.syncPendingOperations(
        (current, total) => {
          setSyncProgress((current / total) * 100);
        }
      );

      // Update pending count
      const status = await offlineSyncService.getOfflineStatus();
      setPendingCount(status.pendingOperations);

      // Show success message
      if (result.successful > 0) {
        console.log(`✅ ${result.successful} operações sincronizadas com sucesso`);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      {/* Offline/Online Status */}
      {isOffline && (
        <div className="pointer-events-auto bg-amber-500/20 border-t border-amber-500/30 px-4 py-3 flex items-center space-x-3">
          <div className="flex items-center space-x-2 flex-1">
            <WiFiOff size={16} className="text-amber-400 animate-pulse" />
            <span className="text-sm text-amber-300 font-medium">Modo offline - dados serão sincronizados quando reconectar</span>
          </div>
          {pendingCount > 0 && (
            <span className="text-xs bg-amber-500/30 text-amber-300 px-2 py-1 rounded">
              {pendingCount} operação{pendingCount !== 1 ? 's' : ''} pendente
            </span>
          )}
        </div>
      )}

      {/* Syncing Status */}
      {isSyncing && !isOffline && (
        <div className="pointer-events-auto bg-blue-500/20 border-t border-blue-500/30 px-4 py-3">
          <div className="flex items-center space-x-3 mb-2">
            <Loader2 size={16} className="text-blue-400 animate-spin" />
            <span className="text-sm text-blue-300 font-medium">Sincronizando dados...</span>
          </div>
          <div className="h-1 bg-blue-900/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 transition-all duration-300"
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Back Online Status */}
      {!isOffline && !isSyncing && pendingCount > 0 && (
        <div className="pointer-events-auto bg-green-500/20 border-t border-green-500/30 px-4 py-3 flex items-center space-x-3">
          <Wifi size={16} className="text-green-400" />
          <div className="flex-1">
            <p className="text-sm text-green-300 font-medium">Você voltou online!</p>
            <p className="text-xs text-green-400">{pendingCount} operação{pendingCount !== 1 ? 's' : ''} será sincronizada automaticamente</p>
          </div>
          <button
            onClick={handleSync}
            className="pointer-events-auto px-3 py-1 bg-green-500/30 hover:bg-green-500/40 text-green-300 rounded text-xs font-medium transition-colors"
          >
            Sincronizar Agora
          </button>
        </div>
      )}

      {/* Install Prompt */}
      {showInstallPrompt && deferredPrompt && (
        <div className="pointer-events-auto bg-gradient-to-r from-blue-600 to-purple-600 border-t border-white/10 px-4 py-3 flex items-center space-x-3">
          <Download size={18} className="text-white flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Instalar SPFP</p>
            <p className="text-xs text-blue-100">Acesse seu app financeiro em qualquer lugar</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInstall}
              className="pointer-events-auto px-4 py-2 bg-white text-blue-600 rounded font-bold text-sm hover:bg-blue-50 transition-colors"
            >
              Instalar
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="pointer-events-auto p-2 hover:bg-white/10 rounded transition-colors"
              title="Descartar"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAStatusBar;
