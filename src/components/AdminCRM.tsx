import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { AIConfig } from '../types';
import {
    Users, Search, Eye, Clock, User, Mail, Database,
    ArrowRight, ShieldCheck, AlertCircle, TrendingUp,
    Activity, Zap, Shield, UserCheck, Inbox, Sparkles,
    Loader2
} from 'lucide-react';
import { chatWithAI } from '../services/aiService';
import { getInteractionLogs, InteractionLog } from '../services/logService';
import { calculateHealthScore, ClientEntry } from '../utils/crmUtils';
import { Modal } from './ui/Modal';

/**
 * Admin CRM component.
 * Provides administrative tools for user management and platform monitoring.
 * Redesigned for an agentic experience with predictive health scores.
 */
export const AdminCRM: React.FC = () => {
    const { fetchAllUserData, loadClientData, isSyncing, userProfile, isImpersonating } = useFinance();
    const { user } = useAuth();
    const [clients, setClients] = useState<ClientEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Briefing state
    const [briefings, setBriefings] = useState<Record<string, string>>({});
    const [loadingBriefing, setLoadingBriefing] = useState<string | null>(null);

    // Timeline state
    const [showTimeline, setShowTimeline] = useState<string | null>(null);
    const [timelineLogs, setTimelineLogs] = useState<InteractionLog[]>([]);
    const [loadingTimeline, setLoadingTimeline] = useState(false);

    const handleFetchTimeline = async (clientId: string) => {
        setShowTimeline(clientId);
        setLoadingTimeline(true);
        try {
            const { data, error } = await getInteractionLogs(clientId);
            if (data) setTimelineLogs(data);
            if (error) console.error(error);
        } finally {
            setLoadingTimeline(false);
        }
    };

    const handleGenerateBriefing = async (client: ClientEntry) => {
        if (briefings[client.user_id] || loadingBriefing) return;

        // Try to get API Key from aiConfig first, then legacy fields
        const aiConfig = userProfile?.aiConfig;
        const apiKey = aiConfig?.apiKey || userProfile?.geminiToken || userProfile?.apiToken;
        const provider = aiConfig?.provider || 'google';

        if (!apiKey) {
            alert("Chave de API não configurada. Vá em 'Perfil/Configurações' e adicione sua chave Gemini.");
            return;
        }

        setLoadingBriefing(client.user_id);
        try {
            const content = client.content || {};
            // Robust data extraction with fallbacks
            const relevantData = {
                accounts: (content.accounts || []).slice(0, 10).map((a: any) => ({ name: a.name, balance: a.balance })),
                recentTransactions: (content.transactions || []).slice(0, 15).map((t: any) => ({ category: t.category, value: t.value, type: t.type, date: t.date })),
                goals: (content.goals || []).slice(0, 5).map((g: any) => ({ title: g.title, target: g.targetValue, current: g.currentValue }))
            };

            const prompt = `Analise os dados financeiros deste cliente e retorne APENAS 3 bullet points curtos (máximo 15 palavras cada) em Markdown sobre:
(1) Principal categoria de gastos/movimentação recente.
(2) Tendência de saúde do patrimônio.
(3) Um alerta ou oportunidade estratégica imediata para o planejador.

Dados do Cliente: ${JSON.stringify(relevantData)}`;

            const response = await chatWithAI(
                [{ role: 'system', content: 'Você é um Analista de CRM Agentico de elite. Seja conciso e direto.' }, { role: 'user', content: prompt }],
                { provider: provider as AIConfig['provider'], apiKey: apiKey, model: aiConfig?.model }
            );

            setBriefings(prev => ({ ...prev, [client.user_id]: response.text }));
        } catch (err: any) {
            console.error("Erro detalhado ao gerar briefing:", err);
            const errorMsg = err.message || "Erro desconhecido na conexão com a IA.";
            alert(`Falha ao conectar com a IA: ${errorMsg}`);
        } finally {
            setLoadingBriefing(null);
        }
    };

    useEffect(() => {
        const getClients = async () => {
            try {
                setLoading(true);
                const data = await fetchAllUserData();
                setClients(data);
                setError(null);
            } catch (err: any) {
                console.error("Error fetching clients:", err);
                setError("Não foi possível carregar a lista de clientes. Verifique as políticas de RLS.");
            } finally {
                setLoading(false);
            }
        };

        getClients();
    }, [fetchAllUserData]);


    const getHealthStatus = (score: number) => {
        if (score >= 80) return { label: 'Saudável', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: ShieldCheck };
        if (score >= 50) return { label: 'Atenção', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Activity };
        return { label: 'Risco', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertCircle };
    };

    const clientStats = useMemo(() => {
        const totalPatrimony = clients.reduce((acc, c) => {
            const accounts = c.content.accounts || [];
            return acc + accounts.reduce((a: number, curr: any) => a + (curr.balance || 0), 0);
        }, 0);

        const activeToday = clients.filter(c => {
            const diff = Date.now() - c.last_updated;
            return diff < (1000 * 60 * 60 * 24);
        }).length;

        return {
            totalAUM: totalPatrimony,
            activeToday,
            atRisk: clients.filter(c => calculateHealthScore(c) < 50).length
        };
    }, [clients]);

    const filteredClients = clients.filter(c => {
        const profile = c.content.userProfile || {};
        const name = (profile.name || '').toLowerCase();
        const email = (profile.email || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return name.includes(term) || email.includes(term);
    }).sort((a, b) => b.last_updated - a.last_updated);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-t-2 border-accent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="text-accent animate-pulse" size={24} />
                    </div>
                </div>
                <p className="mt-4 text-gray-400 font-medium animate-pulse">Sincronizando Inteligência CRM...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-7xl mx-auto pb-20 p-4 space-y-8">
            {/* Admin Header & Vision */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-4">
                <div className="relative">
                    <div className="absolute -left-20 -top-20 w-64 h-64 bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-black text-accent uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.3)] backdrop-blur-sm">
                            Admin Centric
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">
                        CRM <span className="text-accent">Agentico</span>
                    </h1>
                    <p className="text-gray-400 mt-3 max-w-lg text-lg font-medium leading-relaxed">
                        Gestão proativa com inteligência preditiva e análise em tempo real.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full md:w-auto z-10">
                    <div className="glass p-5 rounded-2xl flex flex-col items-start card-hover-premium group">
                        <div className="mb-3 p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                            <Database size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Sob Gestão</span>
                        <span className="text-2xl font-black text-emerald-400 tracking-tight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(clientStats.totalAUM)}
                        </span>
                    </div>
                    <div className="glass p-5 rounded-2xl flex flex-col items-start card-hover-premium group">
                        <div className="mb-3 p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                            <UserCheck size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ativos Hoje</span>
                        <span className="text-2xl font-black text-blue-400 tracking-tight">{clientStats.activeToday}</span>
                    </div>
                    <div className="glass p-5 rounded-2xl flex flex-col items-start card-hover-premium group col-span-2 lg:col-span-1">
                        <div className={`mb-3 p-2 rounded-xl transition-colors ${clientStats.atRisk > 0 ? 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20' : 'bg-gray-500/10 text-gray-400'}`}>
                            <AlertCircle size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Alertas Críticos</span>
                        <span className={`text-2xl font-black tracking-tight ${clientStats.atRisk > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {clientStats.atRisk}
                        </span>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 sticky top-4 z-40">
                <div className="flex-1 relative group glass rounded-2xl shadow-lg shadow-black/20">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-gray-500 group-focus-within:text-accent transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, CPF ou e-mail..."
                        className="w-full bg-transparent border-none py-4 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:ring-0 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex space-x-2">
                    <button className="px-6 py-3 glass hover:bg-white/5 rounded-2xl text-white font-bold text-sm transition-all flex items-center shadow-lg shadow-black/20 border border-white/10">
                        <Inbox className="mr-2 text-accent" size={18} />
                        Filtros
                    </button>
                    <button className="px-4 py-3 glass hover:bg-white/5 rounded-2xl text-white font-bold transition-all shadow-lg border border-white/10">
                        <TrendingUp size={20} className="text-gray-400 hover:text-white" />
                    </button>
                </div>
            </div>

            {/* Client Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => {
                    const profile = client.content.userProfile || {};
                    const score = calculateHealthScore(client);
                    const health = getHealthStatus(score);
                    const lastActive = new Date(client.last_updated);
                    const isNew = (Date.now() - client.last_updated) < (1000 * 60 * 60 * 24);

                    return (
                        <div
                            key={client.user_id}
                            className="glass p-0 rounded-3xl overflow-hidden card-hover-premium group flex flex-col border border-white/5"
                        >
                            {/* Card Header */}
                            <div className="p-6 pb-4 relative">
                                <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight size={20} className="text-white/20 group-hover:text-accent transform -rotate-45 group-hover:rotate-0 transition-all duration-500" />
                                </div>

                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex items-center">
                                        <div className="relative">
                                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-gray-500 overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-500">
                                                {profile.avatar ? (
                                                    <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={28} />
                                                )}
                                            </div>
                                            {isNew && (
                                                <div className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-accent rounded-full border-[3px] border-[#0F172A] animate-pulse shadow-glow"></div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors leading-tight truncate w-48">
                                                {profile.name || 'Sem Nome'}
                                            </h3>
                                            <div className="flex items-center mt-1 space-x-2">
                                                <span className="text-xs text-gray-500 truncate max-w-[150px]">{profile.email}</span>
                                                {health.label === 'Risco' && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Health & Briefing Actions */}
                                <div className="flex items-center justify-between mb-4 bg-white/5 rounded-xl p-1.5 border border-white/5">
                                    <div className={`px-3 py-1.5 rounded-lg ${health.bg} ${health.color} flex items-center text-[10px] font-black uppercase tracking-widest`}>
                                        <health.icon size={12} className="mr-1.5" />
                                        {health.label}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => handleGenerateBriefing(client)}
                                            disabled={loadingBriefing === client.user_id}
                                            className={`p-2 rounded-lg transition-all ${briefings[client.user_id] ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`}
                                            title="Gerar Briefing IA"
                                        >
                                            {loadingBriefing === client.user_id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                        </button>
                                        <button
                                            onClick={() => handleFetchTimeline(client.user_id)}
                                            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                                            title="Ver Timeline"
                                        >
                                            <Clock size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Briefing Display */}
                                {briefings[client.user_id] && (
                                    <div className="mb-5 p-4 bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-xl text-xs text-gray-300 animate-slide-up relative overflow-hidden">
                                        <div className="space-y-2 relative z-10">
                                            {briefings[client.user_id].split('\n').filter(l => l.trim()).map((line, i) => (
                                                <div key={i} className="flex items-start">
                                                    <div className="min-w-[4px] h-[4px] rounded-full bg-accent mt-1.5 mr-2"></div>
                                                    <span className="leading-relaxed font-medium">{line.replace(/^[*-]\s*/, '')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 gap-3 pb-2">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Patrimônio</span>
                                        <span className="text-sm font-bold text-white">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(
                                                (client.content.accounts || []).reduce((a: number, curr: any) => a + (curr.balance || 0), 0)
                                            )}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-center">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Score</span>
                                            <span className="text-xs font-black text-white">{score}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-700/50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${score > 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-300' : score > 40 ? 'bg-gradient-to-r from-amber-500 to-amber-300' : 'bg-gradient-to-r from-red-500 to-red-300'}`}
                                                style={{ width: `${score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <button
                                onClick={() => loadClientData(client.user_id)}
                                disabled={isSyncing}
                                className="mt-auto w-full py-3 bg-white/5 hover:bg-accent hover:text-white border-t border-white/5 text-xs font-bold text-gray-400 uppercase tracking-widest transition-all flex items-center justify-center group/btn"
                            >
                                Acessar Conta
                                <ArrowRight size={14} className="ml-2 transform group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    );
                })}

                {filteredClients.length === 0 && (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center glass rounded-3xl border border-white/5">
                        <Database size={64} className="text-gray-800 mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">Nenhum cliente mapeado</h3>
                        <p className="text-gray-600">Altere os filtros de busca para encontrar mais registros.</p>
                        <button onClick={() => setSearchTerm('')} className="mt-4 text-accent font-bold hover:underline">Limpar Pesquisa</button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={!!showTimeline}
                onClose={() => setShowTimeline(null)}
                title="Timeline de Interação"
                size="lg"
                variant="dark"
            >
                <p className="text-xs text-gray-500 mb-4">Histórico de acessos e alterações</p>
                <div className="max-h-[60vh] overflow-y-auto space-y-4">
                    {loadingTimeline ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                        </div>
                    ) : timelineLogs.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Nenhuma interação registrada ainda.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                            {timelineLogs.map((log, i) => (
                                <div key={log.id || i} className="relative pl-8">
                                    <div className={`absolute left-0 top-1.5 h-6 w-6 rounded-full border-2 border-[#0F172A] flex items-center justify-center ${log.action_type === 'ACCESS' ? 'bg-blue-500' : 'bg-amber-500'}`}>
                                        {log.action_type === 'ACCESS' ? <Eye size={10} className="text-white" /> : <Zap size={10} className="text-white" />}
                                    </div>
                                    <div className="glass p-3 rounded-2xl border border-white/5">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${log.action_type === 'ACCESS' ? 'text-blue-400' : 'text-amber-400'}`}>
                                                {log.action_type === 'ACCESS' ? 'Acesso' : 'Alteração'}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-medium">
                                                {new Date(log.created_at || '').toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-300">{log.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

