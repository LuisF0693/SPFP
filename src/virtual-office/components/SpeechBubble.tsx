// AIOS Virtual Office - Speech Bubble Component (Story 2.1)
import { useEffect, useState, useCallback } from 'react';
import type { AgentStatus } from '../types';

interface SpeechBubbleProps {
  /** Text content to display (max 50 chars will be enforced) */
  text: string;
  /** Whether the bubble should be visible */
  visible: boolean;
  /** Current agent status */
  status: AgentStatus;
  /** Time in ms before auto-hide (default: 5000) */
  autoHideDelay?: number;
  /** Last activity timestamp to track changes */
  lastActivityTime?: number;
  /** Position of the bubble relative to avatar */
  position?: 'top' | 'top-left' | 'top-right';
  /** Callback when bubble hides */
  onHide?: () => void;
}

const MAX_TEXT_LENGTH = 50;

// Truncate text with ellipsis if exceeds max length
function truncateText(text: string, maxLength: number = MAX_TEXT_LENGTH): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Get icon for activity type
function getActivityIcon(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('read') || lowerText.includes('reading')) return '📖';
  if (lowerText.includes('write') || lowerText.includes('writing')) return '✍️';
  if (lowerText.includes('bash') || lowerText.includes('command') || lowerText.includes('running')) return '⚡';
  if (lowerText.includes('grep') || lowerText.includes('search')) return '🔍';
  if (lowerText.includes('edit') || lowerText.includes('editing')) return '📝';
  if (lowerText.includes('task') || lowerText.includes('analyze')) return '🎯';
  if (lowerText.includes('test')) return '🧪';
  if (lowerText.includes('bug') || lowerText.includes('fix')) return '🐛';
  if (lowerText.includes('document')) return '📄';
  if (lowerText.includes('review')) return '👀';
  if (lowerText.includes('implement') || lowerText.includes('feature')) return '🚀';
  if (lowerText.includes('refactor')) return '♻️';
  return '💭';
}

// Status-based styling
function getStatusStyle(status: AgentStatus): {
  borderColor: string;
  bgGradient: string;
  textColor: string;
  glowColor: string;
} {
  const styles: Record<AgentStatus, ReturnType<typeof getStatusStyle>> = {
    idle: {
      borderColor: 'border-gray-600',
      bgGradient: 'from-gray-800/95 to-gray-900/95',
      textColor: 'text-gray-300',
      glowColor: 'shadow-gray-600/20'
    },
    working: {
      borderColor: 'border-green-500/50',
      bgGradient: 'from-gray-800/95 to-green-950/95',
      textColor: 'text-green-100',
      glowColor: 'shadow-green-500/30'
    },
    thinking: {
      borderColor: 'border-yellow-500/50',
      bgGradient: 'from-gray-800/95 to-yellow-950/95',
      textColor: 'text-yellow-100',
      glowColor: 'shadow-yellow-500/30'
    },
    waiting: {
      borderColor: 'border-gray-500',
      bgGradient: 'from-gray-800/95 to-gray-900/95',
      textColor: 'text-gray-400',
      glowColor: 'shadow-gray-500/20'
    },
    error: {
      borderColor: 'border-red-500/50',
      bgGradient: 'from-gray-800/95 to-red-950/95',
      textColor: 'text-red-100',
      glowColor: 'shadow-red-500/30'
    }
  };
  return styles[status] || styles.idle;
}

// Position styles
function getPositionStyle(position: 'top' | 'top-left' | 'top-right'): string {
  switch (position) {
    case 'top-left':
      return 'left-0 -translate-x-1/4';
    case 'top-right':
      return 'right-0 translate-x-1/4';
    case 'top':
    default:
      return 'left-1/2 -translate-x-1/2';
  }
}

