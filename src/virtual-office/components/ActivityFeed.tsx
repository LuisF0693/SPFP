// AIOS Virtual Office - Activity Feed Component
import { useCallback } from 'react';
import type { Activity, AgentId } from '../types';
import { AGENTS, DEPARTMENT_COLORS } from '../data/agents';

interface ActivityFeedProps {
  activities: Activity[];
  onActivityClick?: (agentId: AgentId) => void;
}

export function ActivityFeed({ activities, onActivityClick }: ActivityFeedProps) {
  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);

  const getRelativeTime = useCallback((timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-900/80 backdrop-blur-lg rounded-xl border border-gray-700/50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/50">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Activity Feed
        </h2>
      </div>

      {/* Activities List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No activities yet
          </div>
        ) : (
          activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onClick={() => onActivityClick?.(activity.agentId)}
              formatTime={formatTime}
              getRelativeTime={getRelativeTime}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ActivityItemProps {
  activity: Activity;
  onClick: () => void;
  formatTime: (timestamp: number) => string;
  getRelativeTime: (timestamp: number) => string;
}

function ActivityItem({ activity, onClick, getRelativeTime }: ActivityItemProps) {
  const agent = AGENTS[activity.agentId];
  const colors = DEPARTMENT_COLORS[agent.department];

  const getActivityIcon = () => {
    switch (activity.type) {
      case 'tool_start':
        return '🔄';
      case 'tool_complete':
        return activity.success ? '✅' : '❌';
      case 'status_change':
        return '📊';
      case 'task_assigned':
        return '📝';
      default:
        return '📌';
    }
  };

  return (
    <div
      className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer
        transition-colors duration-200 group"
      onClick={onClick}
    >
      {/* Agent Emoji */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
          text-sm"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
        }}
      >
        {agent.emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-white">{agent.name}</span>
          <span className="text-[10px] text-gray-500">
            {getRelativeTime(activity.timestamp)}
          </span>
        </div>
        <p className="text-xs text-gray-400 truncate">
          {getActivityIcon()} {activity.description}
        </p>
        {activity.tool && (
          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px]
            bg-gray-700 text-gray-300">
            {activity.tool}
          </span>
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;
