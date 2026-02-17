/**
 * ActivityDetailModal Component
 * Expanded view of activity details
 *
 * Shows:
 * - Full activity information
 * - Metadata JSONB
 * - Approval history
 * - Timestamps
 * - Full description (not truncated)
 */

import { CorporateActivity } from '@/types/corporate';
import { X } from 'lucide-react';
import { ActivityStatus } from './ActivityStatus';

interface ActivityDetailModalProps {
  activity: CorporateActivity | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * TODO: Implement ActivityDetailModal component
 *
 * Should render:
 * - Modal overlay with close button
 * - Full activity details
 * - Metadata section (if exists)
 * - Approval status and history
 * - Timestamps (created, updated, approved/rejected at)
 * - Status with ActivityStatus component
 * - Description (full, not truncated)
 * - Agent info (name, role)
 * - Department info
 *
 * Example usage:
 * <ActivityDetailModal
 *   activity={selectedActivity}
 *   isOpen={isOpen}
 *   onClose={handleClose}
 * />
 */
export function ActivityDetailModal({
  activity,
  isOpen,
  onClose,
}: ActivityDetailModalProps) {
  if (!isOpen || !activity) return null;

  // TODO: Implement modal layout
  // - Modal overlay
  // - Header with title and close button
  // - Content sections:
  //   1. Agent info
  //   2. Status and timestamps
  //   3. Full description
  //   4. Metadata (if exists)
  //   5. Approval history
  // - Footer with close button

  // TODO: Format metadata for display
  const formatMetadata = (metadata?: Record<string, unknown>): string => {
    // TODO: Pretty-print JSON metadata
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      {/* TODO: Modal container */}
      <div className="bg-slate-800 border-4 border-blue-500 rounded-none shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* TODO: Header */}
        <div className="px-6 py-4 border-b-2 border-blue-500 bg-blue-500/20 flex items-center justify-between sticky top-0">
          <h2 className="text-2xl font-black">DETALHES DA ATIVIDADE</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded">
            <X size={24} className="text-slate-300" />
          </button>
        </div>

        {/* TODO: Content */}
        <div className="p-6 space-y-6">
          {/* TODO: Agent section */}
          <section>
            <h3 className="text-lg font-bold mb-2 text-slate-200">Agente</h3>
            <div className="space-y-1 text-slate-400">
              <p>Nome: {activity.agent_name}</p>
              <p>Função: {activity.agent_role || '-'}</p>
            </div>
          </section>

          {/* TODO: Status section */}
          <section>
            <h3 className="text-lg font-bold mb-2 text-slate-200">Status</h3>
            <ActivityStatus status={activity.status} size="md" />
          </section>

          {/* TODO: Description section */}
          <section>
            <h3 className="text-lg font-bold mb-2 text-slate-200">Descrição</h3>
            <p className="text-slate-400 whitespace-pre-wrap">
              {activity.description}
            </p>
          </section>

          {/* TODO: Timestamps section */}
          <section>
            <h3 className="text-lg font-bold mb-2 text-slate-200">Histórico</h3>
            <div className="space-y-1 text-sm text-slate-400">
              <p>Criado: {new Date(activity.created_at).toLocaleString('pt-BR')}</p>
              <p>Atualizado: {new Date(activity.updated_at).toLocaleString('pt-BR')}</p>
              {activity.approved_at && (
                <p className="text-green-400">
                  Aprovado: {new Date(activity.approved_at).toLocaleString('pt-BR')}
                </p>
              )}
              {activity.rejected_at && (
                <p className="text-red-400">
                  Rejeitado: {new Date(activity.rejected_at).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          </section>

          {/* TODO: Metadata section */}
          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
            <section>
              <h3 className="text-lg font-bold mb-2 text-slate-200">Metadados</h3>
              <pre className="bg-slate-900 p-3 rounded overflow-auto text-xs text-slate-400">
                {formatMetadata(activity.metadata)}
              </pre>
            </section>
          )}
        </div>

        {/* TODO: Footer */}
        <div className="px-6 py-4 border-t-2 border-slate-700 bg-slate-700">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
