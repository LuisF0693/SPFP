/**
 * ApprovalGate Component
 * Approve/Reject buttons for activities requiring approval
 *
 * Shows:
 * - Approve button (green)
 * - Reject button (red)
 * - Loading state while request in progress
 * - Disabled after approval/rejection
 */

interface ApprovalGateProps {
  activityId: string;
  onApprove?: (activityId: string) => Promise<void>;
  onReject?: (activityId: string) => Promise<void>;
  isPending?: boolean;
  disabled?: boolean;
}

/**
 * TODO: Implement ApprovalGate component
 *
 * Should render:
 * - Two buttons: Approve (green) and Reject (red)
 * - Show loading spinner while API call in progress
 * - Disable buttons after action completed
 * - Show error toast if action fails
 * - Optional: Show timestamp of approval/rejection
 *
 * Example usage:
 * <ApprovalGate
 *   activityId="123"
 *   onApprove={handleApprove}
 *   onReject={handleReject}
 *   isPending={isPending}
 * />
 */
export function ApprovalGate({
  activityId,
  onApprove,
  onReject,
  isPending = false,
  disabled = false,
}: ApprovalGateProps) {
  // TODO: Implement approval logic
  // - Handle approve click
  // - Handle reject click
  // - Show loading state
  // - Handle errors

  const handleApprove = async () => {
    // TODO: Call onApprove
    // - Show loading
    // - Handle error
    // - Show success
  };

  const handleReject = async () => {
    // TODO: Call onReject
    // - Show loading
    // - Handle error
    // - Show success
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
