
// ... imports remain the same
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils';
import {
  ArrowUpCircle, ArrowDownCircle, Wallet, PieChart as PieIcon,
  Compass, AlertTriangle, CheckCircle, Clock, Info,
  Settings2, Eye, EyeOff, ChevronUp, ChevronDown, X, Calendar,
  TrendingUp, Target, Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Logo } from './Logo';
import { CategoryIcon } from './CategoryIcon';
import { DashboardWidget } from '../types';

import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { totalBalance, transactions, categories, accounts, userProfile, updateUserProfile } = useFinance();
  const [showTotalDetails, setShowTotalDetails] = useState(false);
  const [isEditModeOpen, setIsEditModeOpen] = useState(false);
  const [showInvestTooltip, setShowInvestTooltip] = useState(false);

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  // Lógica: Verifica se é o último dia do mês
  const isLastDayOfMonth = today.getDate() === endOfMonth.getDate();
  // const isLastDayOfMonth = true; // Debug: force true para visualizar

  // --- Lógica de Alertas de Contas ---
  const getDaysDiff = (dateString: string) => {
    const txDate = new Date(dateString);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Ajuste de timezone para garantir comparação correta de dias
    const utc1 = Date.UTC(startOfToday.getFullYear(), startOfToday.getMonth(), startOfToday.getDate());
    const utc2 = Date.UTC(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());

    return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
  };

  const processedBills = transactions
    .filter(t => t.type === 'EXPENSE')
    .map(t => ({ ...t, daysDiff: getDaysDiff(t.date) }));

  // Contas Vencidas (Últimos 10 dias para não poluir com histórico antigo)
  const overdueBills = processedBills
    .filter(t => t.daysDiff < 0 && t.daysDiff >= -10)
    .sort((a, b) => a.daysDiff - b.daysDiff); // Mais antigas primeiro

  // Próximas Contas (Hoje + 7 dias)
  const upcomingBills = processedBills
    .filter(t => t.daysDiff >= 0 && t.daysDiff <= 7)
    .sort((a, b) => a.daysDiff - b.daysDiff);

  // Filtro de transações do mês vigente (já ocorridas ou previstas)
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Gastos já realizados este mês (até hoje)
  const expenseSoFar = currentMonthTx.filter(t => t.type === 'EXPENSE' && new Date(t.date) <= today).reduce((acc, t) => acc + t.value, 0);
  // Receitas já realizadas este mês (até hoje)
  const incomeSoFar = currentMonthTx.filter(t => t.type === 'INCOME' && new Date(t.date) <= today).reduce((acc, t) => acc + t.value, 0);

  // Totais projetados do mês inteiro (passado + futuro até dia 30/31)
  const totalIncomeMonth = currentMonthTx.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.value, 0);
  const totalExpenseMonth = currentMonthTx.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.value, 0);

  // Cálculo do Saldo Real Disponível para o Fim do Mês Atual
  // Pegamos o saldo de hoje das contas (totalBalance) e projetamos apenas o que sobra DESTE mês
  const futureTxThisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d > today && d <= endOfMonth;
  });

  const futureExpensesThisMonth = futureTxThisMonth.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.value, 0);
  const futureIncomesThisMonth = futureTxThisMonth.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.value, 0);

  const monthAvailableBalance = totalBalance + futureIncomesThisMonth - futureExpensesThisMonth;

  const spendingPercentage = totalIncomeMonth > 0 ? (totalExpenseMonth / totalIncomeMonth) * 100 : (totalExpenseMonth > 0 ? 100 : 0);
  let compassMessage = 'Excelente! Você está no caminho certo.';
  let compassColor = '#10b981';

  if (spendingPercentage > 100) {
    compassMessage = 'Cuidado! Você gastou mais do que ganhou.';
    compassColor = '#ef4444';
  } else if (spendingPercentage > 85) {
    compassMessage = 'Atenção! Sua margem está muito apertada.';
    compassColor = '#f59e0b';
  }

  const needleRotation = Math.min(Math.max(spendingPercentage * 1.8, 0), 180);

  const entries = Object.entries(
    currentMonthTx.filter(t => t.type === 'EXPENSE').reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.value;
      return acc;
    }, {} as Record<string, number>)
  ) as [string, number][];

  const chartData = entries.map(([catId, value]) => {
    const cat = categories.find(c => c.id === catId);
    return { name: cat?.name || '?', value, color: cat?.color || '#ccc' };
  }).filter(item => item.value > 0);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // --- Lógica de Customização do Dashboard ---
  const layout = userProfile.dashboardLayout || [
    { id: 'upcoming_bills', visible: true },
    { id: 'balance_card', visible: true },
    { id: 'compass', visible: true },
    { id: 'spending_chart', visible: true },
    { id: 'recent_transactions', visible: true }
  ];

  const updateLayout = (newLayout: DashboardWidget[]) => {
    updateUserProfile({ ...userProfile, dashboardLayout: newLayout });
  };

  const toggleVisibility = (id: string) => {
    const nextLayout = layout.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    updateLayout(nextLayout);
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const nextLayout = [...layout];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < nextLayout.length) {
      [nextLayout[index], nextLayout[targetIndex]] = [nextLayout[targetIndex], nextLayout[index]];
      updateLayout(nextLayout);
    }
  };

  // --- Renderização de Widgets ---
  const renderWidget = (id: string) => {
    switch (id) {
      case 'upcoming_bills':
        if (upcomingBills.length === 0 && overdueBills.length === 0) return null;

        return (
          <div key={id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-slide-up col-span-1 md:col-span-2 lg:col-span-3">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gray-100 p-2 rounded-lg text-gray-700"><Calendar size={20} /></div>
              <h3 className="text-lg font-bold text-gray-800">Agenda de Pagamentos</h3>
            </div>

            {/* Seção de Contas Vencidas - PROMINENT ALERT */}
            {overdueBills.length > 0 && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="flex items-start mb-3">
                  <AlertTriangle className="text-red-500 mr-2 shrink-0 animate-pulse" size={20} />
                  <div>
                    <h4 className="font-bold text-red-500 uppercase tracking-wide text-sm">Atenção: Contas Vencidas</h4>
                    <p className="text-xs text-red-400/80">Você possui {overdueBills.length} pagamentos com data passada.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {overdueBills.map(bill => (
                    <div key={bill.id} className="bg-red-500/5 p-3 rounded-xl border border-red-500/10 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-red-100 text-sm truncate max-w-[120px]">{bill.description}</p>
                        <p className="text-xs text-red-400 font-medium">Venceu há {Math.abs(bill.daysDiff)} dias</p>
                      </div>
                      <span className="font-black text-red-500 text-sm">{formatCurrency(bill.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seção de Próximas Contas */}
            {upcomingBills.length > 0 ? (
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1 flex items-center">
                  <Clock size={12} className="mr-1" /> Próximos 7 dias
                </h4>
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x">
                  {upcomingBills.map(bill => (
                    <div key={bill.id} className="min-w-[200px] p-4 rounded-2xl border border-gray-100 bg-gray-50/50 snap-start hover:bg-white hover:border-blue-200 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bill.daysDiff === 0 ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-blue-50 text-blue-500'}`}>
                          {bill.daysDiff === 0 ? 'VENCE HOJE' : `Faltam ${bill.daysDiff} dias`}
                        </span>
                      </div>
                      <p className="font-bold text-gray-800 truncate text-sm mb-1">{bill.description}</p>
                      <p className="font-extrabold text-gray-900">{formatCurrency(bill.value)}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{formatDate(bill.date)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              overdueBills.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm italic">
                  Nenhuma conta prevista para os próximos dias.
                </div>
              )
            )}
          </div>
        );

      case 'balance_card':
        return (
          <div key={id} className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl lg:col-span-1 flex flex-col justify-between relative overflow-hidden group ring-1 ring-white/10 h-full animate-slide-up">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-blue-200/80">Saldo Real do Mês</span>
                <button onClick={() => setShowTotalDetails(!showTotalDetails)} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Info size={16} />
                </button>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight animate-fade-in">{formatCurrency(monthAvailableBalance)}</h2>
              {showTotalDetails && (
                <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] animate-fade-in">
                  <div className="flex justify-between mb-1">
                    <span className="text-blue-200/50 uppercase">Patrimônio Líquido Hoje</span>
                    <span className="font-bold">{formatCurrency(totalBalance)}</span>
                  </div>
                  <p className="text-blue-300/40 mt-1 italic">* O Saldo Real considera o que você tem hoje mais o que entra e sai até o fim deste mês.</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-8 relative z-10">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-1 text-emerald-400 mb-1">
                  <ArrowUpCircle size={14} />
                  <span className="text-[10px] font-bold uppercase">Ganhos Mês</span>
                </div>
                <p className="text-lg font-bold animate-fade-in">{formatCurrency(totalIncomeMonth)}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-1 text-red-400 mb-1">
                  <ArrowDownCircle size={14} />
                  <span className="text-[10px] font-bold uppercase">Gastos Mês</span>
                </div>
                <p className="text-lg font-bold animate-fade-in">{formatCurrency(totalExpenseMonth)}</p>
              </div>
            </div>
          </div>
        );

      case 'compass':
        return (
          <div key={id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center animate-slide-up">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 w-full text-left flex items-center">
              <Compass size={16} className="mr-2" /> Bússola do Mês
            </h3>
            <div className="relative w-40 h-20 overflow-hidden mb-4 scale-110">
              <div className="w-40 h-40 rounded-full border-[10px] border-gray-100 absolute top-0 left-0"></div>
              <div className="w-40 h-40 rounded-full border-[10px] absolute top-0 left-0"
                style={{
                  background: 'conic-gradient(from 270deg, #10b981 0deg, #10b981 120deg, #f59e0b 120deg, #f59e0b 150deg, #ef4444 150deg, #ef4444 180deg, transparent 180deg)',
                  maskImage: 'radial-gradient(transparent 60%, black 61%)', WebkitMaskImage: 'radial-gradient(transparent 60%, black 61%)'
                }}
              ></div>
              <div className="absolute bottom-0 left-1/2 w-1 h-20 bg-gray-800 origin-bottom rounded-full transition-transform duration-1000 ease-out"
                style={{ transform: `translateX(-50%) rotate(${needleRotation - 90}deg)` }}>
              </div>
            </div>
            <p className="text-2xl font-black mt-2" style={{ color: compassColor }}>{spendingPercentage.toFixed(0)}%</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold mt-1 text-center">{compassMessage}</p>
          </div>
        );

      case 'spending_chart':
        return (
          <div key={id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-slide-up">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
              <PieIcon size={16} className="mr-2" /> Divisão de Gastos
            </h3>
            {chartData.length > 0 ? (
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value">
                      {chartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-300 text-xs italic">Nenhum gasto registrado</div>
            )}
          </div>
        );

      case 'recent_transactions':
        return (
          <div key={id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 col-span-1 md:col-span-2 lg:col-span-3 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Últimas Transações</h3>
            </div>
            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <p className="text-gray-400 text-sm italic text-center py-4">Nenhuma transação registrada.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recentTransactions.map(tx => {
                    const cat = categories.find(c => c.id === tx.categoryId);
                    return (
                      <div key={tx.id} className="p-3 rounded-2xl bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <CategoryIcon iconName={cat?.icon} color={cat?.color} size={18} />
                          <p className="font-bold text-gray-800 text-xs truncate max-w-[120px]">{tx.description}</p>
                        </div>
                        <span className={`font-bold text-sm ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {formatCurrency(tx.value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center animate-fade-in">
        <div className="bg-primary/10 p-6 rounded-full mb-4"><Wallet size={48} className="text-primary" /></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo ao Visão 360</h2>
        <p className="text-gray-500 max-w-md mb-6">Comece adicionando suas contas ou cartões para ter controle total.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-0 space-y-6 pb-24">
      {/* Header com Botão de Customização */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 hidden md:block">Visão Geral</h1>
        <div className="flex md:hidden items-center space-x-3">
          <Logo size={32} className="text-primary" />
          <h1 className="text-xl font-bold text-gray-900">Visão 360</h1>
        </div>
        <button
          onClick={() => setIsEditModeOpen(true)}
          className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
        >
          <Settings2 size={16} />
          <span>Personalizar</span>
        </button>
      </div>

      {/* CARD DE INCENTIVO AO INVESTIMENTO (Só aparece no último dia do mês se houver saldo) */}
      {isLastDayOfMonth && monthAvailableBalance > 0 && (
        <div className="relative overflow-hidden rounded-[32px] p-6 text-white shadow-2xl animate-slide-up border border-emerald-500/30 group">
          {/* Background com efeito glass/neon */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-gray-900 to-black z-0"></div>
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-[60px] animate-pulse-slow"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 mb-2 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                <Sparkles size={14} className="text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Fechamento do Mês</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-1 leading-tight">
                O Visão 360 te incentiva a guardar dinheiro!
              </h2>
              <p className="text-emerald-200/80 text-sm mb-4">Vamos investir esse dinheiro antes que o mês acabe?</p>

              <div className="mb-2">
                <p className="text-xs text-gray-400 font-bold uppercase">Saldo disponível</p>
                <p className="text-3xl md:text-4xl font-black text-white tracking-tight">{formatCurrency(monthAvailableBalance)}</p>
              </div>
            </div>

            <div className="flex flex-col space-y-3 w-full md:w-auto min-w-[200px]">
              <p className="text-xs text-center text-gray-400 font-medium mb-1">Quero investir em...</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate('/transactions/add')}
                  className="flex-1 bg-lime-400 hover:bg-lime-500 text-black py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-lime-400/20"
                >
                  <TrendingUp size={18} className="mr-2" />
                  Investimentos
                </button>
                <button
                  onClick={() => {
                    setShowInvestTooltip(true);
                    setTimeout(() => setShowInvestTooltip(false), 3000);
                  }}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-pink-500/20 relative"
                >
                  <Target size={18} className="mr-2" />
                  Metas
                  {showInvestTooltip && (
                    <div className="absolute top-full mt-2 bg-white text-gray-800 text-xs p-2 rounded-lg shadow-xl w-40 z-50 animate-fade-in border border-gray-100">
                      <div className="mb-1 font-bold">Caixinhas</div>
                      <div className="text-gray-500">Decoração da casa</div>
                    </div>
                  )}
                </button>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 flex items-start space-x-2 mt-2">
                <div className="bg-yellow-500 rounded-full p-0.5 mt-0.5"><div className="w-1 h-1 bg-black rounded-full"></div></div>
                <p className="text-[10px] text-yellow-200/80 leading-tight">
                  <span className="font-bold text-yellow-400">Dica:</span> Manter "Dívidas" zeradas aumenta seu score mensal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Renderização Dinâmica dos Widgets Baseado no Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {layout.map(w => w.visible ? renderWidget(w.id) : null)}
      </div>

      {/* Modal de Personalização */}
      {isEditModeOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-t-[32px] md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-slide-up max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Personalizar Dashboard</h3>
                <p className="text-xs text-gray-500">Ajuste o que você quer ver primeiro.</p>
              </div>
              <button
                onClick={() => setIsEditModeOpen(false)}
                className="p-2 bg-white rounded-full border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {layout.map((widget, index) => {
                const labels: Record<string, string> = {
                  balance_card: 'Resumo de Saldo',
                  compass: 'Bússola de Gastos',
                  spending_chart: 'Gráfico por Categoria',
                  recent_transactions: 'Lista de Transações',
                  upcoming_bills: 'Agenda de Pagamentos'
                };

                return (
                  <div key={widget.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${widget.visible ? 'border-gray-100 bg-white' : 'border-gray-50 bg-gray-50/50 opacity-60'}`}>
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => moveWidget(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-20"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => moveWidget(index, 'down')}
                          disabled={index === layout.length - 1}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-20"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                      <span className={`font-bold text-sm ${widget.visible ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                        {labels[widget.id]}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleVisibility(widget.id)}
                      className={`p-2 rounded-xl transition-all ${widget.visible ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                    >
                      {widget.visible ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setIsEditModeOpen(false)}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 transition-all active:scale-95"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
