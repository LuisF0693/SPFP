import React, { useEffect, useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import {
    Users, Search, Eye, Clock, User, Mail, Database,
    ArrowRight, ShieldCheck, AlertCircle, TrendingUp,
    Activity, Zap, Shield, UserCheck, Inbox
} from 'lucide-react';

interface ClientEntry {
    user_id: string;
    content: any;
    last_updated: number;
}

/**
 * Admin CRM component.
 * Provides administrative tools for user management and platform monitoring.
 * Redesigned for an agentic experience with predictive health scores.
 */
export const AdminCRM: React.FC = () => {
    const { fetchAllUserData, loadClientData, isSyncing } = useFinance();
    const { user } = useAuth();
    const [clients, setClients] = useState<ClientEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

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

    // Health Score Logic (Proprietary Algorithm)
    const calculateHealthScore = (client: ClientEntry) => {
        const now = Date.now();
        const diffDays = Math.floor((now - client.last_updated) / (1000 * 60 * 60 * 24));

        let score = 100;

        // Decay based on inactivity
        if (diffDays > 30) score -= 60;
        else if (diffDays > 15) score -= 30;
        else if (diffDays > 7) score -= 15;

        // Bonus for data completeness
        const content = client.content || {};
        if (content.accounts?.length > 0) score += 5;
        if (content.transactions?.length > 50) score += 5;
        if (content.goals?.length > 0) score += 5;

        return Math.min(100, Math.max(0, score));
    };

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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="px-2 py-1 bg-accent/10 border border-accent/20 rounded text-[10px] font-bold text-accent uppercase tracking-widest">
                            Admin Centric
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">CRM <span className="text-accent">Agentico</span></h1>
                    <p className="text-gray-500 mt-2 max-w-md font-medium">
                        Gestão proativa de clientes com análise preditiva de engajamento e saúde patrimonial.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
                    <div className="glass p-4 rounded-2xl border border-white/5 flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Sob Gestão</span>
                        <span className="text-xl font-bold text-emerald-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(clientStats.totalAUM)}
                        </span>
                    </div>
                    <div className="glass p-4 rounded-2xl border border-white/5 flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Ativos Hoje</span>
                        <span className="text-xl font-bold text-blue-400">{clientStats.activeToday}</span>
                    </div>
                    <div className="glass p-4 rounded-2xl border border-white/5 flex flex-col col-span-2 md:col-span-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Alertas Criticos</span>
                        <span className={`text-xl font-bold ${clientStats.atRisk > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {clientStats.atRisk}
                        </span>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-gray-500 group-focus-within:text-accent transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, CPF ou e-mail..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-accent/50 focus:bg-white/10 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex space-x-2">
                    <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold text-sm transition-all flex items-center">
                        <Inbox className="mr-2" size={18} />
                        Filtros
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
                            className="glass rounded-3xl border border-white/10 overflow-hidden group hover:border-accent/30 transition-all duration-500 animate-slide-up relative flex flex-col"
                        >
                            {/* Card Header */}
                            <div className="p-6 pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center">
                                        <div className="relative">
                                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-gray-500 overflow-hidden">
                                                {profile.avatar ? (
                                                    <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={24} />
                                                )}
                                            </div>
                                            {isNew && (
                                                <div className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full border-2 border-[#0F172A] animate-pulse"></div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors leading-tight truncate w-40">
                                                {profile.name || 'Sem Nome'}
                                            </h3>
                                            <p className="text-xs text-gray-500 truncate w-44">{profile.email}</p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-xl ${health.bg} ${health.color} border border-white/5 flex items-center text-[10px] font-black uppercase tracking-widest`}>
                                        <health.icon size={12} className="mr-1.5" />
                                        {health.label}
                                    </div>
                                </div>

                                {/* Quick Metrics */}
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Patrimônio</span>
                                        <span className="text-sm font-bold text-white leading-none mt-1">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                                (client.content.accounts || []).reduce((a: number, curr: any) => a + (curr.balance || 0), 0)
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Score</span>
                                        <div className="flex items-center justify-end mt-1">
                                            <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden mr-2">
                                                <div
                                                    className={`h-full ${score > 70 ? 'bg-emerald-400' : score > 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                                                    style={{ width: `${score}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-black text-white">{score}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="mt-auto border-t border-white/5 p-4 bg-black/20 flex items-center justify-between">
                                <div className="flex items-center text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                    <Clock size={12} className="mr-1.5" />
                                    {isNew ? 'Ativo Agora' : lastActive.toLocaleDateString()}
                                </div>
                                <button
                                    onClick={() => loadClientData(client.user_id)}
                                    disabled={isSyncing}
                                    className="p-2.5 bg-accent text-white rounded-xl shadow-lg shadow-accent/20 hover:scale-110 active:scale-95 transition-all"
                                    title="Acessar Dashboard do Cliente"
                                >
                                    <ArrowRight size={18} />
                                </button>
                            </div>
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
        </div>
    );
};

