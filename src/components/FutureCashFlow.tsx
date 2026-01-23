import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { calculateProjection } from '../services/projectionService';
import { formatCurrency, getMonthName } from '../utils';
import {
    TrendingUp, TrendingDown, Target, AlertTriangle,
    Calendar, ArrowRight, Zap, Info
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid
} from 'recharts';

export const FutureCashFlow: React.FC = () => {
    const { totalBalance, transactions, categoryBudgets } = useFinance();

    const projection = useMemo(() => {
        return calculateProjection(totalBalance, transactions, categoryBudgets, 12);
    }, [totalBalance, transactions, categoryBudgets]);

    const chartData = projection.points.map(p => ({
        name: getMonthName(new Date(p.date).getMonth()).substring(0, 3) + ' ' + new Date(p.date).getFullYear().toString().substring(2),
        balance: p.balance,
        income: p.income,
        expense: p.expense,
        displayDate: new Date(p.date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    }));

    const isCritical = projection.summary.lowestBalance < 0;

    return (
        <div className="p-4 md:p-8 animate-fade-in pb-32 space-y-8 bg-black/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-2">Projeção de Fluxo de Caixa</h1>
                    <p className="text-gray-400 font-light">Previsão estratégica baseada em tendências e orçamentos</p>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                    <Zap size={16} className="text-blue-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">IA Alpha Projection</span>
                </div>
            </div>

            {/* Primary Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ProjectionCard
                    label="Saldo Final (12m)"
                    value={projection.summary.finalBalance}
                    icon={<TrendingUp size={24} />}
                    color="bg-emerald-500/10 text-emerald-400"
                    subtitle="Estimativa Dez/2026"
                />
                <ProjectionCard
                    label="Menor Saldo Previsto"
                    value={projection.summary.lowestBalance}
                    icon={<ArrowRight size={24} />}
                    color={isCritical ? "bg-rose-500/10 text-rose-400" : "bg-blue-500/10 text-blue-400"}
                    subtitle={isCritical ? "Alerta de Liquidez" : "Ponto de atenção"}
                />
                <ProjectionCard
                    label="Maior Saldo Previsto"
                    value={projection.summary.peakBalance}
                    icon={<Zap size={24} />}
                    color="bg-amber-500/10 text-amber-400"
                    subtitle="Pico de acumulação"
                />
                <ProjectionCard
                    label="Economia Projetada"
                    value={projection.summary.projectedSavings}
                    icon={<Target size={24} />}
                    color="bg-indigo-500/10 text-indigo-400"
                    subtitle="Delta anual esperado"
                />
            </div>

            {/* Main Chart Section */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                    <TrendingUp size={200} />
                </div>

                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-serif font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Calendar size={20} className="text-blue-400" />
                        </div>
                        Trajetória Patrimonial (12 Meses)
                    </h3>

                    <div className="flex gap-6 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saldo Previsto</span>
                        </div>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 600 }}
                                dy={15}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#6b7280' }}
                                tickFormatter={(v) => `R$ ${v / 1000}k`}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ stroke: '#ffffff10', strokeWidth: 2 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="balance"
                                stroke="#3b82f6"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorBalance)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recommendations / Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
                    <h3 className="text-xl font-serif font-bold text-white flex items-center gap-3 mb-6">
                        <Info size={24} className="text-indigo-400" />
                        Análise de Tendência
                    </h3>
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                                <AlertTriangle size={24} className="text-amber-500" />
                            </div>
                            <div>
                                <p className="text-white font-bold mb-1">Ponto de Atenção em 4 Meses</p>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Sua projeção indica uma redução de liquidez significativa. Considere revisar seus orçamentos variáveis para garantir que o saldo não atinja níveis críticos.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <TrendingUp size={24} className="text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-white font-bold mb-1">Crescimento Sustentável</p>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Mantendo a média de gastos atual, seu patrimônio deve crescer {((projection.summary.projectedSavings / totalBalance) * 100).toFixed(1)}% nos próximos 12 meses.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-serif font-bold text-white mb-4">Meta de Acumulação</h3>
                        <p className="text-gray-400 text-sm mb-6">Projeção estimada para sua reserva de liberdade financeira.</p>

                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                <span className="text-gray-500">Progresso Esperado</span>
                                <span className="text-blue-400">82%</span>
                            </div>
                            <div className="h-4 w-full bg-white/5 rounded-full p-1 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: '82%' }}></div>
                            </div>
                        </div>
                    </div>

                    <button className="mt-8 w-full py-4 bg-white text-black font-bold rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors">
                        Ajustar Parâmetros
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProjectionCard: React.FC<{ label: string; value: number; icon: any; color: string; subtitle: string }> = ({ label, value, icon, color, subtitle }) => (
    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md relative overflow-hidden group transition-all hover:bg-white/[0.08]">
        <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full ${color.split(' ')[0]} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
        <div className="flex flex-col h-full justify-between gap-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shrink-0 shadow-lg`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-500 font-light mb-1">{label}</p>
                <p className={`text-2xl font-bold tracking-tight ${value < 0 ? 'text-rose-400' : 'text-white'}`}>
                    {formatCurrency(value)}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{subtitle}</p>
            </div>
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/90 border border-white/10 p-4 rounded-2xl backdrop-blur-xl shadow-2xl">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">{label}</p>
                <p className="text-white font-bold text-lg mb-1">{formatCurrency(payload[0].value)}</p>
                <div className="flex gap-4 border-t border-white/5 pt-2 mt-2">
                    <div>
                        <p className="text-[8px] text-emerald-400 font-bold uppercase">Prev. Receita</p>
                        <p className="text-xs text-white">{formatCurrency(payload[0].payload.income)}</p>
                    </div>
                    <div>
                        <p className="text-[8px] text-rose-400 font-bold uppercase">Prev. Gasto</p>
                        <p className="text-xs text-white">{formatCurrency(payload[0].payload.expense)}</p>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};
