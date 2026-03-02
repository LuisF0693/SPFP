import React, { useEffect, useState, useMemo } from 'react';
import { Loader2, Plus, RefreshCw, CheckCircle2, MessageSquare, ArrowRightLeft, UserCheck } from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { SPFP_AGENTS } from '../../data/companyAgents';

interface ActivityEvent {
  id: string;
  task_id: string;
  agent_id: string;
  agent_name: string;
  action_type: 'created' | 'status_changed' | 'commented' | 'assigned' | 'completed';
  old_value?: string;
  new_value?: string;
  payload?: Record<string, unknown>;
  created_at: string;
  company_tasks?: { title: string; status: string; board_id: string };
}

const ACTION_CONFIG: Record<string, { icon: React.FC<{ size?: number; className?: string }>; label: string; color: string }> = {
  created:        { icon: Plus,            label: 'criou task',          color: 'text-blue-400 bg-blue-500/10' },
  status_changed: { icon: ArrowRightLeft,  label: 'mudou status',        color: 'text-amber-400 bg-amber-500/10' },
  commented:      { icon: MessageSquare,   label: 'comentou',            color: 'text-purple-400 bg-purple-500/10' },
  assigned:       { icon: UserCheck,       label: 'atribuiu',            color: 'text-cyan-400 bg-cyan-500/10' },
  completed:      { icon: CheckCircle2,    label: 'concluiu task',       color: 'text-emerald-400 bg-emerald-500/10' },
};

const STATUS_LABEL: Record<string, string> = {
  TODO: 'A Fazer',
  IN_PROGRESS: 'Em Andamento',
  REVIEW: 'Em Revisão',
  DONE: 'Concluído',
};

export const ActivityFeed: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const loadActivities = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('task_activity_log')
        .select(`
          *,
          company_tasks (title, status, board_id)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setActivities((data as ActivityEvent[]) || []);
    } catch (err) {
      console.error('[ActivityFeed] Error loading activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [user]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'task_activity_log' },
        async (payload) => {
          // Fetch the full record with joined task
          const { data } = await supabase
            .from('task_activity_log')
            .select('*, company_tasks (title, status, board_id)')
            .eq('id', payload.new.id)
            .single();
          if (data) {
            setActivities((prev) => [data as ActivityEvent, ...prev.slice(0, 99)]);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchesAgent = agentFilter === 'ALL' || a.agent_id === agentFilter;
      const matchesAction = actionFilter === 'ALL' || a.action_type === actionFilter;
      return matchesAgent && matchesAction;
    });
  }, [activities, agentFilter, actionFilter]);

  // Daily summary
  const todaySummary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayActivities = activities.filter((a) => new Date(a.created_at) >= today);
    return {
      created: todayActivities.filter((a) => a.action_type === 'created').length,
      completed: todayActivities.filter((a) => a.action_type === 'completed' || (a.action_type === 'status_changed' && a.new_value === 'DONE')).length,
      comments: todayActivities.filter((a) => a.action_type === 'commented').length,
    };
  }, [activities]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Feed de Atividade</h2>
          <p className="text-gray-400 text-sm">Ações dos agentes IA em tempo real</p>
        </div>
        <button
          onClick={loadActivities}
          className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="Atualizar"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Daily summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4 border border-white/5 text-center">
          <p className="text-2xl font-bold text-blue-400">{todaySummary.created}</p>
          <p className="text-xs text-gray-500 mt-1">Tasks criadas hoje</p>
        </div>
        <div className="glass rounded-2xl p-4 border border-white/5 text-center">
          <p className="text-2xl font-bold text-emerald-400">{todaySummary.completed}</p>
          <p className="text-xs text-gray-500 mt-1">Concluídas hoje</p>
        </div>
        <div className="glass rounded-2xl p-4 border border-white/5 text-center">
          <p className="text-2xl font-bold text-purple-400">{todaySummary.comments}</p>
          <p className="text-xs text-gray-500 mt-1">Comentários hoje</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">Agente:</span>
          <button onClick={() => setAgentFilter('ALL')} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${agentFilter === 'ALL' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            Todos
          </button>
          {SPFP_AGENTS.map((a) => (
            <button key={a.id} onClick={() => setAgentFilter(a.id)} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${agentFilter === a.id ? 'bg-accent/20 text-accent border border-accent/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
              {a.avatar} {a.name.split(' ')[0]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">Tipo:</span>
          <button onClick={() => setActionFilter('ALL')} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${actionFilter === 'ALL' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
            Todos
          </button>
          {Object.entries(ACTION_CONFIG).map(([type, cfg]) => (
            <button key={type} onClick={() => setActionFilter(type)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${actionFilter === type ? 'bg-accent/20 text-accent border border-accent/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={28} className="animate-spin text-gray-500" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-2xl bg-white/5 text-gray-600 mb-4">
            <RefreshCw size={28} />
          </div>
          <p className="text-gray-500 text-sm">Nenhuma atividade ainda</p>
          <p className="text-gray-600 text-xs mt-1">As ações dos agentes aparecerão aqui em tempo real</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredActivities.map((event) => {
            const agent = SPFP_AGENTS.find((a) => a.id === event.agent_id);
            const actionCfg = ACTION_CONFIG[event.action_type] || ACTION_CONFIG.created;
            const ActionIcon = actionCfg.icon;
            const timeAgo = (() => {
              const diff = Date.now() - new Date(event.created_at).getTime();
              const mins = Math.floor(diff / 60000);
              if (mins < 1) return 'agora';
              if (mins < 60) return `${mins}min atrás`;
              const hrs = Math.floor(mins / 60);
              if (hrs < 24) return `${hrs}h atrás`;
              return new Date(event.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            })();

            return (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors group">
                {/* Agent avatar */}
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-base flex-shrink-0">
                  {agent?.avatar || '🤖'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white text-sm font-medium">{event.agent_name}</span>
                    <div className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${actionCfg.color}`}>
                      <ActionIcon size={10} />
                      {actionCfg.label}
                    </div>
                  </div>
                  {event.company_tasks?.title && (
                    <p className="text-gray-400 text-xs mt-0.5 truncate">
                      {event.company_tasks.title}
                    </p>
                  )}
                  {event.action_type === 'status_changed' && event.old_value && event.new_value && (
                    <p className="text-gray-500 text-xs mt-0.5">
                      {STATUS_LABEL[event.old_value] || event.old_value} → {STATUS_LABEL[event.new_value] || event.new_value}
                    </p>
                  )}
                  {event.action_type === 'commented' && event.new_value && (
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-2 italic">"{event.new_value}"</p>
                  )}
                </div>

                {/* Time */}
                <span className="text-[10px] text-gray-600 flex-shrink-0">{timeAgo}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
