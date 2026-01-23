import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils';
import {
  Wallet, TrendingUp, Target, MoreHorizontal,
  ArrowUpRight, CreditCard, AlertTriangle, CheckCircle, PieChart as PieChartIcon,
  AlertCircle, Users, Sparkles
} from 'lucide-react';
import { calculateHealthScore, ClientEntry } from '../utils/crmUtils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { CategoryIcon } from './CategoryIcon';
import { useAuth } from '../context/AuthContext';
import { MonthlyRecap } from './MonthlyRecap';

/**
 * Dashboard main component.
 * Displays financial overviews, cash flow trends, account summaries, and recent transactions.
 */
export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { totalBalance, transactions, categories, accounts, userProfile, categoryBudgets, goals, fetchAllUserData } = useFinance();
  const { isAdmin } = useAuth();
  const [crmAlerts, setCrmAlerts] = useState<any[]>([]);
  const [showRecap, setShowRecap] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    const getCrmAlerts = async () => {
      try {
        const allUsers = await fetchAllUserData();
        const atRiskUsers = (allUsers as ClientEntry[]).filter(user => calculateHealthScore(user) < 50);

        const formattedAlerts = atRiskUsers.map(u => ({
          type: 'CRITICAL',
          title: `CRM: Cliente em Risco`,
          message: `${u.content?.userProfile?.name || 'Cliente'} está com score baixo (${calculateHealthScore(u)}). Necessário Check-up.`,
          icon: <Users className="text-red-500" size={18} />,
          link: '/admin'
        }));

        setCrmAlerts(formattedAlerts);
      } catch (err) {
        console.error("Erro ao buscar alertas do CRM:", err);
      }
    };

    getCrmAlerts();
  }, [isAdmin, fetchAllUserData]);

  // --- DATA PREPARATION ---

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Filter current month transactions
  const currentMonthTx = React.useMemo(() => transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }), [transactions, currentMonth, currentYear]);

  const lastMonthTx = React.useMemo(() => transactions.filter(t => {
    const d = new Date(t.date);
    // Handle Jan -> Dec wrap for last month
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  }), [transactions, currentMonth, currentYear]);

  // Calculate Totals
  const { totalIncome, totalExpense } = React.useMemo(() => {
    const income = currentMonthTx.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.value, 0);
    const expense = currentMonthTx.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.value, 0);
    return { totalIncome: income, totalExpense: expense };
  }, [currentMonthTx]);

  const { lastMonthIncome, lastMonthExpense } = React.useMemo(() => {
    const income = lastMonthTx.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.value, 0);
    const expense = lastMonthTx.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.value, 0);
    return { lastMonthIncome: income, lastMonthExpense: expense };
  }, [lastMonthTx]);

  // Comparisons
  // const incomeGrowth = lastMonthIncome > 0 ? ((totalIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
  // const expenseGrowth = lastMonthExpense > 0 ? ((totalExpense - lastMonthExpense) / lastMonthExpense) * 100 : 0;

  // BUDGET / GOALS LOGIC
  const budgetAlerts = React.useMemo(() => categories.reduce((acc, cat) => {
    const budget = categoryBudgets.find(b => b.categoryId === cat.id);
    if (!budget || budget.limit <= 0) return acc;

    const spent = currentMonthTx
      .filter(t => t.type === 'EXPENSE' && t.categoryId === cat.id)
      .reduce((sum, t) => sum + t.value, 0);

    const percentage = (spent / budget.limit) * 100;

    if (percentage >= 100) return { ...acc, critical: acc.critical + 1 };
    if (percentage >= 90) return { ...acc, warning: acc.warning + 1 };
    return acc;
  }, { critical: 0, warning: 0 }), [categories, categoryBudgets, currentMonthTx]);

  const totalBudgeted = categoryBudgets.reduce((sum, b) => sum + b.limit, 0);
  const isBudgetSet = totalBudgeted > 0;

  // 3. ATYPICAL SPENDING DETECTION
  const atypicalAlerts = React.useMemo(() => {
    // Media de gastos por categoria nos últimos 3 meses (simplificado para histórico disponível)
    const categoryAverages: Record<string, number> = {};
    const last3MonthsTx = transactions.filter(t => {
      const d = new Date(t.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      return d >= threeMonthsAgo && (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear);
    });

    // Calcular média
    last3MonthsTx.filter(t => t.type === 'EXPENSE').forEach(t => {
      categoryAverages[t.categoryId] = (categoryAverages[t.categoryId] || 0) + (t.value / 3);
    });

    // Detectar anomalias no mês atual
    return currentMonthTx.filter(t => t.type === 'EXPENSE').filter(t => {
      const avg = categoryAverages[t.categoryId];
      const txDate = new Date(t.date);
      const dayOfWeek = txDate.getDay();

      // Checar se existem outros gastos no mesmo dia da semana para comparação (opcional, mas solicitado)
      const sameDayOfWeekTxs = transactions.filter(prevT => {
        const prevD = new Date(prevT.date);
        return prevT.type === 'EXPENSE' &&
          prevD.getDay() === dayOfWeek &&
          prevT.id !== t.id &&
          (prevD.getMonth() !== currentMonth || prevD.getFullYear() !== currentYear);
      });

      const dayAvg = sameDayOfWeekTxs.length > 0
        ? sameDayOfWeekTxs.reduce((acc, curr) => acc + curr.value, 0) / sameDayOfWeekTxs.length
        : avg;

      // Alerta se um único gasto for > 80% da média mensal daquela categoria E > R$ 200
      // OU se for > 2x a média daquele dia da semana específica
      return (avg > 0 && t.value > (avg * 0.8) && t.value > 200) || (dayAvg > 0 && t.value > (dayAvg * 2));
    });
  }, [transactions, currentMonthTx, today, currentMonth, currentYear]);

  // Combined Alerts for the UI
  const alerts = React.useMemo(() => {
    const list = [];

    // Budget Alerts
    categories.forEach(cat => {
      const budget = categoryBudgets.find(b => b.categoryId === cat.id);
      if (!budget || budget.limit <= 0) return;

      const spent = currentMonthTx
        .filter(t => t.type === 'EXPENSE' && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.value, 0);

      const percentage = (spent / budget.limit) * 100;
      if (percentage >= 100) {
        list.push({
          type: 'CRITICAL',
          title: `Orçamento Estourado: ${cat.name}`,
          message: `Você excedeu o limite de ${formatCurrency(budget.limit)} em ${formatCurrency(spent - budget.limit)}.`,
          icon: <AlertTriangle className="text-red-500" size={18} />,
          link: '/budget'
        });
      } else if (percentage >= 90) {
        list.push({
          type: 'WARNING',
          title: `Limite Próximo: ${cat.name}`,
          message: `Você já utilizou ${percentage.toFixed(0)}% do orçamento de ${cat.name}.`,
          icon: <AlertCircle className="text-orange-500" size={18} />,
          link: '/budget'
        });
      }
    });

    // Atypical Alerts
    atypicalAlerts.forEach(tx => {
      list.push({
        type: 'INFO',
        title: 'Gasto Atípico Detectado',
        message: `${tx.description} (${formatCurrency(tx.value)}) está acima do seu padrão habitual.`,
        icon: <TrendingUp className="text-blue-500" size={18} />,
        link: '/transactions'
      });
    });

    // Add CRM Alerts
    list.push(...crmAlerts);

    return list;
  }, [categories, categoryBudgets, currentMonthTx, atypicalAlerts, crmAlerts]);


  // Charts Data
  // 1. Cash Flow Trends (Last 6 Months)
  const trendData = React.useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleString('pt-BR', { month: 'short' });

      const monthTx = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
      });

      const income = monthTx.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.value, 0);
      const expense = monthTx.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.value, 0);

      data.push({ name: monthName, Income: income, Expense: expense });
    }
    return data;
  }, [transactions, today]);

  // 2. Spending by Category
  const categoryData = Object.entries(
    currentMonthTx.filter(t => t.type === 'EXPENSE').reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.value;
      return acc;
    }, {} as Record<string, number>)
  ).map(([catId, value]) => {
    const cat = categories.find(c => c.id === catId);
    return { name: cat?.name || 'Outros', value, color: cat?.color || '#94a3b8' };
  }).sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0)).slice(0, 5);

  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-col space-y-2 text-xs text-gray-400 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
              <span className="text-gray-300 font-medium">{entry.value}</span>
            </div>
            {/* Calculate percentage */}
            <span className="font-bold text-gray-500">
              {Math.round((entry.payload.value / (totalExpense || 1)) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Olá, {userProfile.name?.split(' ')[0] || 'Usuário'}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Visão geral financeira de {today.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <button
            onClick={() => setShowRecap(true)}
            className="bg-white/5 hover:bg-white/10 text-blue-400 border border-blue-500/20 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-blue-500/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <Sparkles size={16} className="mr-2 animate-pulse" /> ✨ Ver Retrospectiva
          </button>
          <button
            onClick={() => navigate('/transactions/add')}
            className="bg-accent hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center"
          >
            <span className="mr-2">+</span> Adicionar Transação
          </button>
        </div>
      </div>

      {/* CRITICAL ALERTS SECTION */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              onClick={() => navigate(alert.link)}
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] ${alert.type === 'CRITICAL'
                ? 'bg-red-500/10 border-red-500/20 hover:border-red-500/40'
                : alert.type === 'WARNING'
                  ? 'bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40'
                  : 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40'
                }`}
            >
              <div className={`p-2 rounded-lg ${alert.type === 'CRITICAL' ? 'bg-red-500/20' : alert.type === 'WARNING' ? 'bg-orange-500/20' : 'bg-blue-500/20'
                }`}>
                {alert.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold ${alert.type === 'CRITICAL' ? 'text-red-400' : alert.type === 'WARNING' ? 'text-orange-400' : 'text-blue-400'
                    }`}>
                    {alert.title}
                  </h4>
                  {alert.type === 'CRITICAL' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {alert.message}
                </p>
              </div>
              <ArrowUpRight size={16} className="text-gray-600 self-center" />
            </div>
          ))}
        </div>
      )}

      {/* TOP CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* CARD 1: TOTAL NET WORTH */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group glass-shimmer card-hover">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Patrimônio Líquido</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{formatCurrency(totalBalance)}</h2>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-500">
              <Wallet size={24} />
            </div>
          </div>
          <div className="flex items-center text-sm">
            {/* Stub for growth */}
            <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold text-xs flex items-center mr-2">
              <ArrowUpRight size={12} className="mr-1" /> +2.4%
            </span>
            <span className="text-gray-400 text-xs">vs mês passado</span>
          </div>
        </div>

        {/* CARD 2: MONTHLY SPENDING */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm glass-shimmer card-hover">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Gastos do Mês</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{formatCurrency(totalExpense)}</h2>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-500">
              <CreditCard size={24} />
            </div>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="bg-orange-500 h-full rounded-full"
              style={{ width: `${Math.min((totalExpense / (totalIncome || 1)) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">
            {totalIncome > 0
              ? `${Math.round((totalExpense / totalIncome) * 100)}% da renda mensal`
              : 'Sem renda registrada este mês'}
          </p>
        </div>

        {/* CARD 3: BUDGET STATUS (NEW) */}
        <div
          className="bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm cursor-pointer hover:border-blue-500/30 transition-colors glass-shimmer card-hover"
          onClick={() => navigate('/budget')}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Metas Financeiras</p>
              {isBudgetSet ? (
                <div className="mt-1">
                  {(budgetAlerts.critical > 0 || budgetAlerts.warning > 0) ? (
                    <h2 className="text-2xl font-black text-red-500 flex items-center gap-2">
                      {budgetAlerts.critical + budgetAlerts.warning} Alertas
                      <AlertTriangle size={24} className="text-red-500 animate-pulse" />
                    </h2>
                  ) : (
                    <h2 className="text-2xl font-black text-emerald-500 flex items-center gap-2">
                      Em Dia
                      <CheckCircle size={24} className="text-emerald-500" />
                    </h2>
                  )}
                </div>
              ) : (
                <h2 className="text-xl font-bold text-gray-400 mt-1">Não definidas</h2>
              )}
            </div>
            <div className={`p-3 rounded-xl ${budgetAlerts.critical > 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'}`}>
              <Target size={24} />
            </div>
          </div>

          {isBudgetSet ? (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Progresso Geral</span>
                <span className="text-white font-bold">{Math.min((totalExpense / totalBudgeted) * 100, 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${budgetAlerts.critical > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min((totalExpense / totalBudgeted) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {budgetAlerts.critical > 0
                  ? `${budgetAlerts.critical} categorias excederam o limite.`
                  : 'Você está dentro do planejado.'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-2">
              Toque para configurar suas metas mensais.
            </p>
          )}
        </div>

      </div>

      {/* MIDDLE SECTION: CHART + ACCOUNTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CHART: CASH FLOW TRENDS */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tendência de Fluxo de Caixa</h3>
              <p className="text-xs text-gray-500">Entradas vs Saídas (Últimos 6 Meses)</p>
            </div>
            {/* Legend... */}
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1f2937', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="Income"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="Expense"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ACCOUNTS LIST */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Minhas Contas</h3>
            <button
              onClick={() => navigate('/accounts')}
              className="text-xs font-bold text-accent hover:text-blue-400"
            >
              Ver Todas
            </button>
          </div>

          <div className="flex-1 overflow-auto space-y-4 no-scrollbar">
            {accounts.slice(0, 4).map(acc => (
              <div key={acc.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${acc.type === 'CHECKING' ? 'bg-blue-100 text-blue-600' : acc.type === 'INVESTMENT' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                    <Wallet size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-accent transition-colors">{acc.name}</p>
                    <p className="text-[10px] text-gray-400">**** {acc.id.substring(0, 4)}</p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${acc.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                  {formatCurrency(acc.balance)}
                </span>
              </div>
            ))}

            <button
              className="w-full py-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-400 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center mt-2"
              onClick={() => navigate('/accounts')}
            >
              + Adicionar Conta
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: TRANSACTIONS + CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* RECENT TRANSACTIONS */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transações Recentes</h3>
            <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer">
              <MoreHorizontal size={20} className="text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 pl-2">Transação</th>
                  <th className="pb-3">Categoria</th>
                  <th className="pb-3">Data</th>
                  <th className="pb-3 text-right pr-2">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {transactions.slice(0, 5).map(tx => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  return (
                    <tr key={tx.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                            <CategoryIcon iconName={cat?.icon} size={16} />
                          </div>
                          <span className="font-bold text-sm text-gray-900 dark:text-gray-200">{tx.description}</span>
                        </div>
                      </td>
                      <td className="py-4 text-xs text-gray-500 dark:text-gray-400">{cat?.name || 'Geral'}</td>
                      <td className="py-4 text-xs text-gray-500 dark:text-gray-400 capitalize">{formatDate(tx.date).split(',')[0]}</td>
                      <td className={`py-4 text-right pr-2 font-bold text-sm ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                        {tx.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(tx.value)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Nenhuma transação registrada.
              </div>
            )}
          </div>
        </div>

        {/* SPENDING BY CATEGORY */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          {/* ... existing chart code ... */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gastos por Categoria</h3>
            <span className="text-xs text-gray-500">{today.toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}</span>
          </div>
          {/* Re-use responsive container logic logic or just simplified since I am rewriting */}
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[200px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend content={renderCustomLegend} verticalAlign="bottom" height={100} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400 text-xs italic">
                Sem dados suficientes
              </div>
            )}
            {/* Center Text for Total */}
            {categoryData.length > 0 && (
              <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-lg font-black text-gray-900 dark:text-white">{formatCurrency(totalExpense)}</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {showRecap && (
        <MonthlyRecap
          onClose={() => setShowRecap(false)}
          data={{
            userName: userProfile.name?.split(' ')[0] || 'Usuário',
            month: today.toLocaleString('pt-BR', { month: 'long' }),
            income: totalIncome,
            expense: totalExpense,
            savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
            topCategory: categoryData[0] ? { name: categoryData[0].name, spent: Number(categoryData[0].value) } : { name: 'Geral', spent: totalExpense },
            goalsReached: goals.filter(g => g.status === 'COMPLETED').length,
            investmentGrowth: 2.4, // Fallback/Mock for now
            bestSavingCategory: categories.map(cat => {
              const b = categoryBudgets.find(b => b.categoryId === cat.id);
              if (!b || b.limit <= 0) return null;
              const spent = currentMonthTx.filter(t => t.type === 'EXPENSE' && t.categoryId === cat.id).reduce((sum, t) => sum + t.value, 0);
              return { name: cat.name, saving: b.limit - spent };
            }).filter(Boolean).sort((a, b) => b!.saving - a!.saving)[0] as any
          }}
        />
      )}
    </div>
  );
};

