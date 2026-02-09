// AIOS Virtual Office - Agent Avatar Component (CSS-based for MVP)
import { useCallback, useMemo } from 'react';
import type { AgentState, Department, AgentStatus } from '../types';
import { DEPARTMENT_COLORS } from '../data/agents';
import { SpeechBubble } from './SpeechBubble';

interface AgentAvatarProps {
  agent: AgentState;
  onClick?: () => void;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Show speech bubble when agent is active */
  showSpeechBubble?: boolean;
  /** Auto-hide speech bubble after ms of inactivity (default: 5000) */
  speechBubbleAutoHide?: number;
}

const SIZES = {
  sm: { container: 'w-12 h-12', emoji: 'text-xl', name: 'text-[10px]', role: 'text-[8px]', badge: 'w-2 h-2' },
  md: { container: 'w-16 h-16', emoji: 'text-3xl', name: 'text-xs', role: 'text-[10px]', badge: 'w-3 h-3' },
  lg: { container: 'w-20 h-20', emoji: 'text-4xl', name: 'text-sm', role: 'text-xs', badge: 'w-4 h-4' }
};

export function AgentAvatar({
  agent,
  onClick,
  selected = false,
  size = 'md',
  showSpeechBubble = true,
  speechBubbleAutoHide = 5000
}: AgentAvatarProps) {
  const colors = DEPARTMENT_COLORS[agent.department];
  const sizeClasses = SIZES[size];

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  // Determine if speech bubble should be visible
  // Show when agent is working or thinking AND has current activity
  const isBubbleVisible = useMemo(() => {
    if (!showSpeechBubble) return false;
    if (!agent.currentActivity) return false;
    const activeStatuses: AgentStatus[] = ['working', 'thinking'];
    return activeStatuses.includes(agent.status);
  }, [showSpeechBubble, agent.currentActivity, agent.status]);

  return (
    <div
      className={`
        relative cursor-pointer transition-all duration-200 flex flex-col items-center
        ${selected ? 'scale-110 z-10' : 'hover:scale-105'}
      `}
      onClick={handleClick}
    >
      {/* Speech Bubble - positioned above avatar */}
      <SpeechBubble
        text={agent.currentActivity || ''}
        visible={isBubbleVisible}
        status={agent.status}
        autoHideDelay={speechBubbleAutoHide}
        lastActivityTime={agent.lastActivityTime}
        position="top"
      />

      {/* Avatar Circle */}
      <div
        className={`
          ${sizeClasses.container} rounded-full flex items-center justify-center
          ${getAnimationClass(agent.status)}
          transition-shadow duration-300
        `}
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          boxShadow: selected
            ? `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`
            : `0 4px 12px rgba(0, 0, 0, 0.3)`
        }}
      >
        <span className={sizeClasses.emoji}>{agent.emoji}</span>
      </div>

      {/* Status Badge */}
      <div
        className={`
          absolute -top-0.5 -right-0.5 ${sizeClasses.badge} rounded-full
          border-2 border-gray-900
          ${getStatusClass(agent.status)}
        `}
      />

      {/* Name & Role */}
      <div className="text-center mt-1.5 max-w-[80px]">
        <p className={`${sizeClasses.name} text-white font-medium truncate`}>
          {agent.name}
        </p>
        <p className={`${sizeClasses.role} text-gray-400 truncate`}>
          {agent.role}
        </p>
      </div>

      {/* Activity Indicator - only show when bubble is NOT visible (fallback for small view) */}
      {agent.currentActivity && !isBubbleVisible && (
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2
            bg-gray-800/90 backdrop-blur-sm px-2 py-0.5 rounded-full
            text-[9px] text-gray-300 whitespace-nowrap max-w-[100px] truncate
            border border-gray-700"
        >
          {agent.currentActivity}
        </div>
      )}
    </div>
  );
}

function getAnimationClass(status: AgentStatus): string {
  const animations: Record<AgentStatus, string> = {
    idle: 'animate-breathing',
    working: 'animate-typing',
    thinking: 'animate-thinking',
    waiting: '',
    error: 'animate-shake'
  };
  return animations[status] || '';
}

function getStatusClass(status: AgentStatus): string {
  const classes: Record<AgentStatus, string> = {
    idle: 'bg-gray-500',
    working: 'bg-green-500 animate-pulse',
    thinking: 'bg-yellow-500 animate-pulse',
    waiting: 'bg-gray-400',
    error: 'bg-red-500 animate-ping'
  };
  return classes[status] || 'bg-gray-500';
}

export default AgentAvatar;
