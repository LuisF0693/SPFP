/**
 * SyncStatus Component - STY-035
 * Shows real-time sync status with user feedback
 * - "Syncing..." (spinner)
 * - "✅ Synced" (success)
 * - "⚠️ Syncing failed - retrying..." (error with retry count)
 * - "❌ Offline - will retry when connected" (offline)
 */

import React from 'react';
import { AlertCircle, CheckCircle2, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { syncService, useSyncStatus } from '../../services/syncService';

export const SyncStatus: React.FC<{ className?: string }> = ({ className = '' }) => {
  const status = useSyncStatus();

  // Determine icon and styling based on sync status
  const getStatusUI = () => {
    switch (status.status) {
      case 'synced':
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          text: '✅ Sincronizado',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          textColor: 'text-green-700 dark:text-green-400',
          borderColor: 'border-green-200 dark:border-green-800'
        };

      case 'syncing':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Sincronizando...',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          textColor: 'text-blue-700 dark:text-blue-400',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };

      case 'retrying':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: `Tentando novamente... (${status.lastError})`,
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          textColor: 'text-amber-700 dark:text-amber-400',
          borderColor: 'border-amber-200 dark:border-amber-800'
        };

      case 'offline':
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: `❌ Offline - ${status.pendingCount} operações pendentes`,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          textColor: 'text-red-700 dark:text-red-400',
          borderColor: 'border-red-200 dark:border-red-800'
        };

      case 'failed':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: `⚠️ Falha na sincronização`,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          textColor: 'text-red-700 dark:text-red-400',
          borderColor: 'border-red-200 dark:border-red-800'
        };

      default:
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: 'Pronto',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          textColor: 'text-gray-700 dark:text-gray-400',
          borderColor: 'border-gray-200 dark:border-gray-800'
        };
    }
  };

  const ui = getStatusUI();

  // Don't show if synced and no pending operations
  if (status.status === 'synced' && status.pendingCount === 0) {
    return null;
  }

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 text-sm
        border rounded-lg
        ${ui.bgColor} ${ui.textColor} ${ui.borderColor}
        ${className}
      `}
      role="status"
      aria-live="polite"
      aria-label={`Sync status: ${ui.text}`}
    >
      {ui.icon}
      <span>{ui.text}</span>
    </div>
  );
};

/**
 * Sync Status Badge - Compact version for header
 */
export const SyncStatusBadge: React.FC = () => {
  const status = useSyncStatus();

  // Show badge only if not synced
  if (status.status === 'synced' && status.pendingCount === 0) {
    return null;
  }

  const colors: Record<string, { bg: string; dot: string }> = {
    synced: { bg: 'bg-green-100 dark:bg-green-900', dot: 'bg-green-500' },
    syncing: { bg: 'bg-blue-100 dark:bg-blue-900', dot: 'bg-blue-500' },
    retrying: { bg: 'bg-amber-100 dark:bg-amber-900', dot: 'bg-amber-500' },
    offline: { bg: 'bg-red-100 dark:bg-red-900', dot: 'bg-red-500' },
    failed: { bg: 'bg-red-100 dark:bg-red-900', dot: 'bg-red-500' },
    idle: { bg: 'bg-gray-100 dark:bg-gray-900', dot: 'bg-gray-500' }
  };

  const color = colors[status.status] || colors.idle;

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color.bg}`}>
      <div className={`w-2 h-2 rounded-full ${color.dot}`} />
      <span>{status.pendingCount} pendentes</span>
    </div>
  );
};

export default SyncStatus;
