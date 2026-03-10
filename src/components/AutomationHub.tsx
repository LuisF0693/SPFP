// AutomationHub.tsx — Dashboard em tempo real do SPFP Webhook Server
// ClickUp → Claude Agents → Redes Sociais

import { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, ExternalLink, AlertCircle, Zap, CheckCircle2, Clock, Bot } from 'lucide-react';

const WEBHOOK_URL = (import.meta as any).env?.VITE_WEBHOOK_URL || 'http://localhost:3001';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AutomationEvent {
  id: number;
  timestamp: string;
  type: string;
  taskId?: string;
  listId?: string;
  status?: string;
  result?: string;
  agent?: string;
  platform?: string;
  error?: string | null;
}

interface HealthData {
  status: string;
  queue: number;
  integrations: {
    clickup: boolean;
    claude: boolean;
    instagram: boolean;
    youtube: boolean;
    linkedin: boolean;
  };
}

interface Stats {
  totalToday: number;
  successRate: number;
  byType: Record<string, number>;
  byAgent: Record<string, number>;
  byPlatform: Record<string, number>;
}

// ── Configs visuais ───────────────────────────────────────────────────────────

const EVENT_CONFIG: Record<string, { icon: string; label: string; color: string; dot: string }> = {
  new_lead:           { icon: '🆕', label: 'Novo Lead',          color: 'text-blue-400',   dot: 'bg-blue-400' },
  lead_sql:           { icon: '🎯', label: 'Lead → SQL',          color: 'text-indigo-400', dot: 'bg-indigo-400' },
  deal_won:           { icon: '🏆', label: 'Deal Ganho',          color: 'text-emerald-400', dot: 'bg-emerald-400' },
  new_ticket:         { icon: '🎫', label: 'Ticket Suporte',      color: 'text-amber-400',  dot: 'bg-amber-400' },
  editorial_approved: { icon: '✅', label: 'Conteúdo Aprovado',   color: 'text-purple-400', dot: 'bg-purple-400' },
  posted_instagram:   { icon: '📸', label: 'Publicado Instagram', color: 'text-pink-400',   dot: 'bg-pink-400' },
  posted_youtube:     { icon: '▶️', label: 'Publicado YouTube',   color: 'text-red-400',    dot: 'bg-red-400' },
  posted_linkedin:    { icon: '💼', label: 'Publicado LinkedIn',  color: 'text-sky-400',    dot: 'bg-sky-400' },
};

const AGENT_CONFIG: Record<string, { icon: string; label: string; color: string; ring: string }> = {
  SDR:                  { icon: '🆕', label: 'SDR',          color: 'text-blue-400',    ring: 'ring-blue-500/30' },
  CLOSER:               { icon: '🎯', label: 'Closer',       color: 'text-indigo-400',  ring: 'ring-indigo-500/30' },
  CS_ONBOARDING:        { icon: '🏆', label: 'CS Onboarding', color: 'text-emerald-400', ring: 'ring-emerald-500/30' },
  CS_SUPORTE:           { icon: '🎫', label: 'Suporte N1',   color: 'text-amber-400',   ring: 'ring-amber-500/30' },
  MARKETING_EDITORIAL:  { icon: '📱', label: 'Marketing',    color: 'text-purple-400',  ring: 'ring-purple-500/30' },
};

