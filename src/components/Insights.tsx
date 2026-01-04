import React, { useState, useEffect, useCallback } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Lightbulb, AlertCircle, Clock, RefreshCw, Loader2, Sparkles, BrainCircuit, Key, CheckCircle2 } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveAIInteraction, getAIHistory } from '../services/aiHistoryService';
import { formatCurrency } from '../utils';

const Insights: React.FC = () => {
  const { transactions, totalBalance, categories, userProfile } = useFinance();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const hasData = transactions.length > 0;
  const hasToken = !!userProfile.geminiToken;

  const fetchLatestInsight = useCallback(async () => {
    if (!user) return;
    try {
      const history = await getAIHistory(user.id);
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

  const testConnection = async () => {
    if (!hasToken) return;
    setTestStatus('testing');
    try {
      const genAI = new GoogleGenerativeAI(userProfile.geminiToken!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      await model.generateContent("Olá, teste de conexão.");
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch (err) {
      console.error("Connection test failed", err);
      setTestStatus('error');
      setError("Falha no teste de conexão. Verifique se sua API Key é válida.");
    }
  };

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

      const genAI = new GoogleGenerativeAI(userProfile.geminiToken!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const resultText = response.text();

      if (!resultText) throw new Error("A IA não retornou texto.");

      setInsight(resultText);

      // Persist
      await saveAIInteraction(user.id, "Insights Financeiros", resultText, {
        summary: { income, expense, balance: totalBalance }
      });

    } catch (err: any) {
      console.error("AI Generation Error:", err);
      if (err.message?.includes('API_KEY_INVALID')) {
        setError("Sua API Key do Gemini parece inválida. Verifique em Configurações.");
      } else if (err.message?.includes('SAFETY')) {
        setError("A análise foi bloqueada pelos filtros de segurança da IA. Tente gastar de forma mais civilizada! Brincadeira, tente novamente em instantes.");
      } else {
        setError(`Erro: ${err.message || "Falha ao processar análise. Verifique sua conexão."}`);
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
    <div className="p-5 md:p-10 space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <BrainCircuit className="text-blue-600 dark:text-blue-500 mr-3" size={32} />
            Consultoria Visão 360
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Análise estratégica baseada em Inteligência Artificial.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {hasToken && (
            <button
              onClick={testConnection}
              disabled={testStatus === 'testing'}
              className={`px-4 py-2 border rounded-xl font-bold text-xs flex items-center transition-all ${testStatus === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                  testStatus === 'error' ? 'bg-red-50 text-red-600 border-red-200' :
                    'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                }`}
            >
              {testStatus === 'testing' ? <Loader2 size={14} className="mr-2 animate-spin" /> :
                testStatus === 'success' ? <CheckCircle2 size={14} className="mr-2" /> :
                  <RefreshCw size={14} className="mr-2" />}
              Testar Conexão
            </button>
          )}
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
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-6 rounded-2xl flex flex-col md:flex-row items-center animate-fade-in shadow-sm">
          <Key className="text-amber-500 mr-4 mb-4 md:mb-0" size={32} />
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-amber-900 dark:text-amber-200 font-bold">API Key Necessária</h3>
            <p className="text-amber-800 dark:text-amber-300 text-sm">
              Configure sua chave do **Google Gemini** em **Configurações** para desbloquear esta funcionalidade.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 p-4 rounded-xl flex items-center text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={20} className="mr-3 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Insight Column */}
        <div className="lg:col-span-2 space-y-6">

          {loading ? (
            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-12 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Processando sua carteira...</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">A inteligência está criando sua consultoria 360.</p>
              </div>
            </div>
          ) : insight ? (
            <div className="bg-white dark:bg-white/5 p-8 md:p-10 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm animate-fade-in">
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                {insight.split('\n').map((line, i) => (
                  <p key={i} className="mb-4 last:mb-0">{line}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/30 p-10 rounded-3xl shadow-sm flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="p-6 bg-white dark:bg-white/10 rounded-3xl shadow-md transform rotate-3">
                <Lightbulb className="text-blue-600 dark:text-blue-400" size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-blue-900 dark:text-blue-100 mb-3 underline decoration-blue-500/30">Análise Financeira Avançada</h3>
                <p className="text-blue-800/70 dark:text-blue-300/70 text-base leading-relaxed">
                  Nossa IA processa seu histórico, saldo e perfil familiar para sugerir investimentos, cortes de gastos e o melhor caminho para sua independência.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Status Column */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm sticky top-10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <TrendingUp size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
              Status da Análise
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-widest">Saldo Monitorado</p>
                <p className="text-xl font-black text-gray-800 dark:text-white">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-widest">Atividade Recente</p>
                <p className="text-xl font-black text-gray-800 dark:text-white">
                  {transactions.filter(t => new Date(t.date).getMonth() === new Date().getMonth()).length} lançamentos
                </p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-white/10 flex flex-col space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-gray-400 uppercase">Motor de IA</span>
                <span className="text-blue-600 dark:text-blue-400">GEMINI 1.5 FLASH</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-gray-400 uppercase">Provider</span>
                <span className="text-gray-600 dark:text-gray-300">Google AI Studio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
