import React, { useState, useEffect, useCallback } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Lightbulb, AlertCircle, Clock, RefreshCw, Loader2, Sparkles, BrainCircuit, Key } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAIInteraction, getAIHistory } from '../services/aiHistoryService';
import { formatCurrency } from '../utils';

const Insights: React.FC = () => {
  const { transactions, totalBalance, categories, userProfile } = useFinance();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasData = transactions.length > 0;
  const hasToken = !!userProfile.geminiToken;

  const fetchLatestInsight = useCallback(async () => {
    if (!user) return;
    try {
      const history = await getAIHistory(user.id); // Use user.id from AuthContext
      if (history.length > 0) {
        setInsight(history[0].response);
      }
    } catch (err) {
      console.error("Failed to load AI history", err);
    }
  }, [user]);

  useEffect(() => {
    fetchLatestInsight();
  }, [fetchLatestInsight]);

  const generateInsights = async () => {
    if (!user || !hasData || !hasToken) return;

    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      const currentMonthTx = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const income = currentMonthTx.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.value, 0);
      const expense = currentMonthTx.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.value, 0);

      const spendingByCategory = currentMonthTx
        .filter(t => t.type === 'EXPENSE')
        .reduce((acc, t) => {
          const cat = categories.find(c => c.id === t.categoryId);
          const name = cat?.name || 'Outros';
          acc[name] = (acc[name] || 0) + t.value;
          return acc;
        }, {} as Record<string, number>);

      const prompt = `
                Você é um consultor financeiro sênior especializado no mercado brasileiro. 
                Analise as finanças abaixo e forneça insights práticos e encorajadores.
                
                Dados Financeiros do Usuário:
                - Saldo Atual Consolidado: ${formatCurrency(totalBalance)}
                - Total de Entradas (Mês Atual): ${formatCurrency(income)}
                - Total de Saídas (Mês Atual): ${formatCurrency(expense)}
                - Detalhamento de Gastos por Categoria: ${JSON.stringify(spendingByCategory)}
                
                Perfil Sociofamiliar:
                - Nome: ${userProfile.name || 'Usuário'}
                - Possui Filhos: ${userProfile.hasChildren ? 'Sim' : 'Não'}
                - Possui Cônjuge: ${userProfile.hasSpouse ? 'Sim' : 'Não'}
                
                Sua tarefa:
                1. Forneça um resumo executivo da saúde financeira atual (máximo 3 linhas).
                2. Identifique 3 áreas específicas para redução de custos ou otimização.
                3. Recomende um próximo passo estratégico (ex: reserva de emergência, investimento específico ou ajuste de hábito).
                
                Responda em Português do Brasil com tom profissional e acolhedor. Use formatação em Markdown (negrito, listas). 
                Não mencione que você é uma IA, aja como o consultor.
            `;

      // Initialization using user provided token
      const genAI = new GoogleGenerativeAI(userProfile.geminiToken!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const resultText = response.text();

      setInsight(resultText);

      // Persist the interaction
      await saveAIInteraction(user.id, "Financial Insights", resultText, {
        summary: { income, expense, balance: totalBalance }
      });

    } catch (err: any) {
      console.error("AI Generation Error:", err);
      if (err.message?.includes('API_KEY_INVALID')) {
        setError("Sua API Key do Gemini parece inválida. Verifique em Configurações.");
      } else {
        setError("Falha ao processar análise. Verifique sua conexão ou a validade da sua API Key.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hasData) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center animate-fade-in">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-full mb-4">
          <Lightbulb size={48} className="text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Insights Financeiros</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
          Adicione transações e contas para que a nossa inteligência possa analisar seu perfil e sugerir economias.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-0 space-y-6 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <BrainCircuit className="text-blue-600 dark:text-blue-500 mr-3" size={32} />
            Consultoria Visão 360
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Análise estratégica baseada em inteligência artificial.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={generateInsights}
            disabled={loading || !hasToken}
            className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 font-bold text-sm flex items-center shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <RefreshCw size={18} className="mr-2" />
            )}
            {insight ? 'Atualizar Análise' : 'Gerar Insights'}
          </button>
        </div>
      </div>

      {!hasToken && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-6 rounded-2xl flex flex-col md:flex-row items-center animate-fade-in">
          <Key className="text-amber-500 mr-4 mb-4 md:mb-0" size={32} />
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-amber-900 dark:text-amber-200 font-bold">API Key Necessária</h3>
            <p className="text-amber-800 dark:text-amber-300 text-sm">
              Para gerar insights, configure sua chave do Google Gemini em <strong>Configurações</strong>.
            </p>
          </div>
          <a
            href="/settings"
            onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/settings'); window.dispatchEvent(new PopStateEvent('popstate')); }}
            className="mt-4 md:mt-0 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 transition-colors"
          >
            Ir para Configurações
          </a>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 p-4 rounded-xl flex items-center text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={20} className="mr-3 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Insight Column */}
        <div className="lg:col-span-2 space-y-6">

          {loading ? (
            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-12 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Processando sua carteira...</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">O Gemini está analisando seus hábitos financeiros.</p>
              </div>
            </div>
          ) : insight ? (
            <div className="bg-white dark:bg-white/5 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm animate-fade-in">
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert max-w-none">
                {insight}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/30 p-8 rounded-2xl shadow-sm flex items-center space-x-6">
              <div className="p-4 bg-white dark:bg-white/10 rounded-2xl shadow-sm">
                <Lightbulb className="text-blue-600 dark:text-blue-400" size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">Desbloqueie sua Saúde Financeira</h3>
                <p className="text-blue-800/70 dark:text-blue-300/70 text-sm leading-relaxed">
                  Nossa IA analisa seus gastos por categoria, evolução patrimonial e perfil familiar para entregar as melhores estratégias de economia.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Status Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <TrendingUp size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
              Resumo Atual
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-wider">Total em Contas</p>
                <p className="text-lg font-black text-gray-800 dark:text-white">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-wider">Registros no Mês</p>
                <p className="text-lg font-black text-gray-800 dark:text-white">
                  {transactions.filter(t => new Date(t.date).getMonth() === new Date().getMonth()).length} transações
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-[10px] text-gray-400">
              <span className="flex items-center font-bold"><Clock size={12} className="mr-1" /> IA ATIVA</span>
              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-bold uppercase tracking-tighter">Gemini 1.5 Flash</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
