import { CorporateActivity } from '@/types/corporate';
import { ActivityStatus } from './ActivityStatus';
import { ApprovalGate } from './ApprovalGate';

interface ActivityCardProps {
  activity: CorporateActivity;
  onApprove?: (activityId: string) => Promise<void>;
  onReject?: (activityId: string) => Promise<void>;
  onDetails?: (activity: CorporateActivity) => void;
  isPending?: boolean;
}

export function ActivityCard({
  activity,
  onApprove,
  onReject,
  onDetails,
  isPending = false,
}: ActivityCardProps) {
  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const departmentColors: Record<string, string> = {
    financeiro: '#10B981',
    marketing: '#8B5CF6',
    operacional: '#F59E0B',
    comercial: '#3B82F6',
  };

  return (
    <div
      className="border-l-4 rounded p-3 mb-2 bg-slate-700 hover:bg-slate-600 transition-colors cursor-pointer"
      style={{
        borderLeftColor: departmentColors[activity.department] || '#6B7280',
      }}
      onClick={() => onDetails?.(activity)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-semibold text-slate-100">{activity.agent_name}</p>
          <p className="text-xs text-slate-400">{activity.agent_role || 'Agent'}</p>
        </div>
        <ActivityStatus status={activity.status} size="sm" />
      </div>

      <p className="text-sm text-slate-300 mb-2 line-clamp-2">{activity.description}</p>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{activity.department.toUpperCase()}</span>
        <span>{formatTime(activity.created_at)}</span>
      </div>

      {activity.requires_approval && !activity.approved_at && !activity.rejected_at && (
        <ApprovalGate
          activityId={activity.id}
          onApprove={onApprove}
          onReject={onReject}
          isPending={isPending}
        />
      )}

      {activity.approved_at && (
        <div className="mt-2 text-xs text-green-400">✓ Aprovado</div>
      )}
      {activity.rejected_at && (
        <div className="mt-2 text-xs text-red-400">✗ Rejeitado</div>
      )}
    </div>
  );
}
