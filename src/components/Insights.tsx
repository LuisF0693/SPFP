import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSafeFinance } from '../hooks/useSafeFinance';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp, Lightbulb, AlertCircle, RefreshCw, Loader2, Sparkles,
  BrainCircuit, Key, CheckCircle2, Send, User, Bot, Trash2,
  ChevronDown, Info, ShieldCheck, Target, Wallet, BarChart3,
  MessageSquare, Zap, ArrowRight, History
} from 'lucide-react';
import { saveAIInteraction, getAIHistory } from '../services/aiHistoryService';
import { formatCurrency } from '../utils';
import { chatWithAI, ChatMessage } from '../services/aiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * Insights component.
 * Provides an AI-powered financial advisor agent interface.
 * Focuses on a data-driven experience where diagnostics precede chat interaction.
 */
export const Insights: React.FC = () => {
  const {
    transactions, totalBalance, categories, userProfile,
    investments, patrimonyItems, goals, categoryBudgets
  } = useSafeFinance();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [hasGeneratedInsight, setHasGeneratedInsight] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const aiConfig = userProfile.aiConfig;
  const hasToken = !!(aiConfig?.apiKey || userProfile.geminiToken);
  const hasData = transactions.length > 0;

  // Limpar estado quando usuário muda (cada usuário tem seu próprio histórico)
  useEffect(() => {
    if (user?.id !== currentUserId) {
      // Usuário mudou - resetar todo o estado
      setMessages([]);
      setHasGeneratedInsight(false);
      setError(null);
      setCurrentUserId(user?.id || null);
    }
  }, [user?.id, currentUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Buscar histórico de insights do usuário atual
  useEffect(() => {
    const fetchUserInsights = async () => {
      if (!user?.id) return;

      try {
        const history = await getAIHistory(user.id);
        if (history.length > 0) {
          setHasGeneratedInsight(true);
          // Carregar apenas o insight mais recente DESTE usuário
          setMessages([{
            id: 'hist-' + Date.now(),
            role: 'assistant',
            content: history[0].response,
            timestamp: history[0].timestamp.getTime()
          }]);
        } else {
          // Usuário não tem insights ainda - manter estado limpo
          setHasGeneratedInsight(false);
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to load AI history for user", user.id, err);
      }
    };

    fetchUserInsights();
  }, [user?.id]); // Executar sempre que o user.id mudar

  const testConnection = async () => {
    if (!hasToken) return;
    setTestStatus('testing');
    setError(null);
    try {
      await chatWithAI(
        [{ role: 'user', content: 'Teste de conexão. Responda apenas "OK".' }],
        aiConfig!,
        userProfile.geminiToken
      );
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch (err: any) {
      console.error("Connection test failed", err);
      setTestStatus('error');
      setError(`Erro na IA: ${err.message?.split('\n')[0]}`);
    }
  };

  const getFinancialContext = () => {
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

    const sentimentData = currentMonthTx
      .filter(t => t.type === 'EXPENSE' && t.sentiment)
      .map(t => ({
        description: t.description,
        value: t.value,
        sentiment: t.sentiment,
        category: categories.find(c => c.id === t.categoryId)?.name || 'Geral'
      }));

    const activeGoals = goals.filter(g => g.status !== 'COMPLETED');
    const assets = investments.map(i => ({ name: i.ticker || i.name, value: i.quantity * i.currentPrice }));
    const debts = patrimonyItems.filter(p => p.type === 'DEBT');

    return {
      summary: {
        balance: totalBalance,
        monthlyIncome: income,
        monthlyExpense: expense,
        savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0
      },
      categories: spendingByCategory,
      sentiments: sentimentData,
      goals: activeGoals.map(g => ({ name: g.name, current: g.currentAmount, target: g.targetAmount })),
      assets,
      debts: debts.map(d => ({ name: d.name, value: d.value })),
      profile: {
        name: userProfile.name || 'Usuário',
        family: `${userProfile.hasSpouse ? 'Casado(a)' : 'Solteiro(a)'}${userProfile.hasChildren ? ', com filhos' : ''}`
      }
    };
  };

  const handleSend = async (customPrompt?: string) => {
    const messageText = customPrompt || inputValue.trim();
    if (!messageText || loading || !hasToken) return;

    // Se for o primeiro diagnóstico, mudar estado
    if (customPrompt?.includes("Diagnóstico")) {
      setHasGeneratedInsight(true);
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now()
    };

    if (!customPrompt) {
      setMessages(prev => [...prev, newUserMessage]);
      setInputValue('');
    }

    setLoading(true);
    setError(null);

    try {
      const context = getFinancialContext();

      const systemPrompt = `
                # PERSONA
                Você não é apenas um chatbot, você é o "Agente de Inteligência Financeira SPFP Premium". 
                Você é um consultor CFP® de elite que acompanha a vida do usuário de forma contínua.
                Você se alimenta de cada dado (transações, metas, investimentos) para construir um histórico evolutivo.
                Sua missão é transformar dados frios em insights acionáveis e estratégicos.

                # CONTEXTO ATUAL DO USUÁRIO
                - Usuário: ${context.profile.name} (${context.profile.family})
                - Saldo Consolidado: ${formatCurrency(context.summary.balance)}
                - Fluxo Mensal: Entradas ${formatCurrency(context.summary.monthlyIncome)} | Saídas ${formatCurrency(context.summary.monthlyExpense)}
                - Taxa de Poupança: ${context.summary.savingsRate.toFixed(1)}%
                - Gastos por Categoria: ${JSON.stringify(context.categories)}
                - Objetivos: ${JSON.stringify(context.goals)}
                - Ativos/Investimentos: ${JSON.stringify(context.assets)}
                - Dívidas: ${JSON.stringify(context.debts)}
                - Sentimentos em Compras Recentes: ${JSON.stringify(context.sentiments)}

                # DIRETRIZES DE AGENTE
                - Mencione que você está analisando os dados em tempo real e que sua inteligência "apreende" com o comportamento financeiro dele.
                - CRITICAL: Analise a correlação entre sentimentos (ex: stressed, happy, impulsive) e os gastos. Se o usuário gasta mais quando está estressado, aponte isso de forma construtiva.
                - Use tom de parceria: "Nós estamos construindo seu patrimônio", "Identifiquei um padrão no seu fluxo".
                - Formate sua resposta usando MARKDOWN de ALTA QUALIDADE. Use tabelas para dados comparativos, negrito para ênfase e listas claras.
                - Se for o Diagnóstico Inicial, apresente um relatório estruturado de 360 graus.
                - NUNCA use linguagem genérica. Seja específico sobre os números fornecidos acima.
            `;

      const aiMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }) as ChatMessage),
        { role: 'user', content: customPrompt ? `Execute a TAREFA completa de Diagnóstico Patrimonial 360 baseada nos meus dados atuais.` : messageText }
      ];

      const { text, modelName } = await chatWithAI(aiMessages, aiConfig!, userProfile.geminiToken);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (customPrompt) {
        await saveAIInteraction(user!.id, "Consultoria 360", text, {
          summary: context.summary,
          ai_model: modelName
        });
      }

    } catch (err: any) {
      console.error("Chat Error:", err);
      setError(err.message || "Erro ao processar sua solicitação.");
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Deseja limpar o histórico desta conversa?')) {
      setMessages([]);
      setHasGeneratedInsight(false);
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (!hasData) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[70vh] text-center animate-fade-in text-white">
        <div className="bg-blue-600/10 p-8 rounded-full mb-6 border border-blue-500/20">
          <BrainCircuit size={64} className="text-blue-500 animate-pulse" />
        </div>
        <h2 className="text-3xl font-serif font-bold mb-4">Agente de Inteligência SPFP</h2>
        <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
          Olá! Sou seu Agente Financeiro de Elite. Para que eu possa me alimentar de dados e gerar insights, você precisa adicionar algumas transações e contas primeiro.
        </p>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 uppercase tracking-widest">Aguardando Alimentação de Dados</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen md:h-[calc(100vh-100px)] max-w-5xl mx-auto animate-fade-in relative px-2 md:px-4">
      {/* Header */}
      <div className="flex items-center justify-between p-6 glass rounded-t-[2.5rem] shadow-2xl z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-white tracking-wide">Agente SPFP Premium</h1>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Ativo e Analisando</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasToken && (
            <button
              onClick={testConnection}
              disabled={testStatus === 'testing'}
              className={`px-4 py-2 border rounded-xl font-bold text-xs flex items-center transition-all ${testStatus === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  testStatus === 'error' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                    'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
            >
              {testStatus === 'testing' ? <Loader2 size={14} className="mr-2 animate-spin" /> :
                testStatus === 'success' ? <CheckCircle2 size={14} className="mr-2" /> :
                  <Zap size={14} className="mr-2" />}
              Status IA
            </button>
          )}
          <button
            onClick={clearChat}
            className="p-3 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
            title="Resetar Agente"
          >
            <History size={20} />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col bg-black/40 border-x border-white/10 overflow-hidden relative">

        {/* Step-by-step Insight Flow */}
        {!hasGeneratedInsight ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-slate-950/80 backdrop-blur-md">
            <div className="max-w-md space-y-8 animate-fade-in">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                <div className="relative bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                  <BarChart3 size={64} className="text-blue-500 mx-auto" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-serif font-bold text-white leading-tight">Pronto para o Próximo Nível?</h2>
                <p className="text-gray-400 leading-relaxed">
                  Para iniciarmos nossa consultoria, preciso realizar um **Diagnóstico Patrimonial 360**.
                  Irei me alimentar das suas transações, metas e histórico para criar sua estratégia personalizada.
                </p>
              </div>

              <button
                onClick={() => handleSend("Diagnóstico Inicial")}
                disabled={loading || !hasToken}
                className="group relative w-full py-5 px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-gray-800 text-white rounded-[1.5rem] font-bold shadow-2xl shadow-blue-500/20 transition-all active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Gerar Diagnóstico Financeiro</>}
                </span>
              </button>

              {!hasToken && (
                <p className="text-amber-500/80 text-xs font-medium flex items-center justify-center gap-2">
                  <Key size={14} /> Requer Chave de API habilitada
                </p>
              )}
            </div>
          </div>
        ) : null}

        {/* Chat Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar scroll-smooth"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`flex gap-4 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border shadow-lg ${msg.role === 'user'
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-white/5 border-white/10 text-blue-400'
                  }`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`p-6 rounded-[1.5rem] shadow-2xl relative ${msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                    }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-blue max-w-none 
                        prose-p:leading-relaxed prose-p:text-gray-300 
                        prose-headings:font-serif prose-headings:text-white prose-headings:mb-4
                        prose-table:border prose-table:border-white/10 prose-th:bg-white/5 prose-td:border-white/10
                        prose-li:text-gray-300 prose-strong:text-blue-400">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest px-2 block">
                    {formatTime(msg.timestamp)} • {msg.role === 'user' ? userProfile.name || 'Você' : 'Agente SPFP'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shadow-lg">
                  <Loader2 size={20} className="animate-spin" />
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-[1.5rem] rounded-tl-none shadow-xl">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs flex items-center gap-3 mx-auto max-w-md">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-8 glass rounded-b-[2.5rem] shadow-2xl relative" data-testid="insights-input-area">
        <div className="flex gap-4 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={!hasGeneratedInsight ? "Aguardando diagnóstico inicial..." : "Solicitar informações ou ajustes ao agente..."}
              disabled={!hasToken || loading || !hasGeneratedInsight}
              className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] p-5 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all resize-none min-h-[64px] max-h-[200px] scrollbar-hide text-sm"
              rows={1}
              data-testid="insights-chat-input"
            />
            <div className="absolute right-4 bottom-5 flex items-center gap-2">
              <MessageSquare size={18} className="text-gray-600" />
            </div>
          </div>
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputValue.trim() || !hasToken || !hasGeneratedInsight}
            className="w-16 h-16 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:bg-gray-800 text-white rounded-[1.5rem] flex items-center justify-center transition-all shadow-xl shadow-blue-500/20 active:scale-95 group"
            data-testid="insights-send-btn"
          >
            <Send size={28} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        {!hasToken && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md rounded-bottom-[2.5rem] flex items-center justify-center z-30 px-6 text-center">
            <div className="p-6 glass rounded-2xl border border-amber-500/20 space-y-4">
              <p className="text-amber-400 font-bold text-sm tracking-widest flex items-center justify-center gap-2 uppercase">
                <Key size={16} /> Configuração Pendente
              </p>
              <p className="text-gray-400 text-xs">Vá para as configurações e insira sua chave da API para ativar o agente.</p>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full -z-10"></div>
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-500/10 blur-[100px] rounded-full -z-10"></div>
    </div>
  );
};
