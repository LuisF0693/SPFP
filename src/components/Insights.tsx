import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TrendingUp, RefreshCw, Loader2, CheckCircle2,
  BrainCircuit, Key, Zap, ArrowRight, History, Trash2
} from 'lucide-react';
import { useSafeFinance } from '../hooks/useSafeFinance';
import { useAuth } from '../context/AuthContext';
import { FinnAvatar } from './FinnAvatar';
import { saveAIInteraction, getAIHistory, deleteAIHistory } from '../services/aiHistoryService';
import { formatCurrency } from '../utils';
import { chatWithAI, callFinnProxy, ChatMessage } from '../services/aiService';
import { FinnWelcomeScreen } from './insights/FinnWelcomeScreen';
import { FinnMessageList } from './insights/FinnMessageList';
import { FinnInputArea } from './insights/FinnInputArea';
import { EmptyState } from './ui/EmptyState';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * Insights — Finn AI financial advisor interface.
 * Orchestrates FinnWelcomeScreen, FinnMessageList and FinnInputArea.
 * State management and AI calls live here; rendering is delegated.
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
  const [showContextInfo, setShowContextInfo] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<Array<{id: string; prompt: string; response: string; timestamp: Date}>>([]);
  const [finnUsage, setFinnUsage] = useState<{ used: number; limit: number } | null>(null);
  const [finnBlocked, setFinnBlocked] = useState<{ reason: 'rate_limit' | 'no_plan'; message: string } | null>(null);

  const PROMPT_POOL = [
    { text: 'Como está meu orçamento este mês?', icon: '📊' },
    { text: 'Onde posso economizar mais?', icon: '💡' },
    { text: 'Qual minha maior despesa este mês?', icon: '🔍' },
    { text: 'Estou no caminho certo com minhas metas?', icon: '🎯' },
    { text: 'Compare meu gasto com o mês passado', icon: '📈' },
    { text: 'Quais categorias estão acima do orçamento?', icon: '⚠️' },
    { text: 'Dê um diagnóstico da minha saúde financeira', icon: '🏥' },
    { text: 'Como está meu saldo em todas as contas?', icon: '💰' },
    { text: 'Sugestões para aumentar minha reserva de emergência', icon: '🛡️' },
    { text: 'Analise meu padrão de gastos este mês', icon: '🧠' },
    { text: 'Qual investimento devo priorizar agora?', icon: '📦' },
    { text: 'Quanto sobra para investir este mês?', icon: '✨' },
  ];
  const [quickChips] = useState(() =>
    [...PROMPT_POOL].sort(() => 0.5 - Math.random()).slice(0, 6)
  );
  const userMessageCount = messages.filter(m => m.role === 'user').length;

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const aiConfig = userProfile.aiConfig;
  const hasUserKey = !!(aiConfig?.apiKey || userProfile.geminiToken);
  const hasToken = true;
  const hasData = transactions.length > 0;

  useEffect(() => {
    if (user?.id !== currentUserId) {
      setMessages([]);
      setHasGeneratedInsight(false);
      setError(null);
      setCurrentUserId(user?.id || null);
    }
  }, [user?.id, currentUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    const fetchUserInsights = async () => {
      if (!user?.id) return;
      try {
        const history = await getAIHistory(user.id);
        if (history.length > 0) {
          setHasGeneratedInsight(true);
          setMessages([{
            id: 'hist-' + Date.now(),
            role: 'assistant',
            content: history[0].response,
            timestamp: history[0].timestamp.getTime()
          }]);
        } else {
          setHasGeneratedInsight(false);
          setMessages([]);
        }
      } catch (err) {
        console.error('Failed to load AI history for user', user.id, err);
      }
    };
    fetchUserInsights();
  }, [user?.id]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id || !showHistory) return;
      try {
        const history = await getAIHistory(user.id);
        setHistoryItems(history.map((h: any) => ({
          id: h.id || String(h.timestamp?.getTime?.() || Date.now()),
          prompt: h.prompt || 'Consulta',
          response: h.response,
          timestamp: h.timestamp instanceof Date ? h.timestamp : new Date(h.timestamp)
        })));
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
      }
    };
    fetchHistory();
  }, [user?.id, showHistory]);

  const getFinancialContext = useCallback(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const safeTx = Array.isArray(transactions) ? transactions : [];
    const safeGoals = Array.isArray(goals) ? goals : [];
    const safeInvestments = Array.isArray(investments) ? investments : [];
    const safePatrimonyItems = Array.isArray(patrimonyItems) ? patrimonyItems : [];
    const currentMonthTx = safeTx.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const income = currentMonthTx.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.value, 0);
    const expense = currentMonthTx.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.value, 0);
    const spendingByCategory = currentMonthTx
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => {
        const cat = categories.find(c => c.id === t.categoryId);
        acc[cat?.name || 'Outros'] = (acc[cat?.name || 'Outros'] || 0) + t.value;
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
    const activeGoals = safeGoals.filter(g => g.status !== 'COMPLETED');
    const assets = safeInvestments.map(i => ({ name: i.ticker || i.name, value: i.quantity * i.currentPrice }));
    const debts = safePatrimonyItems.filter(p => p.type === 'DEBT');
    return {
      summary: { balance: totalBalance, monthlyIncome: income, monthlyExpense: expense, savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0 },
      categories: spendingByCategory,
      sentiments: sentimentData,
      goals: activeGoals.map(g => ({ name: g.name, current: g.currentAmount, target: g.targetAmount })),
      assets,
      debts: debts.map(d => ({ name: d.name, value: d.value })),
      profile: { name: userProfile.name || 'Usuário', family: `${userProfile.hasSpouse ? 'Casado(a)' : 'Solteiro(a)'}${userProfile.hasChildren ? ', com filhos' : ''}` }
    };
  }, [transactions, goals, investments, patrimonyItems, categories, totalBalance, userProfile]);

  const handleSend = async (customPrompt?: string) => {
    const messageText = customPrompt || inputValue.trim();
    if (!messageText || loading) return;
    if (customPrompt?.includes('Diagnóstico')) setHasGeneratedInsight(true);
    const newUserMessage: Message = { id: Date.now().toString(), role: 'user', content: messageText, timestamp: Date.now() };
    if (!customPrompt) { setMessages(prev => [...prev, newUserMessage]); setInputValue(''); }
    setLoading(true);
    setError(null);
    try {
      const context = getFinancialContext();
      const systemPrompt = `# PERSONA\nVocê é o Finn — o assistente financeiro pessoal do SPFP.\nVocê é um consultor CFP® de elite que acompanha a vida do usuário de forma contínua.\nSua missão é transformar dados frios em insights acionáveis e estratégicos.\nSempre se apresente como "Finn" quando relevante.\n\n# CONTEXTO ATUAL DO USUÁRIO\n- Usuário: ${context.profile.name} (${context.profile.family})\n- Saldo Consolidado: ${formatCurrency(context.summary.balance)}\n- Fluxo Mensal: Entradas ${formatCurrency(context.summary.monthlyIncome)} | Saídas ${formatCurrency(context.summary.monthlyExpense)}\n- Taxa de Poupança: ${context.summary.savingsRate.toFixed(1)}%\n- Gastos por Categoria: ${JSON.stringify(context.categories)}\n- Objetivos: ${JSON.stringify(context.goals)}\n- Ativos/Investimentos: ${JSON.stringify(context.assets)}\n- Dívidas: ${JSON.stringify(context.debts)}\n- Sentimentos em Compras Recentes: ${JSON.stringify(context.sentiments)}\n\n# DIRETRIZES\n- Analise correlação entre sentimentos e gastos.\n- Use tom de parceria: "Nós estamos construindo seu patrimônio".\n- Formate usando MARKDOWN. Use tabelas para dados comparativos.\n- Se for o Diagnóstico Inicial, apresente relatório estruturado de 360 graus.\n- NUNCA use linguagem genérica. Seja específico sobre os números fornecidos.`;
      const aiMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }) as ChatMessage),
        { role: 'user', content: customPrompt ? 'Execute a TAREFA completa de Diagnóstico Patrimonial 360 baseada nos meus dados atuais.' : messageText }
      ];
      let text: string;
      let modelName: string;
      if (hasUserKey && aiConfig) {
        const result = await chatWithAI(aiMessages, aiConfig, userProfile.geminiToken);
        text = result.text; modelName = result.modelName;
      } else {
        const result = await callFinnProxy(aiMessages);
        text = result.text; modelName = result.modelName;
        setFinnUsage({ used: result.used, limit: result.limit });
        setFinnBlocked(null);
      }
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: text, timestamp: Date.now() };
      setMessages(prev => [...prev, assistantMessage]);
      if (customPrompt) {
        await saveAIInteraction(user!.id, 'Consultoria 360', text, { summary: context.summary, ai_model: modelName });
      }
    } catch (err: any) {
      console.error('Chat Error:', err);
      if (err.isRateLimit) {
        setFinnBlocked({ reason: 'rate_limit', message: err.message });
        setFinnUsage({ used: err.used ?? finnUsage?.used ?? 0, limit: err.limit ?? finnUsage?.limit ?? 10 });
      } else if (err.isNoPlan) {
        setFinnBlocked({ reason: 'no_plan', message: err.message });
      } else {
        setError(err.message || 'Erro ao processar sua solicitação.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!window.confirm('Deseja limpar todo o histórico de insights? Esta ação não pode ser desfeita.')) return;
    setMessages([]);
    setHasGeneratedInsight(false);
    if (user?.id) {
      try { await deleteAIHistory(user.id); } catch (err) { console.error('Falha ao limpar histórico no servidor:', err); }
    }
  };

  const testConnection = async () => {
    if (!hasToken) return;
    setTestStatus('testing'); setError(null);
    try {
      await chatWithAI([{ role: 'user', content: 'Teste de conexão. Responda apenas "OK".' }], aiConfig!, userProfile.geminiToken);
      setTestStatus('success'); setTimeout(() => setTestStatus('idle'), 3000);
    } catch (err: any) {
      setTestStatus('error'); setError(`Erro na IA: ${err.message?.split('\n')[0]}`);
    }
  };

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (!hasData) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[70vh] animate-fade-in text-white">
        <EmptyState
          title="Adicione transações primeiro"
          description="Sou seu assistente financeiro pessoal. Para começar a analisar, adicione algumas transações — depois volto aqui com tudo que você precisa saber."
          finnTip="Estou aqui quando você estiver pronto."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen md:h-[calc(100vh-100px)] max-w-5xl mx-auto animate-fade-in relative px-2 md:px-4">
      {/* Header */}
      <div className="flex items-center justify-between p-6 glass rounded-t-[2.5rem] shadow-2xl z-10" data-testid="finn-header">
        <div className="flex items-center gap-4">
          <FinnAvatar mode="advisor" size="md" />
          <div>
            <h1 className="text-xl font-sans font-bold text-white tracking-wide">Finn</h1>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#1B85E3] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B85E3]" />
              </span>
              <span className="text-[10px] font-bold text-[#6AA9F4] uppercase tracking-widest">Seu assistente financeiro pessoal</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {finnUsage && !hasUserKey && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{finnUsage.used}/{finnUsage.limit} msgs</span>
              <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((finnUsage.used / finnUsage.limit) * 100, 100)}%`, background: finnUsage.used >= finnUsage.limit ? '#f43f5e' : '#1B85E3' }} />
              </div>
            </div>
          )}
          {hasUserKey && (
            <button onClick={testConnection} disabled={testStatus === 'testing'} data-testid="finn-status-btn"
              className={`px-4 py-2 border rounded-xl font-bold text-xs flex items-center transition-all ${testStatus === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : testStatus === 'error' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
            >
              {testStatus === 'testing' ? <Loader2 size={14} className="mr-2 animate-spin" /> : testStatus === 'success' ? <CheckCircle2 size={14} className="mr-2" /> : <Zap size={14} className="mr-2" />}
              Status IA
            </button>
          )}
          <button onClick={() => setShowContextInfo(v => !v)} data-testid="finn-context-btn"
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
            <BrainCircuit size={14} /> Contexto ativo
          </button>
          <button onClick={() => setShowHistory(v => !v)} data-testid="finn-history-btn"
            className={`p-3 rounded-xl transition-all ${showHistory ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <History size={20} />
          </button>
          <button onClick={clearChat} data-testid="finn-clear-btn"
            className="p-3 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Context Info Panel */}
      {showContextInfo && (() => {
        const ctx = getFinancialContext();
        return (
          <div className="bg-emerald-950/40 border-x border-b border-emerald-500/20 px-6 py-4 text-xs space-y-1">
            <p className="text-emerald-400 font-bold mb-2">📊 Contexto financeiro injetado automaticamente:</p>
            <p className="text-gray-300">Saldo: <span className="text-emerald-400 font-bold">{formatCurrency(ctx.summary.balance)}</span> · Renda: <span className="text-emerald-400">{formatCurrency(ctx.summary.monthlyIncome)}</span> · Gastos: <span className="text-rose-400">{formatCurrency(ctx.summary.monthlyExpense)}</span> · Poupança: <span className="text-blue-400">{ctx.summary.savingsRate.toFixed(1)}%</span></p>
            {Object.keys(ctx.categories).length > 0 && (
              <p className="text-gray-400">Top categorias: {Object.entries(ctx.categories).sort(([,a],[,b]) => b-a).slice(0,3).map(([k,v]) => `${k} (${formatCurrency(v)})`).join(' · ')}</p>
            )}
            {ctx.goals.length > 0 && (
              <p className="text-gray-400">Metas: {ctx.goals.map(g => `${g.name} (${Math.round(g.current/g.target*100)}%)`).join(' · ')}</p>
            )}
          </div>
        );
      })()}

      {/* History Panel */}
      {showHistory && (
        <div className="bg-black/60 border-x border-white/10 overflow-y-auto max-h-80 p-4 space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Histórico de conversas</p>
          {historyItems.length === 0
            ? <p className="text-xs text-gray-600 text-center py-4">Nenhuma conversa salva ainda</p>
            : historyItems.map(item => (
              <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-3 cursor-pointer hover:border-blue-500/30 transition-all"
                onClick={() => {
                  setMessages([
                    { id: 'h-q-'+item.id, role: 'user', content: item.prompt, timestamp: item.timestamp.getTime() },
                    { id: 'h-a-'+item.id, role: 'assistant', content: item.response, timestamp: item.timestamp.getTime() + 1 }
                  ]);
                  setHasGeneratedInsight(true); setShowHistory(false);
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-blue-400 truncate max-w-[80%]">{item.prompt}</span>
                  <span className="text-[10px] text-gray-600">{item.timestamp.toLocaleDateString('pt-BR')}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{item.response.substring(0, 100)}...</p>
              </div>
            ))}
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-black/40 border-x border-white/10 overflow-hidden relative">
        {!hasGeneratedInsight && (
          <FinnWelcomeScreen loading={loading} hasToken={hasToken} onStartDiagnosis={() => handleSend('Diagnóstico Inicial')} />
        )}
        <FinnMessageList
          messages={messages}
          loading={loading}
          error={error}
          userName={userProfile.name}
          scrollRef={scrollRef as React.RefObject<HTMLDivElement>}
          formatTime={formatTime}
        />
      </div>

      <FinnInputArea
        hasGeneratedInsight={hasGeneratedInsight}
        userMessageCount={userMessageCount}
        quickChips={quickChips}
        loading={loading}
        inputValue={inputValue}
        inputRef={inputRef as React.RefObject<HTMLTextAreaElement>}
        finnBlocked={finnBlocked}
        onSend={handleSend}
        onInputChange={setInputValue}
      />

      {/* Decorative blur */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full -z-10" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-500/10 blur-[100px] rounded-full -z-10" />
    </div>
  );
};
