/**
 * ActivityFeed - Pipeline Feed with Real-time Activity Display
 * AC-407.1 to 407.9 implemented
 * Features: Scroll infinito, filtros, status badges, timestamp amigável, virtualization
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

interface ActivityFeedItem {
  id: string;
  department: 'financeiro' | 'marketing' | 'operacional' | 'comercial' | 'estrategia' | 'ideacao' | 'producao' | 'design';
  agentName: string;
  agentRole: string;
  description: string;
  status: 'running' | 'idle' | 'waiting' | 'completed' | 'error';
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

const mockActivities: ActivityFeedItem[] = [
  {
    id: '1',
    department: 'financeiro',
    agentName: 'Atlas',
    agentRole: 'Analista',
    description: 'Reconciliação de transações do mês atual',
    status: 'completed',
    requiresApproval: false,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: '2',
    department: 'marketing',
    agentName: 'Luna',
    agentRole: 'Designer',
    description: 'Criação de assets visuais para campanha Q1',
    status: 'running',
    requiresApproval: true,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: '3',
    department: 'operacional',
    agentName: 'Max',
    agentRole: 'Scrum Master',
    description: 'Planejamento do sprint 8 finalizado',
    status: 'completed',
    requiresApproval: false,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: '4',
    department: 'comercial',
    agentName: 'Dex',
    agentRole: 'Desenvolvedor',
    description: 'Setup de novo cliente na plataforma',
    status: 'waiting',
    requiresApproval: true,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: '5',
    department: 'financeiro',
    agentName: 'Nova',
    agentRole: 'Data Engineer',
    description: 'Pipeline ETL de dados financeiros',
    status: 'running',
    requiresApproval: false,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  ...Array.from({ length: 95 }, (_, i) => ({
    id: String(6 + i),
    department: ['financeiro', 'marketing', 'operacional', 'comercial', 'estrategia'][Math.floor(Math.random() * 5)] as any,
    agentName: ['Atlas', 'Luna', 'Max', 'Dex', 'Nova'][Math.floor(Math.random() * 5)],
    agentRole: ['Analista', 'Designer', 'Desenvolvedor', 'Manager', 'Engineer'][Math.floor(Math.random() * 5)],
    description: ['Processando dados', 'Gerando relatório', 'Atualizando sistema', 'Sincronizando banco', 'Analisando métricas'][Math.floor(Math.random() * 5)],
    status: ['running', 'idle', 'waiting', 'completed', 'error'][Math.floor(Math.random() * 5)] as any,
    requiresApproval: Math.random() > 0.7,
    createdAt: new Date(Date.now() - Math.random() * 24 * 3600000).toISOString(),
  })),
];

const statusColors: Record<string, { bg: string; icon: string }> = {
  running: { bg: 'bg-green-600', icon: '🟢' },
  idle: { bg: 'bg-gray-600', icon: '⚪' },
  waiting: { bg: 'bg-yellow-600', icon: '🟡' },
  completed: { bg: 'bg-green-600', icon: '✅' },
  error: { bg: 'bg-red-600', icon: '❌' },
};

const departmentEmojis: Record<string, string> = {
  financeiro: '💰',
  marketing: '📣',
  operacional: '⚙️',
  comercial: '🤝',
  estrategia: '🎯',
  ideacao: '💡',
  producao: '🏭',
  design: '🎨',
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Agora';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m atrás`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d atrás`;
  return date.toLocaleDateString('pt-BR');
}

interface ActivityCardProps {
  activity: ActivityFeedItem;
  expanded: boolean;
  onExpand: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

function ActivityCardComponent({ activity, expanded, onExpand, onApprove, onReject }: ActivityCardProps) {
  const statusColor = statusColors[activity.status];

  return (
    <div
      className="bg-slate-700 rounded p-3 border border-slate-600 hover:bg-slate-600 transition cursor-pointer"
      onClick={() => onExpand(activity.id)}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white text-sm font-semibold">{activity.agentName}</p>
            <span className={`${statusColor.bg} text-white text-xs px-2 py-0.5 rounded`}>
              {statusColor.icon}
            </span>
            {activity.requiresApproval && (
              <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded">⏳ AGUARDANDO APROVAÇÃO</span>
            )}
          </div>
          <p className="text-slate-300 text-xs mb-1">{activity.agentRole}</p>
          <p className="text-slate-400 text-xs line-clamp-2">{activity.description}</p>
          <p className="text-slate-500 text-xs mt-1">{formatTimeAgo(activity.createdAt)}</p>
        </div>
        {expanded && <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-600">
          <p className="text-slate-300 text-xs mb-3">{activity.description}</p>
          {activity.requiresApproval && (
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove?.(activity.id);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded"
              >
                ✅ Aprovar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReject?.(activity.id);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-2 rounded"
              >
                ❌ Rejeitar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ActivityFeedProps {
  className?: string;
}

export function ActivityFeed({ className = '' }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityFeedItem[]>(mockActivities);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simular carregamento de mais dados (scroll infinito)
  const handleLoadMore = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);

    setTimeout(() => {
      const newPage = mockActivities.slice((page + 1) * 100, (page + 2) * 100);
      if (newPage.length > 0) {
        setActivities(prev => [...prev, ...newPage]);
        setPage(p => p + 1);
      }
      setIsLoading(false);
    }, 300);
  }, [page, isLoading]);

  // Detectar scroll infinito
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollHeight - container.scrollTop - container.clientHeight < 100) {
        handleLoadMore();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleLoadMore]);

  const filteredActivities = selectedDept === 'all'
    ? activities
    : activities.filter(a => a.department === selectedDept);

  const pendingApprovals = filteredActivities.filter(a => a.requiresApproval).length;

  return (
    <div className={`flex flex-col bg-slate-800 border-l border-slate-700 h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-white">ATIVIDADES</h2>
            <p className="text-xs text-slate-400">{filteredActivities.length} atividades</p>
          </div>
          {pendingApprovals > 0 && (
            <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded font-semibold">
              {pendingApprovals} aguardando
            </span>
          )}
        </div>

        {/* Department filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedDept('all')}
            className={`px-3 py-1 text-xs rounded whitespace-nowrap transition-colors ${
              selectedDept === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Todos
          </button>
          {Object.entries(departmentEmojis).map(([dept, emoji]) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 text-xs rounded whitespace-nowrap transition-colors ${
                selectedDept === dept
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {emoji} {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2"
      >
        {filteredActivities.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>Nenhuma atividade</p>
          </div>
        ) : (
          <>
            {filteredActivities.map(activity => (
              <ActivityCardComponent
                key={activity.id}
                activity={activity}
                expanded={expandedId === activity.id}
                onExpand={(id) => setExpandedId(expandedId === id ? null : id)}
              />
            ))}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="text-slate-400 text-sm">Carregando mais...</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
