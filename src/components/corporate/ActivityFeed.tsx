import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCorporateStore } from '@/stores/corporateStore';
import {
  subscribeToActivities,
  startPollingActivities,
  approveActivity,
  rejectActivity,
  fetchActivities,
} from '@/services/corporateActivityService';
import { CorporateActivity, Department } from '@/types/corporate';
import { ActivityCard } from './ActivityCard';
import { ActivityDetailModal } from './ActivityDetailModal';

interface ActivityFeedProps {
  className?: string;
}

export function ActivityFeed({ className = '' }: ActivityFeedProps) {
  const { user } = useAuth();
  const {
    activities,
    isRealtimeConnected,
    selectedDepartmentFilter,
    setRealtimeConnected,
    addActivity,
    updateActivity,
    setActivities,
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

  // Setup real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);

    // Initial load
    fetchActivities(user.id, 100, 0)
      .then((activities) => {
        setActivities(activities);
      })
      .catch((err) => {
        setError('Failed to load activities');
        console.error(err);
      });

    // Subscribe to real-time updates
    const unsubFn = subscribeToActivities(
      user.id,
      (activity: CorporateActivity) => {
        // Check if activity already exists
        const existing = activities.find((a) => a.id === activity.id);
        if (existing) {
          updateActivity(activity.id, activity);
        } else {
          addActivity(activity);
        }
      },
      (error: Error) => {
        setError(error.message);
        setRealtimeConnected(false);

        // Start polling fallback
        const stopPoll = startPollingActivities(user.id, (fetchedActivities) => {
          setActivities(fetchedActivities);
        });
        setStopPolling(() => stopPoll);
      }
    );

    setUnsubscribe(() => unsubFn);
    setRealtimeConnected(true);
    setLoading(false);

    // Cleanup
    return () => {
      unsubFn();
      stopPolling?.();
    };
  }, [user?.id, addActivity, updateActivity, setActivities, setError, setRealtimeConnected, setLoading, activities]);

  // Handle approve activity
  const handleApprove = async (activityId: string) => {
    if (!user?.id) return;

    addPendingApproval(activityId);
    try {
      const updated = await approveActivity(activityId, user.id);
      updateActivity(activityId, updated);
    } catch (error) {
      setError('Erro ao aprovar atividade');
    } finally {
      removePendingApproval(activityId);
    }
  };

  // Handle reject activity
  const handleReject = async (activityId: string) => {
    if (!user?.id) return;

    addPendingApproval(activityId);
    try {
      const updated = await rejectActivity(activityId, user.id);
      updateActivity(activityId, updated);
    } catch (error) {
      setError('Erro ao rejeitar atividade');
    } finally {
      removePendingApproval(activityId);
    }
  };

  // Filter activities
  const filteredActivities =
    selectedDepartmentFilter === 'all'
      ? activities
      : activities.filter((a) => a.department === selectedDepartmentFilter);

  const departmentEmojis: Record<Department, string> = {
    financeiro: '💰',
    marketing: '📣',
    operacional: '⚙️',
    comercial: '🤝',
  };

  return (
    <div className={`flex flex-col bg-slate-800 border-l border-slate-700 ${className}`}>
      {/* Header with connection status */}
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

        {/* Department filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => useCorporateStore.setState({ selectedDepartmentFilter: 'all' })}
            className={`px-3 py-1 text-xs rounded whitespace-nowrap transition-colors ${
              selectedDepartmentFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Todos
          </button>
          {(['financeiro', 'marketing', 'operacional', 'comercial'] as const).map((dept) => (
            <button
              key={dept}
              onClick={() => useCorporateStore.setState({ selectedDepartmentFilter: dept })}
              className={`px-3 py-1 text-xs rounded whitespace-nowrap transition-colors ${
                selectedDepartmentFilter === dept
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {departmentEmojis[dept]} {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Activity list */}
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

      {/* Activity detail modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
