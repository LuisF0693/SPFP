import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils';
import {
  Wallet, TrendingUp, TrendingDown, Target, MoreHorizontal,
  ArrowUpRight, ArrowDownRight, CreditCard, DollarSign, Calendar
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { CategoryIcon } from './CategoryIcon';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { totalBalance, transactions, categories, accounts, userProfile } = useFinance();
  const [dateRange, setDateRange] = useState('Oct 2023'); // Exemplo estático ou dinâmico

  // --- DATA PREPARATION ---

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Filter current month transactions
  const currentMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const lastMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === (currentMonth === 0 ? 11 : currentMonth - 1) &&
      d.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear);
  });

  // Calculate Totals
  const totalIncome = currentMonthTx.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.value, 0);
  const totalExpense = currentMonthTx.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.value, 0);

  const lastMonthIncome = lastMonthTx.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.value, 0);
  const lastMonthExpense = lastMonthTx.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.value, 0);

  // Comparisons
  const incomeGrowth = lastMonthIncome > 0 ? ((totalIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
  const expenseGrowth = lastMonthExpense > 0 ? ((totalExpense - lastMonthExpense) / lastMonthExpense) * 100 : 0;
  const netWorthGrowth = 2.4; // Placeholder for net worth growth logic if not tracking history

  // Savings Goal Logic (Mocked for UI as per reference, or derived)
  const savingsTarget = 5000; // Exemplo de meta
  const currentSavings = totalIncome - totalExpense;
  const savingsProgress = Math.min(Math.max((currentSavings / savingsTarget) * 100, 0), 100);

  // Charts Data
  // 1. Cash Flow Trends (Last 6 Months)
  const getLast6MonthsData = () => {
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
  };
  const trendData = getLast6MonthsData();

  // 2. Spending by Category
  const categoryData = Object.entries(
    currentMonthTx.filter(t => t.type === 'EXPENSE').reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.value;
      return acc;
    }, {} as Record<string, number>)
  ).map(([catId, value]) => {
    const cat = categories.find(c => c.id === catId);
    return { name: cat?.name || 'Outros', value, color: cat?.color || '#94a3b8' };
  }).sort((a, b) => b.value - a.value).slice(0, 5);

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
               {Math.round((entry.payload.value / totalExpense) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Olá, {userProfile.name?.split(' ')[0] || 'Usuário'}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Visão geral financeira de {today.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
         {/*  Notification Bell could go here */}
          <button 
            onClick={() => navigate('/transactions/add')}
            className="bg-accent hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center"
          >
            <span className="mr-2">+</span> Adicionar Transação
          </button>
        </div>
      </div>

      {/* TOP CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: TOTAL NET WORTH */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Patrimônio Líquido Total</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{formatCurrency(totalBalance)}</h2>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-500">
               <Wallet size={24} />
            </div>
          </div>
          <div className="flex items-center text-sm">
             <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold text-xs flex items-center mr-2">
               <ArrowUpRight size={12} className="mr-1" /> +2.4%
             </span>
             <span className="text-gray-400 text-xs">vs mês passado</span>
          </div>
        </div>

        {/* CARD 2: MONTHLY SPENDING */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm">
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

        {/* CARD 3: SAVINGS GOAL */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm">
           <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Meta de Economia</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{Math.round(savingsProgress)}%</h2>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-500">
               <Target size={24} />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
             <span>Progresso Atual</span>
             <span className="text-emerald-500 font-bold">{formatCurrency(Math.max(currentSavings, 0))}</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
             <div 
               className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
               style={{ width: `${savingsProgress}%` }}
             ></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Meta: {formatCurrency(savingsTarget)} (Fundo de Emergência)</p>
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
             <div className="flex space-x-4">
                <div className="flex items-center text-xs text-gray-400">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Entradas
                </div>
                <div className="flex items-center text-xs text-gray-400">
                   <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> Saídas
                </div>
             </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                         <p className="text-[10px] text-gray-400">**** {acc.id.substring(0,4)}</p>
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
           <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gastos por Categoria</h3>
              <span className="text-xs text-gray-500">{today.toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}</span>
           </div>
           
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
                   <Legend content={renderCustomLegend} verticalAlign="bottom" height={100}/>
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
    </div>
  );
};

export default Dashboard;