// Tail position styles
function getTailStyle(position: 'top' | 'top-left' | 'top-right'): string {
  switch (position) {
    case 'top-left':
      return 'left-6';
    case 'top-right':
      return 'right-6';
    case 'top':
    default:
      return 'left-1/2 -translate-x-1/2';
  }
}

export function SpeechBubble({
  text,
  visible,
  status,
  autoHideDelay = 5000,
  lastActivityTime,
  position = 'top',
  onHide
}: SpeechBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayText, setDisplayText] = useState('');

  // Handle visibility changes with animation
  const showBubble = useCallback(() => {
    setDisplayText(truncateText(text));
    setIsAnimating(true);
    setIsVisible(true);
  }, [text]);

  const hideBubble = useCallback(() => {
    setIsAnimating(false);
    // Wait for exit animation to complete
    setTimeout(() => {
      setIsVisible(false);
      onHide?.();
    }, 200);
  }, [onHide]);

  // Handle visibility prop changes
  useEffect(() => {
    if (visible && text) {
      showBubble();
    } else if (!visible && isVisible) {
      hideBubble();
    }
  }, [visible, text, showBubble, hideBubble, isVisible]);

  // Update text when it changes (for active activities)
  useEffect(() => {
    if (isVisible && text) {
      setDisplayText(truncateText(text));
    }
  }, [text, isVisible]);

  // Auto-hide timer based on lastActivityTime
  useEffect(() => {
    if (!visible || !lastActivityTime || autoHideDelay <= 0) return;

    const hideTimer = setTimeout(() => {
      const timeSinceActivity = Date.now() - lastActivityTime;
      if (timeSinceActivity >= autoHideDelay) {
        hideBubble();
      }
    }, autoHideDelay);

    return () => clearTimeout(hideTimer);
  }, [visible, lastActivityTime, autoHideDelay, hideBubble]);

  // Reset timer when activity changes
  useEffect(() => {
    if (lastActivityTime && visible) {
      setIsAnimating(true);
    }
  }, [lastActivityTime, visible]);

  if (!isVisible) return null;

  const statusStyle = getStatusStyle(status);
  const positionStyle = getPositionStyle(position);
  const tailStyle = getTailStyle(position);
  const icon = getActivityIcon(displayText);

  return (
    <div
      className={`
        absolute bottom-full mb-3 z-50 pointer-events-none
        ${positionStyle}
        transition-all duration-200 ease-out
        ${isAnimating
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-2 scale-95'
        }
      `}
      role="status"
      aria-live="polite"
    >
      {/* Bubble Container */}
      <div
        className={`
          relative px-3 py-2 rounded-xl
          bg-gradient-to-br ${statusStyle.bgGradient}
          border ${statusStyle.borderColor}
          backdrop-blur-md
          shadow-lg ${statusStyle.glowColor}
          max-w-[200px] min-w-[80px]
        `}
      >
        {/* Content */}
        <div className="flex items-start gap-2">
          {/* Activity Icon */}
          <span className="text-sm flex-shrink-0 mt-0.5">{icon}</span>

          {/* Text */}
          <p
            className={`
              text-xs ${statusStyle.textColor} leading-relaxed
              break-words whitespace-pre-wrap
            `}
          >
            {displayText}
          </p>
        </div>

        {/* Typing indicator for thinking state */}
        {status === 'thinking' && (
          <div className="flex items-center gap-1 mt-1.5 ml-6">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {/* Progress indicator for working state */}
        {status === 'working' && (
          <div className="mt-1.5 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full animate-progress-indeterminate" />
          </div>
        )}
      </div>

      {/* Tail/Arrow pointing down */}
      <div
        className={`
          absolute -bottom-2 ${tailStyle}
          w-0 h-0
          border-l-[8px] border-l-transparent
          border-r-[8px] border-r-transparent
          border-t-[8px] ${statusStyle.borderColor.replace('border-', 'border-t-').replace('/50', '')}
        `}
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
        }}
      />
    </div>
  );
}

export default SpeechBubble;
