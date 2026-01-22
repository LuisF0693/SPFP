import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp, Lightbulb, AlertCircle, RefreshCw, Loader2, Sparkles,
  BrainCircuit, Key, CheckCircle2, Send, User, Bot, Trash2,
  ChevronDown, Info, ShieldCheck, Target, Wallet
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
 * Provides an AI-powered financial advisor chat interface.
 * Integrates with AI services to provide context-aware financial guidance.
 */
export const Insights: React.FC = () => {
  const {
    transactions, totalBalance, categories, userProfile,
    investments, patrimonyItems, goals, categoryBudgets
  } = useFinance();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const aiConfig = userProfile.aiConfig;
  const hasToken = !!(aiConfig?.apiKey || userProfile.geminiToken);
  const hasData = transactions.length > 0;

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const fetchLatestInsight = useCallback(async () => {
    if (!user) return;
    try {
      const history = await getAIHistory(user.id);
      if (history.length > 0) {
        if (messages.length === 0) {
          setMessages([{
            id: 'hist-' + Date.now(),
            role: 'assistant',
            content: history[0].response,
            timestamp: history[0].timestamp.getTime()
          }]);
        }
      }
    } catch (err) {
      console.error("Failed to load AI history", err);
    }
  }, [user, messages.length]);

  useEffect(() => {
    fetchLatestInsight();
  }, [fetchLatestInsight]);

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
                Você é o "Consultor Financeiro Pessoal CFP®", planejador financeiro certificado com 15 anos de experiência.
                Você combina rigor técnico com didática, focando no cenário brasileiro (Selic, inflação).

                # CONTEXTO ATUAL DO USUÁRIO
                - Usuário: ${context.profile.name} (${context.profile.family})
                - Saldo Consolidado: ${formatCurrency(context.summary.balance)}
                - Fluxo Mensal: Entradas ${formatCurrency(context.summary.monthlyIncome)} | Saídas ${formatCurrency(context.summary.monthlyExpense)}
                - Taxa de Poupança: ${context.summary.savingsRate.toFixed(1)}%
                - Gastos por Categoria: ${JSON.stringify(context.categories)}
                - Objetivos: ${JSON.stringify(context.goals)}
                - Ativos/Investimentos: ${JSON.stringify(context.assets)}
                - Dívidas: ${JSON.stringify(context.debts)}

                # DIRETRIZES
                - Siga o fluxo de 5 etapas (Diagnóstico, Perfil, Estratégia, Projeções, Plano de Ação) se for a primeira análise.
                - Em conversas de chat, mantenha o tom CFP®, seja conciso e responda às dúvidas específicas do usuário usando os dados acima.
                - Use Markdown (tabelas, negrito, listas).
                - Nunca garanta retornos ou recomende produtos sem contexto.
            `;

      const aiMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }) as ChatMessage),
        { role: 'user', content: customPrompt ? `Execute a TAREFA completa de Consultoria baseada nos dados fornecidos.` : messageText }
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
        <h2 className="text-3xl font-serif font-bold mb-4">Consultoria Visão 360</h2>
        <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
          Olá! Sou seu Consultor CFP®. Para que eu possa analisar sua vida financeira, você precisa adicionar algumas transações e contas primeiro.
        </p>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400">AGUARDANDO DADOS</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto animate-fade-in relative px-4">

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-t-[2.5rem] shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-white tracking-wide">Consultor CFP®</h1>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Online e Pronto</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasToken && (
            <button
              onClick={testConnection}
              disabled={testStatus === 'testing'}
              className={`px-4 py-2 border rounded-xl font-bold text-xs flex items-center transition-all ${testStatus === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                testStatus === 'error' ? 'bg-red-50 text-red-600 border-red-200' :
                  'bg-white/5 border-white/10 text-gray-400 dark:text-gray-300 hover:bg-white/10'
                }`}
            >
              {testStatus === 'testing' ? <Loader2 size={14} className="mr-2 animate-spin" /> :
                testStatus === 'success' ? <CheckCircle2 size={14} className="mr-2" /> :
                  <RefreshCw size={14} className="mr-2" />}
              Testar Conexão
            </button>
          )}
          <button
            onClick={() => handleSend("Realize um Diagnóstico Patrimonial completo e Plano de Ação.")}
            disabled={loading || !hasToken}
            className="p-3 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
            title="Nova Análise Completa"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={clearChat}
            className="p-3 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
            title="Limpar Chat"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 bg-black/40 border-x border-white/10 no-scrollbar scroll-smooth"
      >
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 opacity-60 py-20">
            <Sparkles size={48} className="text-blue-500" />
            <div className="space-y-4 max-w-md">
              <h3 className="text-2xl font-serif font-bold text-white">Bem-vindo à sua Consultoria Premium</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Como seu consultor CFP®, estou pronto para analisar seu patrimônio, dívidas e objetivos.
                Clique no botão de análise ou envie sua dúvida abaixo.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <button
                onClick={() => setInputValue("Como está meu saldo mensal?")}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-all text-left"
              >
                "Como está meu saldo mensal?"
              </button>
              <button
                onClick={() => setInputValue("Onde posso economizar?")}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-all text-left"
              >
                "Onde posso economizar?"
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border ${msg.role === 'user'
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'bg-white/5 border-white/10 text-blue-400'
                }`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`space-y-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`p-5 rounded-2xl shadow-sm ${msg.role === 'user'
                  ? 'bg-blue-600/90 text-white rounded-tr-none'
                  : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none prose prose-invert prose-sm max-w-none'
                  }`}>
                  {msg.role === 'assistant' ? (
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-2">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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

      {/* Input Area */}
      <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-b-[2.5rem] shadow-2xl relative">
        <div className="flex gap-4 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative group">
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
              placeholder={hasToken ? "Pergunte algo ao seu consultor..." : "Configure sua API Key primeiro..."}
              disabled={!hasToken || loading}
              className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] p-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none min-h-[60px] max-h-[150px] scrollbar-hide"
              rows={1}
            />
            <div className="absolute right-4 bottom-4 flex items-center gap-2">
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-gray-500 bg-white/5 border border-white/10 rounded opacity-50">
                <span>Enter</span>
              </kbd>
            </div>
          </div>
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputValue.trim() || !hasToken}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-gray-800 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-500/20 active:scale-95 group"
          >
            <Send size={24} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {!hasToken && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-b-[2.5rem] flex items-center justify-center z-20 px-6 text-center">
            <div className="space-y-4">
              <p className="text-amber-400 font-bold text-sm flex items-center justify-center gap-2">
                <Key size={16} /> API Key Necessária
              </p>
              <p className="text-gray-400 text-xs">Acesse as Configurações para habilitar sua Consultoria Visão 360.</p>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Context Indicator (Desktop) */}
      <div className="hidden xl:block absolute -right-64 top-0 w-60 space-y-4">
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Target size={14} className="text-blue-400" /> Metas Ativas
          </h3>
          <div className="space-y-4">
            {goals.slice(0, 2).map(g => (
              <div key={g.id} className="space-y-1">
                <p className="text-[11px] text-white font-medium truncate">{g.name}</p>
                <div className="h-1 w-full bg-white/5 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(g.currentAmount / g.targetAmount) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Wallet size={14} className="text-emerald-400" /> Patrimônio
          </h3>
          <p className="text-lg font-serif font-bold text-white tracking-widest">{formatCurrency(totalBalance)}</p>
        </div>
      </div>
    </div>
  );
};
