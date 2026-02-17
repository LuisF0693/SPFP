/**
 * ActivityFeed Component
 * Main feed container showing real-time activities
 *
 * Features:
 * - Real-time Supabase subscriptions
 * - Fallback polling (5s)
 * - Department filtering
 * - Connection status indicator
 * - Approval workflow
 * - Activity details modal
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCorporateStore } from '@/stores/corporateStore';
import {
  subscribeToActivities,
  startPollingActivities,
  approveActivity,
  rejectActivity,
} from '@/services/corporateActivityService';
import { CorporateActivity, Department } from '@/types/corporate';
import { ActivityCard } from './ActivityCard';
import { ActivityDetailModal } from './ActivityDetailModal';

interface ActivityFeedProps {
  className?: string;
}

/**
 * TODO: Implement ActivityFeed component
 *
 * Responsibilities:
 * 1. Setup real-time subscription on mount
 * 2. Manage subscription lifecycle (cleanup)
 * 3. Handle polling fallback
 * 4. Render activity list with filtering
 * 5. Show connection status
 * 6. Handle approval/rejection
 * 7. Open detail modal on activity click
 *
 * Usage:
 * <ActivityFeed className="h-full" />
 */
export function ActivityFeed({ className = '' }: ActivityFeedProps) {
  const { user } = useAuth();
  const {
    activities,
    isRealtimeConnected,
    selectedDepartmentFilter,
    setRealtimeConnected,
    addActivity,
    updateActivity,
    setError,
    setLoading,
    addPendingApproval,
    removePendingApproval,
    isPendingApproval,
  } = useCorporateStore();

  const [selectedActivity, setSelectedActivity] = useState<CorporateActivity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);
  const [stopPolling, setStopPolling] = useState<(() => void) | null>(null);

  // TODO: Setup real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);

    // TODO: Subscribe to real-time updates
    const unsubFn = subscribeToActivities(
      user.id,
      (activity: CorporateActivity) => {
        // TODO: Handle new activity
        // - Check if exists (update) or new (add)
        addActivity(activity);
      },
      (error: Error) => {
        // TODO: Handle subscription error
        // - Log error
        // - Start polling fallback
        // - Set error state
        setError(error.message);
        setRealtimeConnected(false);

        // TODO: Start polling fallback
        const stopPoll = startPollingActivities(
          user.id,
          (fetchedActivities) => {
            // TODO: Update store with fetched activities
          }
        );
        setStopPolling(() => stopPoll);
      }
    );

    setUnsubscribe(() => unsubFn);
    setRealtimeConnected(true);
    setLoading(false);

    // TODO: Cleanup on unmount
    return () => {
      unsubFn();
      stopPolling?.();
    };
  }, [user?.id, addActivity, setError, setRealtimeConnected, setLoading]);

  // TODO: Handle approve activity
  const handleApprove = async (activityId: string) => {
    if (!user?.id) return;

    addPendingApproval(activityId);
    try {
      // TODO: Call approveActivity service
      const updated = await approveActivity(activityId, user.id);
      updateActivity(activityId, updated);
    } catch (error) {
      // TODO: Handle error
      setError('Erro ao aprovar atividade');
    } finally {
      removePendingApproval(activityId);
    }
  };

  // TODO: Handle reject activity
  const handleReject = async (activityId: string) => {
    if (!user?.id) return;

    addPendingApproval(activityId);
    try {
      // TODO: Call rejectActivity service
      const updated = await rejectActivity(activityId, user.id);
      updateActivity(activityId, updated);
    } catch (error) {
      // TODO: Handle error
      setError('Erro ao rejeitar atividade');
    } finally {
      removePendingApproval(activityId);
    }
  };

  // TODO: Filter activities
  const filteredActivities =
    selectedDepartmentFilter === 'all'
      ? activities
      : activities.filter((a) => a.department === selectedDepartmentFilter);

  return (
    <div className={`flex flex-col bg-slate-800 border-l border-slate-700 ${className}`}>
      {/* TODO: Header with connection status */}
      <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-100">ATIVIDADES</h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isRealtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-slate-400">
              {isRealtimeConnected ? 'Conectado' : 'Offline'}
            </span>
          </div>
        </div>

        {/* TODO: Department filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {/* TODO: Render department filter buttons */}
        </div>
      </div>

      {/* TODO: Activity list */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredActivities.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>Nenhuma atividade</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onApprove={handleApprove}
                onReject={handleReject}
                onDetails={(act) => {
                  setSelectedActivity(act);
                  setIsModalOpen(true);
                }}
                isPending={isPendingApproval(activity.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* TODO: Activity detail modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
