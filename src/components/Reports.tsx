import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, getMonthName } from '../utils';
import { TrendingUp, TrendingDown, DollarSign, LineChart as LineChartIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CategoryIcon } from './CategoryIcon';

const Reports: React.FC = () => {
  const { transactions, categories, totalBalance } = useFinance();
  
  // State for Month Selection
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const changeMonth = (delta: number) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };
  
  // Filter transactions for the SELECTED month
  const currentMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const totalIncome = currentMonthTx
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.value, 0);

  const totalExpense = currentMonthTx
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.value, 0);

  const balance = totalIncome - totalExpense;

  // --- Annual Balance Evolution Logic (Jan to Dec of Selected Year) ---
  const getAnnualBalanceHistory = () => {
      const data = [];
      
      let iteratorBalance = totalBalance;

      const futureTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate.getFullYear() > selectedYear;
      });

      futureTransactions.forEach(t => {
          if (t.type === 'INCOME') iteratorBalance -= t.value;
          else iteratorBalance += t.value;
      });

      for (let m = 11; m >= 0; m--) {
          const monthLabel = getMonthName(m).substring(0,3);

          data.push({
              month: monthLabel,
              balance: iteratorBalance,
              index: m 
          });

          const monthTx = transactions.filter(t => {
              const tDate = new Date(t.date);
              return tDate.getMonth() === m && tDate.getFullYear() === selectedYear;
          });

          const income = monthTx.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.value, 0);
          const expense = monthTx.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.value, 0);
          const net = income - expense;

          iteratorBalance = iteratorBalance - net; 
      }

      return data.reverse();
  };

  const historyData = getAnnualBalanceHistory();

  const expensesByCategory = currentMonthTx
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.value;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = (Object.entries(expensesByCategory) as [string, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id, value]) => ({
      ...categories.find(c => c.id === id),
      value
    }));

  return (
    <div className="p-5 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
            <p className="text-gray-500 text-sm">Resumo financeiro detalhado</p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
            <button 
                onClick={() => changeMonth(-1)} 
                className="p-2 text-gray-600 hover:bg-gray-100 hover:text-primary rounded-lg transition-colors"
            >
                <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-gray-800 w-40 text-center select-none">
                {getMonthName(selectedMonth)} {selectedYear}
            </span>
            <button 
                onClick={() => changeMonth(1)} 
                className="p-2 text-gray-600 hover:bg-gray-100 hover:text-primary rounded-lg transition-colors"
            >
                <ChevronRight size={20} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="p-3 bg-success/10 rounded-full text-success"><TrendingUp size={24} /></div>
                <div>
                    <p className="text-xs text-gray-500">Entradas ({getMonthName(selectedMonth).substring(0,3)})</p>
                    <p className="font-bold text-xl text-success">{formatCurrency(totalIncome)}</p>
                </div>
            </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="p-3 bg-danger/10 rounded-full text-danger"><TrendingDown size={24} /></div>
                <div>
                    <p className="text-xs text-gray-500">Saídas ({getMonthName(selectedMonth).substring(0,3)})</p>
                    <p className="font-bold text-xl text-danger">{formatCurrency(totalExpense)}</p>
                </div>
            </div>
        </div>
        <div className="bg-primary text-white p-5 rounded-xl shadow-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-full text-white"><DollarSign size={24} /></div>
                <div>
                    <p className="text-xs text-indigo-200">Balanço do Mês</p>
                    <p className="font-bold text-xl">{formatCurrency(balance)}</p>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <LineChartIcon size={20} className="mr-2 text-primary" />
                  Evolução Patrimonial
              </h3>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md">Ano de {selectedYear}</span>
          </div>
          
          <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 12, fill: '#9ca3af'}} 
                          dy={10}
                      />
                      <Tooltip 
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                          formatter={(value: number) => [formatCurrency(value), 'Saldo Acumulado']}
                          labelStyle={{color: '#6b7280', marginBottom: '0.25rem'}}
                      />
                      <Line 
                          type="monotone" 
                          dataKey="balance" 
                          stroke="#3b82f6" 
                          strokeWidth={3} 
                          dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}}
                          activeDot={{r: 6, strokeWidth: 0}}
                      />
                  </LineChart>
              </ResponsiveContainer>
          </div>
      </div>

      <h3 className="font-bold text-gray-800 mb-4">Top Categorias ({getMonthName(selectedMonth)})</h3>
      <div className="space-y-4">
        {topCategories.length > 0 ? (
          topCategories.map((cat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-3">
                         <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50" style={{color: cat.color}}>
                             <CategoryIcon iconName={cat.icon} size={20} color={cat.color} />
                         </div>
                         <span className="font-medium text-gray-700">{cat.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{formatCurrency(cat.value)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div 
                        className="h-2 rounded-full" 
                        style={{ width: `${(cat.value / totalExpense) * 100}%`, backgroundColor: cat.color || '#ccc' }}
                    ></div>
                </div>
            </div>
          ))
        ) : (
            <p className="text-gray-500 text-sm">Sem dados de gastos para este mês.</p>
        )}
      </div>
    </div>
  );
};

export default Reports;