const INTEGRATION_CONFIG = [
  { key: 'clickup',   label: 'ClickUp',   icon: '🟣', activeColor: 'text-violet-300', activeBg: 'bg-violet-500/10 border-violet-500/20' },
  { key: 'claude',    label: 'Claude AI', icon: '🤖', activeColor: 'text-orange-300', activeBg: 'bg-orange-500/10 border-orange-500/20' },
  { key: 'instagram', label: 'Instagram', icon: '📸', activeColor: 'text-pink-300',   activeBg: 'bg-pink-500/10 border-pink-500/20' },
  { key: 'youtube',   label: 'YouTube',   icon: '▶️', activeColor: 'text-red-300',    activeBg: 'bg-red-500/10 border-red-500/20' },
  { key: 'linkedin',  label: 'LinkedIn',  icon: '💼', activeColor: 'text-sky-300',    activeBg: 'bg-sky-500/10 border-sky-500/20' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
  return formatTime(iso);
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function AutomationHub() {
  const [events, setEvents] = useState<AutomationEvent[]>([]);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0); // força re-render para timeAgo

  const fetchData = useCallback(async () => {
    try {
      const [healthRes, eventsRes, statsRes] = await Promise.allSettled([
        fetch(`${WEBHOOK_URL}/health`),
        fetch(`${WEBHOOK_URL}/events?limit=40`),
        fetch(`${WEBHOOK_URL}/stats`),
      ]);

      if (healthRes.status === 'fulfilled' && healthRes.value.ok) {
        const data = await healthRes.value.json();
        setHealth(data);
        setIsOnline(data.status === 'ok');
      } else {
        setIsOnline(false);
      }

      if (eventsRes.status === 'fulfilled' && eventsRes.value.ok) {
        setEvents(await eventsRes.value.json());
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        setStats(await statsRes.value.json());
      }

      setLastUpdate(new Date());
      setIsLoading(false);
    } catch {
      setIsOnline(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const poll = setInterval(fetchData, 5000);
    const tickInterval = setInterval(() => setTick(t => t + 1), 30000);
    return () => { clearInterval(poll); clearInterval(tickInterval); };
  }, [fetchData]);

  const integrations = health?.integrations ?? {
    clickup: false, claude: false, instagram: false, youtube: false, linkedin: false,
  };

  const activeAgents = Object.keys(AGENT_CONFIG).length;
  const totalActions = stats ? Object.values(stats.byAgent).reduce((s, n) => s + n, 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d0d1a] to-[#0a0a0f] text-white p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <span className="text-yellow-400">⚡</span>
            Automation Hub
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            ClickUp → Claude Agents → Redes Sociais — tempo real
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-gray-600 hidden sm:block">
              atualizado {formatTime(lastUpdate.toISOString())}
            </span>
          )}
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="Atualizar agora"
          >
            <RefreshCw size={14} />
          </button>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isOnline
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {isOnline ? 'Live' : 'Offline'}
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Eventos hoje',
            value: isLoading ? '—' : String(stats?.totalToday ?? 0),
            sub: 'disparos processados',
            icon: <Activity size={18} className="text-blue-400" />,
            glow: 'from-blue-500/10 to-transparent',
            border: 'border-blue-500/20',
          },
          {
            label: 'Taxa de sucesso',
            value: isLoading ? '—' : `${stats?.successRate ?? 100}%`,
            sub: 'sem erros',
            icon: <CheckCircle2 size={18} className="text-emerald-400" />,
            glow: 'from-emerald-500/10 to-transparent',
            border: 'border-emerald-500/20',
          },
          {
            label: 'Na fila',
            value: isLoading ? '—' : String(health?.queue ?? 0),
            sub: health?.queue ? 'processando...' : 'fila limpa',
            icon: <Clock size={18} className="text-amber-400" />,
            glow: 'from-amber-500/10 to-transparent',
            border: 'border-amber-500/20',
          },
          {
            label: 'Ações dos agentes',
            value: isLoading ? '—' : String(totalActions),
            sub: `${activeAgents} agentes ativos`,
            icon: <Bot size={18} className="text-purple-400" />,
            glow: 'from-purple-500/10 to-transparent',
            border: 'border-purple-500/20',
          },
        ].map(card => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl bg-white/[0.03] border ${card.border} backdrop-blur-xl p-5`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.glow} pointer-events-none`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-medium">{card.label}</span>
                {card.icon}
              </div>
              <div className="text-3xl font-bold tracking-tight">{card.value}</div>
              <div className="text-xs text-gray-600 mt-1">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Integrações ── */}
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Integrações</h2>
        <div className="flex flex-wrap gap-2.5">
          {INTEGRATION_CONFIG.map(({ key, label, icon, activeColor, activeBg }) => {
            const active = integrations[key as keyof typeof integrations];
            return (
              <div
                key={key}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all ${
                  active
                    ? `${activeBg} ${activeColor}`
                    : 'bg-white/5 border-white/10 text-gray-600'
                }`}
              >
                <span>{icon}</span>
                <span className="font-medium">{label}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-current animate-pulse' : 'bg-gray-700'}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Feed + Agentes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Feed em tempo real */}
        <div className="lg:col-span-2 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Feed em Tempo Real
            </h2>
            {events.length > 0 && (
              <span className="text-xs text-gray-600">{events.length} eventos</span>
            )}
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center py-16 text-gray-600">
              <RefreshCw size={18} className="animate-spin mr-2" />
              Conectando ao servidor...
            </div>
          ) : !isOnline ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-600">
              <AlertCircle size={28} className="mb-3 text-red-500/40" />
              <p className="text-sm font-medium text-gray-500">Servidor offline</p>
              <p className="text-xs mt-1 text-gray-700">
                Inicie o webhook server e configure as variáveis de ambiente
              </p>
              <a
                href={`${WEBHOOK_URL}/health`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1 transition-colors"
              >
                Verificar {WEBHOOK_URL}/health <ExternalLink size={10} />
              </a>
            </div>
          ) : events.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-600">
              <Zap size={28} className="mb-3 opacity-20" />
              <p className="text-sm">Aguardando eventos do ClickUp...</p>
              <p className="text-xs mt-1 text-gray-700">Mova uma task ou crie um lead para ver a mágica acontecer</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
              {events.map(event => {
                const cfg = EVENT_CONFIG[event.type] ?? { icon: '📌', label: event.type, color: 'text-gray-400', dot: 'bg-gray-400' };
                return (
                  <div
                    key={event.id}
                    className={`group flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      event.error
                        ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/8'
                        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10'
                    }`}
                  >
                    <span className="text-base flex-shrink-0 mt-0.5">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                        {event.agent && (
                          <span className="text-xs bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded-full text-gray-400">
                            {AGENT_CONFIG[event.agent]?.icon} {AGENT_CONFIG[event.agent]?.label ?? event.agent}
                          </span>
                        )}
                        {event.error && (
                          <span className="text-xs bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full text-red-400">
                            erro
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                        {event.error || event.result || '—'}
                      </p>
                      {event.taskId && (
                        <p className="text-xs text-gray-700 mt-0.5 font-mono">
                          #{event.taskId}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-700 flex-shrink-0 group-hover:text-gray-500 transition-colors" suppressHydrationWarning>
                      {timeAgo(event.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Painel de agentes */}
        <div className="space-y-4">

          {/* Agentes */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Agentes Claude</h2>
            <div className="space-y-2.5">
              {Object.entries(AGENT_CONFIG).map(([key, cfg]) => {
                const count = stats?.byAgent?.[key] ?? 0;
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] ring-1 ${cfg.ring} transition-all hover:bg-white/[0.06]`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{cfg.icon}</span>
                      <div>
                        <div className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</div>
                        <div className="text-xs text-gray-600">Claude AI</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{count}</div>
                      <div className="text-xs text-gray-600">ações</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribuição por tipo */}
          {stats && Object.keys(stats.byType).length > 0 && (
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Distribuição</h2>
              <div className="space-y-2.5">
                {Object.entries(stats.byType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const cfg = EVENT_CONFIG[type];
                    if (!cfg) return null;
                    const pct = Math.round((count / (stats.totalToday || 1)) * 100);
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400 truncate flex items-center gap-1">
                            <span>{cfg.icon}</span> {cfg.label}
                          </span>
                          <span className="text-gray-500 flex-shrink-0 ml-2">{count}</span>
                        </div>
                        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-500/60 to-purple-400/40 transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between text-xs text-gray-700 pt-2">
        <span>SPFP Webhook Server v1.0.0</span>
        <a
          href={`${WEBHOOK_URL}/health`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-gray-500 transition-colors"
        >
          health check <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}
