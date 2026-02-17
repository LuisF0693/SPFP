/**
 * ApprovalGate Component
 * Approve/Reject buttons for activities requiring approval
 */

interface ApprovalGateProps {
  activityId: string;
  onApprove?: (activityId: string) => Promise<void>;
  onReject?: (activityId: string) => Promise<void>;
  isPending?: boolean;
  disabled?: boolean;
}

export function ApprovalGate({
  activityId,
  onApprove,
  onReject,
  isPending = false,
  disabled = false,
}: ApprovalGateProps) {
  const handleApprove = async () => {
    if (onApprove && !isPending && !disabled) {
      await onApprove(activityId);
    }
  };

  const handleReject = async () => {
    if (onReject && !isPending && !disabled) {
      await onReject(activityId);
    }
  };

  return (
    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-600">
      <button
        onClick={handleApprove}
        disabled={isPending || disabled}
        className="flex-1 py-1 px-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
      >
        {isPending ? '...' : '✓ Aprovar'}
      </button>
      <button
        onClick={handleReject}
        disabled={isPending || disabled}
        className="flex-1 py-1 px-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
      >
        {isPending ? '...' : '✗ Rejeitar'}
      </button>
    </div>
  );
}
