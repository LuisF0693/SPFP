/**
 * ActivityCard Component
 * Individual activity card in the feed
 *
 * Displays:
 * - Agent name and role
 * - Department info (emoji, color)
 * - Status badge
 * - Description
 * - Timestamp
 * - Approval buttons (if requires_approval)
 */

import { CorporateActivity, Department } from '@/types/corporate';
import { ActivityStatus } from './ActivityStatus';
import { ApprovalGate } from './ApprovalGate';
import { useState } from 'react';

interface ActivityCardProps {
  activity: CorporateActivity;
  departmentDot?: Department;
  onApprove?: (activityId: string) => Promise<void>;
  onReject?: (activityId: string) => Promise<void>;
  onDetails?: (activity: CorporateActivity) => void;
  isPending?: boolean;
}

/**
 * TODO: Implement ActivityCard component
 *
 * Should render:
 * - Card container with department color accent
 * - Header with agent name/role
 * - Status badge with ActivityStatus
 * - Description text
 * - Timestamp (relative time: "2 min ago")
 * - Department info (emoji + name)
 * - ApprovalGate (if requires_approval)
 * - "Details" button to open modal
 *
 * Example usage:
 * <ActivityCard
 *   activity={activity}
 *   onApprove={handleApprove}
 *   onReject={handleReject}
 *   onDetails={handleShowDetails}
 * />
 */
export function ActivityCard({
  activity,
  departmentDot,
  onApprove,
  onReject,
  onDetails,
  isPending = false,
}: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // TODO: Implement card layout
  // - Department color accent on left
  // - Agent info at top
  // - Status badge
  // - Description with ellipsis
  // - Footer with timestamp
  // - ApprovalGate if needed

  // TODO: Format timestamp (e.g., "2 min ago")
  const formatTime = (date: string): string => {
    // TODO: Implement relative time formatting
    return '';
  };

  // TODO: Get department color for accent
  const getDepartmentColor = (dept: string): string => {
    // TODO: Map department to color
    return '';
  };

  return (
    <div
      className="border-l-4 rounded p-3 mb-2 bg-slate-700 hover:bg-slate-600 transition-colors cursor-pointer"
      style={{
        borderLeftColor: getDepartmentColor(activity.department),
      }}
      onClick={() => onDetails?.(activity)}
    >
      {/* TODO: Render header with agent info */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-semibold text-slate-100">{activity.agent_name}</p>
          <p className="text-xs text-slate-400">{activity.agent_role || 'Agent'}</p>
        </div>
        <ActivityStatus status={activity.status} size="sm" />
      </div>

      {/* TODO: Render description */}
      <p className="text-sm text-slate-300 mb-2 line-clamp-2">
        {activity.description}
      </p>

      {/* TODO: Render footer with timestamp */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{activity.department.toUpperCase()}</span>
        <span>{formatTime(activity.created_at)}</span>
      </div>

      {/* TODO: Render ApprovalGate if needed */}
      {activity.requires_approval && !activity.approved_at && !activity.rejected_at && (
        <ApprovalGate
          activityId={activity.id}
          onApprove={onApprove}
          onReject={onReject}
          isPending={isPending}
        />
      )}

      {/* TODO: Render approval status if already approved/rejected */}
      {activity.approved_at && (
        <div className="mt-2 text-xs text-green-400">✓ Aprovado</div>
      )}
      {activity.rejected_at && (
        <div className="mt-2 text-xs text-red-400">✗ Rejeitado</div>
      )}
    </div>
  );
}
