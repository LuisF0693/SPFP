/**
 * ActivityStatus Component
 * Displays activity status as an animated badge
 *
 * Status:
 * - running: 🔵 animated pulse
 * - idle: ⚪ static
 * - waiting: 🟡 static
 * - completed: 🟢 static
 * - error: 🔴 animated pulse
 */

import { ActivityStatus as ActivityStatusType } from '@/types/corporate';

interface ActivityStatusProps {
  status: ActivityStatusType;
  size?: 'sm' | 'md' | 'lg';
}

export function ActivityStatus({ status, size = 'md' }: ActivityStatusProps) {
  const statusConfig: Record<
    ActivityStatusType,
    { emoji: string; label: string; color: string; animate: boolean }
  > = {
    running: { emoji: '🔵', label: 'Executando', color: 'text-blue-500', animate: true },
    idle: { emoji: '⚪', label: 'Inativo', color: 'text-gray-400', animate: false },
    waiting: { emoji: '🟡', label: 'Aguardando', color: 'text-yellow-500', animate: false },
    completed: { emoji: '🟢', label: 'Completo', color: 'text-green-500', animate: false },
    error: { emoji: '🔴', label: 'Erro', color: 'text-red-500', animate: true },
  };

  const config = statusConfig[status];
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size];

  return (
    <div className={`flex items-center gap-2 ${sizeClass}`}>
      <span className={`inline-block ${config.animate ? 'animate-pulse' : ''}`}>
        {config.emoji}
      </span>
      <span className={config.color}>{config.label}</span>
    </div>
  );
}
