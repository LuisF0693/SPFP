/**
 * ApprovalGate Component
 * Approve/Reject modal for activities requiring approval
 * AC-408.1 to 408.7 implemented
 */

import { useState } from 'react';
import { X, Check } from 'lucide-react';

interface ApprovalHistory {
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

interface ApprovalGateProps {
  activityId: string;
  activityTitle?: string;
  requiresApproval?: boolean;
  history?: ApprovalHistory;
  onApprove?: (activityId: string) => Promise<void>;
  onReject?: (activityId: string, reason: string) => Promise<void>;
  isPending?: boolean;
  disabled?: boolean;
  isApproved?: boolean;
  isRejected?: boolean;
}

export function ApprovalGate({
  activityId,
  activityTitle = 'Atividade',
  requiresApproval = true,
  history,
  onApprove,
  onReject,
  isPending = false,
  disabled = false,
  isApproved = false,
  isRejected = false,
}: ApprovalGateProps) {
  const [showModal, setShowModal] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notification, setNotification] = useState<{ type: 'approve' | 'reject'; message: string } | null>(null);

  const handleApprove = async () => {
    if (onApprove && !isPending && !disabled && !isApproved && !isRejected) {
      try {
        await onApprove(activityId);
        setNotification({ type: 'approve', message: '✅ Aprovado!' });
        setShowModal(false);
        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        console.error('Error approving:', error);
      }
    }
  };

  const handleReject = async () => {
    if (onReject && !isPending && !disabled && !isApproved && !isRejected && rejectionReason) {
      try {
        await onReject(activityId, rejectionReason);
        setNotification({ type: 'reject', message: '❌ Rejeitado' });
        setShowModal(false);
        setRejectionReason('');
        setShowRejectReason(false);
        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        console.error('Error rejecting:', error);
      }
    }
  };

  // Se já foi aprovado ou rejeitado, mostrar status final
  if (isApproved) {
    return (
      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-600">
        <div className="flex-1 bg-green-600/20 border border-green-600 text-green-400 px-3 py-2 rounded text-sm flex items-center gap-2">
          <Check size={16} />
          Aprovado {history?.approvedAt && `em ${new Date(history.approvedAt).toLocaleDateString('pt-BR')}`}
        </div>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-600">
        <div className="bg-red-600/20 border border-red-600 text-red-400 px-3 py-2 rounded text-sm flex items-center gap-2">
          <X size={16} />
          Rejeitado
        </div>
        {history?.rejectionReason && (
          <p className="text-xs text-slate-400 bg-slate-700/50 px-3 py-2 rounded">
            <strong>Motivo:</strong> {history.rejectionReason}
          </p>
        )}
      </div>
    );
  }

  // Gate pendente de aprovação
  if (!requiresApproval) return null;

  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded text-white text-sm font-medium z-50 animate-in fade-in slide-in-from-right ${
            notification.type === 'approve' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Gate Badge + Buttons */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-600">
        <span className="bg-yellow-600 text-white text-xs px-2 py-1.5 rounded whitespace-nowrap font-medium">
          ⏳ AGUARDANDO APROVAÇÃO
        </span>
        <button
          onClick={() => setShowModal(true)}
          disabled={isPending || disabled}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white text-sm py-1.5 rounded transition-colors"
        >
          {isPending ? '...' : 'Abrir Modal'}
        </button>
      </div>

      {/* Approval Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-96">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Aprovar/Rejeitar</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setShowRejectReason(false);
                  setRejectionReason('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Activity Details */}
            <div className="bg-slate-700 rounded p-4 mb-4">
              <p className="text-white font-semibold">{activityTitle}</p>
              <p className="text-slate-400 text-sm mt-1">Atividade aguardando sua decisão</p>
            </div>

            {/* Rejection Reason Input */}
            {showRejectReason && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Motivo da Rejeição</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value.slice(0, 150))}
                  placeholder="Explique o motivo da rejeição (máx 150 caracteres)"
                  maxLength={150}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm h-20 resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">{rejectionReason.length}/150</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                disabled={isPending || disabled || isApproved || isRejected}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white py-2 rounded text-sm font-medium transition-colors"
              >
                {isPending ? '...' : '✅ Aprovar'}
              </button>
              {!showRejectReason ? (
                <button
                  onClick={() => setShowRejectReason(true)}
                  disabled={isPending || disabled || isApproved || isRejected}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white py-2 rounded text-sm font-medium transition-colors"
                >
                  {isPending ? '...' : '❌ Rejeitar'}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleReject}
                    disabled={isPending || disabled || !rejectionReason}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white py-2 rounded text-sm font-medium transition-colors"
                  >
                    {isPending ? '...' : 'Confirmar Rejeição'}
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectReason(false);
                      setRejectionReason('');
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowModal(false);
                setShowRejectReason(false);
                setRejectionReason('');
              }}
              className="w-full mt-3 text-slate-400 hover:text-white text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
