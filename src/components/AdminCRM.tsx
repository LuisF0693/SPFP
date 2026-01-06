import React, { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { Users, Search, Eye, Clock, User, Mail, Database, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface ClientEntry {
    user_id: string;
    content: any;
    last_updated: number;
}

const AdminCRM: React.FC = () => {
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
                <p className="mt-4 text-gray-500 font-medium">Carregando painel de controle...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in max-w-6xl mx-auto pb-20 p-4 md:p-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-accent mb-1">
                        <ShieldCheck size={20} />
                        <span className="text-xs font-bold uppercase tracking-widest">Acesso Administrador</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciamento de Clientes</h1>
                    <p className="text-gray-500 dark:text-gray-400">Visualize e acompanhe a saúde financeira de todos os usuários da plataforma.</p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl px-4 py-3 flex items-center">
                    <div className="mr-4 text-right hidden sm:block">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Total de Usuários</p>
                        <p className="text-xl font-bold text-accent">{clients.length}</p>
                    </div>
                    <div className="bg-accent/20 p-2 rounded-xl">
                        <Users className="text-accent" size={24} />
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-start">
                    <AlertCircle size={20} className="mr-3 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-sm">Erro de Permissão</p>
                        <p className="text-xs opacity-80">{error}</p>
                    </div>
                </div>
            )}

            {/* Barra de Busca */}
            <div className="bg-white dark:bg-black p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-900 mb-6 flex items-center group transition-colors focus-within:border-accent">
                <Search className="text-gray-400 group-focus-within:text-accent transition-colors mr-3" size={20} />
                <input
                    type="text"
                    placeholder="Buscar cliente por nome ou e-mail..."
                    className="bg-transparent border-none outline-none w-full text-gray-900 dark:text-white placeholder-gray-500 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Lista de Clientes */}
            <div className="bg-white dark:bg-black rounded-3xl shadow-xl border border-gray-100 dark:border-gray-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-900">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Patrimônio</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Última Sincronização</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                            {filteredClients.map((client) => {
                                const profile = client.content.userProfile || {};
                                const totalBalance = calculateBalance(client.content);

                                return (
                                    <tr key={client.user_id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold overflow-hidden border border-gray-200 dark:border-gray-800 mr-3">
                                                    {profile.avatar ? (
                                                        <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={18} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{profile.name || 'Usuário Sem Nome'}</p>
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <Mail size={12} className="mr-1" />
                                                        {profile.email || 'Email não disponível'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 hidden md:table-cell">
                                            <span className={`text-sm font-bold ${totalBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBalance)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 hidden lg:table-cell">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Clock size={14} className="mr-1.5" />
                                                {formatDate(client.last_updated)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => loadClientData(client.user_id)}
                                                disabled={isSyncing}
                                                className="inline-flex items-center px-4 py-2 bg-accent hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                                            >
                                                <Eye size={14} className="mr-2" />
                                                Ver Dados
                                                <ArrowRight size={14} className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredClients.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <Database className="text-gray-200 dark:text-gray-800 mb-4" size={60} />
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

export default AdminCRM;
