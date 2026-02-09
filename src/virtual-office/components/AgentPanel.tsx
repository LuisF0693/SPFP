// AIOS Virtual Office - Agent Detail Panel Component
import { useCallback, useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import type { AgentState, Activity } from '../types';
import { DEPARTMENT_COLORS, DEPARTMENTS } from '../data/agents';
import { TaskAssignmentModal, type TaskPriority } from './TaskAssignmentModal';
import { AgentChatModal } from './AgentChatModal';
import { ToastContainer, useToast } from './Toast';

interface AgentPanelProps {
  agent: AgentState | null;
  activities: Activity[];
  isOpen: boolean;
  onClose: () => void;
  onAssignTask?: (agentId: string, task: string, priority: TaskPriority) => Promise<boolean>;
}

export function AgentPanel({
  agent,
  activities,
  isOpen,
  onClose,
  onAssignTask
}: AgentPanelProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toasts, dismissToast, success, error } = useToast();

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleOpenTaskModal = useCallback(() => {
    setIsTaskModalOpen(true);
  }, []);

  const handleCloseTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
  }, []);

  const handleOpenChatModal = useCallback(() => {
    setIsChatModalOpen(true);
  }, []);

  const handleCloseChatModal = useCallback(() => {
    setIsChatModalOpen(false);
  }, []);

  const handleAssignTask = useCallback(async (taskDescription: string, priority: TaskPriority): Promise<boolean> => {
    if (!agent || !onAssignTask) return false;

    setIsSubmitting(true);
    try {
      const result = await onAssignTask(agent.id, taskDescription, priority);
      if (result) {
        success(`Task assigned to ${agent.name} successfully!`);
        return true;
      } else {
        error(`Failed to assign task to ${agent.name}`);
        return false;
      }
    } catch (err) {
      error(`Error assigning task: ${(err as Error).message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [agent, onAssignTask, success, error]);

  if (!agent || !isOpen) return null;

  const colors = DEPARTMENT_COLORS[agent.department];
  const department = DEPARTMENTS[agent.department];
  const agentActivities = activities
    .filter((a) => a.agentId === agent.id)
    .slice(0, 5);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-md h-full bg-gray-900/95 backdrop-blur-lg
          border-l border-gray-700/50 shadow-2xl
          animate-slide-in-right overflow-y-auto"
      >
        {/* Header */}
        <div
          className="relative p-6 pb-8"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}10)`
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg
              hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl
                shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 0 30px ${colors.glow}`
              }}
            >
              {agent.emoji}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{agent.name}</h2>
              <p className="text-gray-400">{agent.role}</p>
              <div
                className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs"
                style={{ background: colors.primary, color: '#fff' }}
              >
                {department.name}
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Current Status
          </h3>
          <div className="flex items-center gap-3">
            <StatusBadge status={agent.status} />
            <span className="text-white capitalize">{agent.status}</span>
          </div>
          {agent.currentActivity && (
            <p className="mt-2 text-sm text-gray-400">
              {agent.currentActivity}
            </p>
          )}
        </div>

        {/* Recent Activities */}
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            Recent Activities
          </h3>
          {agentActivities.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activities</p>
          ) : (
            <div className="space-y-2">
              {agentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-2 p-2 rounded-lg bg-gray-800/50"
                >
                  <span className="text-xs">
                    {activity.type === 'tool_complete' && activity.success ? '✅' : '🔄'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 truncate">
                      {activity.description}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 space-y-3">
          {/* Chat Button */}
          <button
            onClick={handleOpenChatModal}
            className="w-full py-3 rounded-xl font-medium text-white
              flex items-center justify-center gap-2
              transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
              bg-gray-700/80 hover:bg-gray-600/80 border border-gray-600/50"
          >
            <MessageSquare className="w-5 h-5" />
            Chat
          </button>

          {/* Assign Task Button */}
          <button
            onClick={handleOpenTaskModal}
            className="w-full py-3 rounded-xl font-medium text-white
              transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 4px 20px ${colors.glow}`
            }}
          >
            Assign Task
          </button>
        </div>
      </div>

      {/* Task Assignment Modal */}
      <TaskAssignmentModal
        agent={agent}
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onAssign={handleAssignTask}
        isSubmitting={isSubmitting}
      />

      {/* Agent Chat Modal */}
      <AgentChatModal
        agent={agent}
        isOpen={isChatModalOpen}
        onClose={handleCloseChatModal}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusColor = () => {
    switch (status) {
      case 'working':
        return 'bg-green-500';
      case 'thinking':
        return 'bg-yellow-500';
      case 'waiting':
        return 'bg-gray-400';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`w-3 h-3 rounded-full ${getStatusColor()} ${
        status === 'working' || status === 'thinking' ? 'animate-pulse' : ''
      }`}
    />
  );
}

export default AgentPanel;
