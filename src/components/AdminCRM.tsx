
import React, { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { Users, Search, Eye, Clock, User, Mail, Database, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface ClientEntry {
    user_id: string;
    content: any;
    last_updated: number;
}

/**
 * Admin CRM component.
 * Provides administrative tools for user management and platform monitoring.
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
                setError("Não foi possível carregar a lista de clientes. Verifique se as políticas de RLS no Supabase foram configuradas corretamente.");
            } finally {
                setLoading(false);
            }
        };

        getClients();
    }, [fetchAllUserData]);

    const filteredClients = clients.filter(c => {
        const profile = c.content.userProfile || {};
        const name = (profile.name || '').toLowerCase();
        const email = (profile.email || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return name.includes(term) || email.includes(term);
    });

    const formatDate = (timestamp: number) => {
        if (!timestamp) return 'Nunca';
        return new Date(timestamp).toLocaleString('pt-BR');
    };

    const calculateBalance = (content: any) => {
        if (!content.accounts) return 0;
        return content.accounts.reduce((acc: number, curr: any) => acc + (curr.balance || 0), 0);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                <p className="mt-4 text-gray-400 font-medium">Carregando painel de controle...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-full mx-auto pb-20 p-4 md:p-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Clientes</h1>
                    <div className="flex space-x-6 text-sm">
                        <span className="text-white font-bold border-b-2 border-accent pb-1">Clientes ativos <span className="ml-1 text-accent">{clients.length}</span></span>
                        <span className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">Clientes de Demonstração</span>
                        <span className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">Cliente próprio</span>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="px-4 py-2 border border-white/10 rounded-lg text-white text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors">Ativos</button>
                    <button className="px-4 py-2 border border-white/10 rounded-lg text-gray-500 text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors">Inativos</button>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-start">
                    <AlertCircle size={20} className="mr-3 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-sm">Erro de Permissão</p>
                        <p className="text-xs opacity-80">{error}</p>
                    </div>
                </div>
            )}

            {/* Barra de Busca */}
            <div className="bg-white/5 p-4 rounded-t-3xl border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center bg-black/40 px-4 py-2 rounded-xl border border-white/10 w-full max-w-md focus-within:border-accent transition-colors">
                    <Search className="text-gray-500 mr-3" size={18} />
                    <input
                        type="text"
                        placeholder="Busque pelo nome do cliente"
                        className="bg-transparent border-none outline-none w-full text-white placeholder-gray-600 font-medium text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                    <span className="mr-2">Filtro</span>
                    {/* Placeholder for filter icon */}
                </div>
            </div>

            {/* Lista de Clientes - Table */}
            <div className="bg-white/5 rounded-b-3xl shadow-xl overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-gray-500">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest pl-10">Nome</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">E-mail</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Origem</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Patrimônio</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredClients.map((client) => {
                                const profile = client.content.userProfile || {};
                                const totalBalance = calculateBalance(client.content);

                                return (
                                    <tr key={client.user_id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center">
                                                {/* Status Indicator Dots (Mockup) */}
                                                <div className="flex space-x-1 mr-4">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                                </div>

                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-gray-400 font-bold overflow-hidden border border-white/10 mr-3 text-xs">
                                                        {profile.avatar ? (
                                                            <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={14} />
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-white group-hover:text-accent transition-colors">{profile.name || 'Usuário Sem Nome'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-400">
                                            {profile.email || 'Email não disponível'}
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-500">
                                            Networking Planejador /
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className={`text-sm font-bold ${totalBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => loadClientData(client.user_id)}
                                                disabled={isSyncing}
                                                className="text-gray-500 hover:text-white transition-colors"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredClients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <Database className="text-gray-800 mb-4" size={60} />
                                            <p className="text-gray-500 font-medium">Nenhum cliente encontrado.</p>
                                            <button onClick={() => setSearchTerm('')} className="text-accent text-sm font-bold mt-2 hover:underline">Limpar busca</button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

