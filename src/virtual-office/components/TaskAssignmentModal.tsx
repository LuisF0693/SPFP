// AIOS Virtual Office - Task Assignment Modal
import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Send, Flag, AlertCircle } from 'lucide-react';
import type { AgentState } from '../types';
import { DEPARTMENT_COLORS } from '../data/agents';

export type TaskPriority = 'low' | 'medium' | 'high';

interface TaskAssignmentModalProps {
  agent: AgentState;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (taskDescription: string, priority: TaskPriority) => Promise<boolean>;
  isSubmitting?: boolean;
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string; borderColor: string }> = {
  low: {
    label: 'Low',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30'
  },
  high: {
    label: 'High',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  }
};

export function TaskAssignmentModal({
  agent,
  isOpen,
  onClose,
  onAssign,
  isSubmitting = false
}: TaskAssignmentModalProps) {
  const [taskDescription, setTaskDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTaskDescription('');
      setPriority('medium');
      setError(null);
      // Focus textarea after a short delay for animation
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const handleSubmit = useCallback(async () => {
    // Validate
    const trimmedTask = taskDescription.trim();
    if (!trimmedTask) {
      setError('Please enter a task description');
      textareaRef.current?.focus();
      return;
    }

    if (trimmedTask.length < 5) {
      setError('Task description must be at least 5 characters');
      textareaRef.current?.focus();
      return;
    }

    setError(null);

    try {
      const success = await onAssign(trimmedTask, priority);
      if (success) {
        onClose();
      }
    } catch (err) {
      setError('Failed to assign task. Please try again.');
    }
  }, [taskDescription, priority, onAssign, onClose]);

  // Handle Ctrl+Enter to submit
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isSubmitting) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit, isSubmitting]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  }, [onClose, isSubmitting]);

  if (!isOpen) return null;

  const colors = DEPARTMENT_COLORS[agent.department];

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div
        className="w-full max-w-md bg-gray-900/95 backdrop-blur-lg rounded-2xl
          border border-gray-700/50 shadow-2xl
          animate-scale-in overflow-hidden"
        style={{
          boxShadow: `0 0 40px ${colors.glow}, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-4 p-5 border-b border-gray-700/50"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}10)`
          }}
        >
          {/* Agent Avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl
              shadow-lg flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 0 20px ${colors.glow}`
            }}
          >
            {agent.emoji}
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h2 id="task-modal-title" className="text-lg font-bold text-white">
              Assign Task
            </h2>
            <p className="text-sm text-gray-400 truncate">
              to {agent.name} ({agent.role})
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Task Description */}
          <div>
            <label
              htmlFor="task-description"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Task Description
            </label>
            <textarea
              ref={textareaRef}
              id="task-description"
              value={taskDescription}
              onChange={(e) => {
                setTaskDescription(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Describe the task you want to assign..."
              disabled={isSubmitting}
              className={`w-full h-32 px-4 py-3 rounded-xl resize-none
                bg-gray-800/50 border transition-all duration-200
                text-white placeholder-gray-500
                focus:outline-none focus:ring-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${error
                  ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
                  : 'border-gray-700/50 focus:border-gray-500 focus:ring-gray-500/30'
                }`}
            />
            {error && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Tip: Press Ctrl+Enter to submit
            </p>
          </div>

          {/* Priority Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Flag className="w-4 h-4 inline-block mr-1" />
              Priority
            </label>
            <div className="flex gap-2">
              {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => {
                const config = PRIORITY_CONFIG[p];
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    disabled={isSubmitting}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm
                      transition-all duration-200 border
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${isSelected
                        ? `${config.bgColor} ${config.borderColor} ${config.color}`
                        : 'bg-gray-800/30 border-gray-700/30 text-gray-400 hover:bg-gray-800/50'
                      }`}
                    aria-pressed={isSelected}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl font-medium
              bg-gray-800/50 text-gray-300 border border-gray-700/50
              hover:bg-gray-700/50 transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !taskDescription.trim()}
            className="flex-1 py-3 px-4 rounded-xl font-medium text-white
              flex items-center justify-center gap-2
              transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 4px 20px ${colors.glow}`
            }}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Assign Task
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskAssignmentModal;
