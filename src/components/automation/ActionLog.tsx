/**
 * Action Log Component
 * Displays history of automation actions with filtering and details
 */

import { useState, useMemo } from 'react';
import { AutomationAction } from '@/services/automationService';

// Action type definitions and styling
export const ACTION_TYPES = {
  screenshot: { label: 'Screenshot', icon: '📸', color: 'blue' },
  navigate: { label: 'Navegação', icon: '🔗', color: 'green' },
  click: { label: 'Clique', icon: '👆', color: 'purple' },
  fill: { label: 'Preenchimento', icon: '✏️', color: 'orange' },
  select: { label: 'Seleção', icon: '☑️', color: 'cyan' },
} as const;

export const ACTION_STATUS = {
  pending: { label: 'Pendente', icon: '⏳', color: 'yellow' },
  running: { label: 'Executando', icon: '▶️', color: 'blue' },
  success: { label: 'Sucesso', icon: '✓', color: 'green' },
  error: { label: 'Erro', icon: '✗', color: 'red' },
} as const;

type ActionType = keyof typeof ACTION_TYPES;

interface ActionLogProps {
  actions: AutomationAction[];
  onClearHistory: () => void;
}

export function ActionLog({ actions, onClearHistory }: ActionLogProps) {
  const [filter, setFilter] = useState<ActionType | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter actions based on selected type
  const filteredActions = useMemo(() => {
    return actions.filter((action) => filter === 'all' || action.type === filter);
  }, [actions, filter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: actions.length,
      success: actions.filter((a) => a.status === 'success').length,
      error: actions.filter((a) => a.status === 'error').length,
      filtered: filteredActions.length,
    };
  }, [actions, filteredActions]);

  /**
   * Formata timestamp em hora legível
   */
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  /**
   * Formata duração em ms para string legível
   */
  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  /**
   * Trata clique para limpar histórico com confirmação
   */
  const handleClearHistory = async () => {
    if (
      window.confirm(
        `Tem certeza que deseja limpar o histórico? (${stats.total} ações serão removidas)`
      )
    ) {
      onClearHistory();
      setExpandedId(null);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>📋</span>
            Histórico de Ações
          </h3>
          <button
            onClick={handleClearHistory}
            disabled={actions.length === 0}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={actions.length === 0 ? 'Nenhuma ação para limpar' : 'Limpar histórico'}
          >
            🗑️ Limpar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="bg-white dark:bg-slate-900 rounded p-2">
            <div className="text-slate-500 dark:text-slate-400">Total</div>
            <div className="font-bold text-slate-900 dark:text-slate-100">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded p-2">
            <div className="text-slate-500 dark:text-slate-400">✓ Sucesso</div>
            <div className="font-bold text-green-600 dark:text-green-400">{stats.success}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded p-2">
            <div className="text-slate-500 dark:text-slate-400">✗ Erro</div>
            <div className="font-bold text-red-600 dark:text-red-400">{stats.error}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded p-2">
            <div className="text-slate-500 dark:text-slate-400">Filtrado</div>
            <div className="font-bold text-blue-600 dark:text-blue-400">{stats.filtered}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            Todos ({actions.length})
          </button>
          {Object.entries(ACTION_TYPES).map(([key, { label, icon }]) => {
            const count = actions.filter((a) => a.type === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilter(key as ActionType)}
                disabled={count === 0}
                className={`px-3 py-1 text-sm rounded transition-colors whitespace-nowrap ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : count === 0
                      ? 'opacity-30 cursor-not-allowed bg-slate-200 dark:bg-slate-700'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {icon} {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-950">
        {filteredActions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <p className="text-lg">Nenhuma ação registrada</p>
            <p className="text-sm mt-1">
              {filter === 'all'
                ? 'Capture screenshots ou navegue para começar'
                : `Nenhuma ação do tipo "${ACTION_TYPES[filter].label}"`}
            </p>
          </div>
        ) : (
          filteredActions.map((action) => {
            const actionType = ACTION_TYPES[action.type as ActionType];
            const actionStatus = ACTION_STATUS[action.status];
            const isExpanded = expandedId === action.id;

            return (
              <div key={action.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                {/* Action Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : action.id)}
                  className="w-full text-left p-3 flex items-center justify-between hover:opacity-80"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Icon & Type */}
                    <div className="flex-shrink-0 text-xl">{actionType.icon}</div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {actionType.label}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {formatTime(action.timestamp)}
                      </div>
                    </div>

                    {/* Details Preview */}
                    {action.details && (
                      <div className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs">
                        {action.details}
                      </div>
                    )}
                    {action.params?.url && (
                      <div className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs">
                        {action.params.url}
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div
                    className="flex-shrink-0 text-xl ml-2"
                    title={actionStatus.label}
                  >
                    {actionStatus.icon}
                  </div>

                  {/* Duration */}
                  {action.duration && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 w-12 text-right ml-2 flex-shrink-0">
                      {formatDuration(action.duration)}
                    </div>
                  )}

                  {/* Chevron */}
                  <div className="text-slate-400 dark:text-slate-600 ml-2 flex-shrink-0">
                    {isExpanded ? '▲' : '▼'}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 border-t border-slate-200 dark:border-slate-700 text-sm space-y-2">
                    {/* Status */}
                    <div>
                      <div className="font-medium text-slate-700 dark:text-slate-300">
                        Status:
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        {actionStatus.label}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div>
                      <div className="font-medium text-slate-700 dark:text-slate-300">
                        Timestamp:
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 font-mono text-xs">
                        {new Date(action.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>

                    {/* Duration */}
                    {action.duration && (
                      <div>
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          Duração:
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          {formatDuration(action.duration)}
                        </div>
                      </div>
                    )}

                    {/* Params */}
                    {action.params && Object.keys(action.params).length > 0 && (
                      <div>
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          Parâmetros:
                        </div>
                        <pre className="bg-slate-200 dark:bg-slate-800 p-2 rounded text-xs overflow-auto font-mono">
                          {JSON.stringify(action.params, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Details */}
                    {action.details && (
                      <div>
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          Detalhes:
                        </div>
                        <div className="text-slate-600 dark:text-slate-400">
                          {action.details}
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {action.error && (
                      <div>
                        <div className="font-medium text-red-600 dark:text-red-400">
                          Erro:
                        </div>
                        <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 p-2 rounded">
                          {action.error}
                        </div>
                      </div>
                    )}

                    {/* ID */}
                    <div>
                      <div className="font-medium text-slate-700 dark:text-slate-300">
                        ID:
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 font-mono text-xs break-all">
                        {action.id}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
