import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';
import { CompanySquad, CompanyBoard, CompanyTask } from '../types/company';

const DEFAULT_SQUADS: Omit<CompanySquad, 'id' | 'user_id' | 'created_at'>[] = [
  { name: 'Marketing',        icon: '🎯', color: '#ec4899', description: 'Squad de Marketing e Growth',        is_archived: false, sort_order: 0 },
  { name: 'Vendas',           icon: '💰', color: '#10b981', description: 'Squad de Vendas e Closers',          is_archived: false, sort_order: 1 },
  { name: 'Produtos',         icon: '📦', color: '#3b82f6', description: 'Squad de Produto e Conteúdo',        is_archived: false, sort_order: 2 },
  { name: 'OPS',              icon: '⚙️', color: '#f59e0b', description: 'Squad de Operações e Processos',     is_archived: false, sort_order: 3 },
  { name: 'Customer Success', icon: '💬', color: '#8b5cf6', description: 'Squad de CS e Retenção',            is_archived: false, sort_order: 4 },
  { name: 'Admin',            icon: '🏛️', color: '#6b7280', description: 'Squad Administrativo e Financeiro', is_archived: false, sort_order: 5 },
];

type DefaultBoard = { name: string; icon: string; description: string };

type DefaultTask = {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags: string[];
  assignee_name?: string;
  due_date?: string;
};

// Tarefas padrão por board do squad Marketing (geradas pelo Squad de Marketing — Thiago Finch)
const DEFAULT_TASKS_BY_BOARD: Record<string, DefaultTask[]> = {
  'Estratégia': [
    {
      title: 'Configurar conta MailerLite',
      description: 'Criar conta gratuita em mailerlite.com (grátis até 1.000 contatos). Configurar remetente como "Luis | SPFP". Verificar domínio de email.',
      priority: 'URGENT',
      tags: ['email-marketing', 'setup'],
      assignee_name: 'Luis',
    },
    {
      title: 'Integrar Calendly → MailerLite',
      description: 'No MailerLite: Integrations → Webhooks → copiar URL. No Calendly: Integrations → Webhooks → colar URL. Evento "Invitee Created" → lista "Leads Consulta Gratuita".',
      priority: 'URGENT',
      tags: ['integração', 'setup'],
      assignee_name: 'Luis',
    },
    {
      title: 'Definir ICP em 1 página',
      description: 'Responder: Quem é o cliente ideal? Qual a dor principal? Qual o momento de vida? Onde está online? O que já tentou antes do SPFP? Ver template em docs/marketing/ICP-SPFP-2026.md',
      priority: 'URGENT',
      tags: ['estratégia', 'icp'],
      assignee_name: 'Thiago Finch',
    },
    {
      title: 'Adicionar link Calendly na bio do Instagram',
      description: 'Bio do Instagram pessoal do Luis: "Consultor Financeiro | SPFP — Conversa gratuita de 30min sobre suas finanças → [link Calendly]"',
      priority: 'HIGH',
      tags: ['instagram', 'setup'],
      assignee_name: 'Luis',
    },
    {
      title: 'Mapear 5 parceiros para indicação',
      description: 'Listar 5 parceiros que já têm contato com o ICP: contadores, coaches de carreira, RH de empresas, corretores de imóveis. Proposta: "Você tem clientes que precisam organizar as finanças. Eu cuido disso."',
      priority: 'HIGH',
      tags: ['parceria', 'aquisição'],
      assignee_name: 'Luis',
    },
    {
      title: 'Criar conta Meta Business Suite',
      description: 'Criar conta em business.facebook.com. Conectar Instagram pessoal e da empresa. Instalar Pixel no site SPFP (necessário para retargeting). NÃO ligar anúncios ainda — aguardar gate orgânico.',
      priority: 'MEDIUM',
      tags: ['meta-ads', 'setup'],
      assignee_name: 'Luis',
    },
  ],
  'Campanhas': [
    {
      title: '🎬 Reel 1 — "Você sabe quanto gastou esse mês?"',
      description: 'Gancho (0-3s): "Você sabe exatamente quanto gastou esse mês?"\nDesenvolvimento: falar sobre a falta de visibilidade financeira — não é descuido, é falta de sistema.\nCTA: "Conversa gratuita — link na bio."\nPostar no Instagram pessoal e repurpose na empresa.',
      priority: 'URGENT',
      tags: ['reel', 'instagram', 'semana-1'],
      assignee_name: 'Luis',
    },
    {
      title: '🎬 Reel 2 — "O cliente que ganhava R$8k e vivia no limite"',
      description: 'Caso real anonimizado. Estrutura: situação inicial → o que descobrimos → resultado em 3 meses. Não citar valores exatos sem permissão do cliente. Foco na transformação.',
      priority: 'URGENT',
      tags: ['reel', 'instagram', 'prova-social', 'semana-1'],
      assignee_name: 'Luis',
    },
    {
      title: '🎬 Reel 3 — "3 perguntas que faço em toda primeira consulta" + CTA',
      description: 'Revelar as 3 perguntas da consulta diagnóstica. Terminar com: "Se você quer responder essas perguntas sobre a sua vida, agenda uma conversa gratuita comigo — link na bio."\nEste é o Reel de conversão da semana 1.',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'conversão', 'semana-1'],
      assignee_name: 'Luis',
    },
    {
      title: '📺 YouTube — "Por que o dinheiro some no fim do mês"',
      description: 'Vídeo 8-15 minutos. Título SEO: "Por que o dinheiro some no fim do mês (não é falta de disciplina)". Thumbnail com rosto do Luis. Descrição com link Calendly. Capítulos no vídeo para retenção.',
      priority: 'HIGH',
      tags: ['youtube', 'seo', 'semana-1'],
      assignee_name: 'Luis',
    },
    {
      title: '🎬 Reel 4 — "Planilha do Excel: você cria no domingo, abandona na quarta"',
      description: 'Semana 2. Angle: por que planilha não funciona — não é fraqueza, é que ela só registra, não orienta. Comparar com o SPFP + Finn de forma sutil.',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'semana-2'],
      assignee_name: 'Luis',
    },
    {
      title: '🎬 Reel 5 — "O que separa quem guarda dinheiro de quem não consegue"',
      description: 'Semana 2. Angle: não é disciplina, é clareza e sistema. Quem guarda dinheiro não é mais esforçado — tem mais visibilidade sobre os gastos.',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'semana-2'],
      assignee_name: 'Luis',
    },
    {
      title: '🎬 Reel 6 — "Como o Finn faz em 15s o que a planilha não fez em 2 anos" + CTA',
      description: 'Semana 2 — Reel de conversão. Mostrar o Finn em ação (tela do produto). CTA direto para a consulta gratuita. Este é o Reel de conversão da semana 2.',
      priority: 'HIGH',
      tags: ['reel', 'instagram', 'produto', 'conversão', 'semana-2'],
      assignee_name: 'Luis',
    },
    {
      title: '🤝 Abordar 3 parceiros com proposta de indicação',
      description: 'Script: "Você tem clientes que precisam organizar as finanças. Eu cuido disso. Posso ser o seu parceiro de indicação — sem exclusividade, sem custo para você. Ofereço comissão por indicação convertida ou sessão gratuita para sua base." Alvo: contadores, coaches, RH.',
      priority: 'MEDIUM',
      tags: ['parceria', 'aquisição', 'semana-2'],
      assignee_name: 'Luis',
    },
    {
      title: '📅 Stories semanais — CTA Calendly (toda sexta)',
      description: 'Todo domingo agendar 3 stories para sexta: 1) "Tenho [X] vagas abertas essa semana" 2) Enquete sobre dor financeira 3) Link Calendly. Ver templates em docs/marketing/CALENDARIO-EDITORIAL-90-DIAS.md',
      priority: 'MEDIUM',
      tags: ['stories', 'instagram', 'recorrente'],
      assignee_name: 'Luis',
    },
  ],
  'Análise': [
    {
      title: 'Montar dashboard semanal de métricas',
      description: 'Criar planilha simples (Google Sheets) com: Seguidores pessoal, Alcance Reels, Cliques bio, Agendamentos Calendly, Consultas realizadas, Taxa de fechamento, Novos clientes. Preencher toda segunda-feira.',
      priority: 'HIGH',
      tags: ['métricas', 'setup'],
      assignee_name: 'Thiago Finch',
    },
    {
      title: 'Review 30 dias — Gate para tráfego pago',
      description: 'Em 2026-04-07: analisar resultado orgânico. Gate: 2+ clientes fechados via orgânico OU landing page com CR ≥ 3%. Se gate atingido → ativar Meta Ads R$30/dia. Se não → revisar ângulo de copy e canal.',
      priority: 'HIGH',
      tags: ['review', 'gate', 'meta-ads'],
      assignee_name: 'Thiago Finch',
    },
    {
      title: 'Definir CAC máximo antes de ligar Meta Ads',
      description: 'Plano Essencial: LTV R$1.998 → CAC máximo R$666. Plano Wealth: LTV R$6.998 → CAC máximo R$2.333. CAC alvo operacional: < R$400. CPL alvo (consulta agendada): R$30-50. Registrar na planilha de métricas.',
      priority: 'HIGH',
      tags: ['métricas', 'financeiro', 'meta-ads'],
      assignee_name: 'Thiago Finch',
    },
    {
      title: 'Review 60 dias — Resultado Meta Ads',
      description: 'Em 2026-05-07: analisar 4 semanas de tráfego pago. Verificar: CTR > 1%? CPL < R$50? CAC < R$400? Taxa de fechamento > 30%? Se sim → escalar. Se não → diagnosticar funil.',
      priority: 'MEDIUM',
      tags: ['review', 'meta-ads'],
      assignee_name: 'Thiago Finch',
    },
    {
      title: 'Review trimestral — CAC, LTV, Churn, MRR',
      description: 'Em 2026-06-07: revisão completa. LTV/CAC ≥ 3x? Churn < 5%/mês? MRR crescendo? Payback < 6 meses? Decisão sobre escala, pivô de canal ou revisão de oferta.',
      priority: 'LOW',
      tags: ['review', 'trimestral', 'financeiro'],
      assignee_name: 'Thiago Finch',
    },
  ],
};

const DEFAULT_BOARDS_BY_SQUAD: Record<string, DefaultBoard[]> = {
  'Marketing': [
    { name: 'Estratégia',  icon: '🗺️', description: 'Planejamento estratégico e calendário' },
    { name: 'Campanhas',   icon: '📣', description: 'Campanhas ativas de tráfego e conteúdo' },
    { name: 'Análise',     icon: '📊', description: 'Métricas, resultados e relatórios' },
  ],
  'Vendas': [
    { name: 'Prospecção',  icon: '🔍', description: 'Leads sendo prospectados' },
    { name: 'Pipeline',    icon: '🔄', description: 'Negociações em andamento' },
    { name: 'Propostas',   icon: '📄', description: 'Propostas enviadas aguardando resposta' },
    { name: 'Fechamento',  icon: '🤝', description: 'Em fase de fechamento e assinatura' },
  ],
  'Produtos': [
    { name: 'Discovery',      icon: '🔬', description: 'Pesquisa, entrevistas e validação' },
    { name: 'Backlog',        icon: '📋', description: 'Funcionalidades priorizadas para desenvolvimento' },
    { name: 'Desenvolvimento',icon: '⚡', description: 'Em desenvolvimento ativo' },
    { name: 'QA & Lançamento',icon: '🚀', description: 'Testes e publicação de funcionalidades' },
  ],
  'OPS': [
    { name: 'Mapeamento',    icon: '🗺️', description: 'Mapeamento de processos do fim pro começo' },
    { name: 'Automações',    icon: '🤖', description: 'Integrações N8N, ClickUp e webhooks' },
    { name: 'Documentação',  icon: '📝', description: 'SOPs, playbooks e guias operacionais' },
    { name: 'Quality Check', icon: '✅', description: 'Auditoria e validação de processos' },
  ],
  'Customer Success': [
    { name: 'Onboarding',   icon: '🎉', description: 'Novos clientes em processo de onboarding' },
    { name: 'Health Check', icon: '💚', description: 'Monitoramento de saúde e engajamento' },
    { name: 'Suporte',      icon: '🎧', description: 'Tickets abertos N1/N2/N3' },
    { name: 'Retenção',     icon: '🛡️', description: 'Clientes em risco de churn' },
  ],
  'Admin': [
    { name: 'Financeiro',   icon: '💵', description: 'Contas a pagar/receber e fluxo de caixa' },
    { name: 'Jurídico',     icon: '⚖️', description: 'Contratos, compliance e LGPD' },
    { name: 'RH & People',  icon: '👥', description: 'Time, recrutamento e onboarding interno' },
    { name: 'Ferramentas',  icon: '🔧', description: 'SaaS, acessos e infraestrutura' },
  ],
};

interface CompanyContextValue {
  // Squads
  squads: CompanySquad[];
  isLoading: boolean;
  addSquad: (data: Omit<CompanySquad, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateSquad: (id: string, data: Partial<CompanySquad>) => Promise<void>;
  archiveSquad: (id: string) => Promise<void>;
  // Boards
  boards: CompanyBoard[];
  boardsLoading: boolean;
  loadBoards: (squadId: string) => Promise<void>;
  addBoard: (data: Omit<CompanyBoard, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateBoard: (id: string, data: Partial<CompanyBoard>) => Promise<void>;
  archiveBoard: (id: string) => Promise<void>;
  // Tasks
  tasks: CompanyTask[];
  tasksLoading: boolean;
  loadTasks: (boardId: string) => Promise<void>;
  addTask: (data: Omit<CompanyTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<CompanyTask>;
  updateTask: (id: string, data: Partial<CompanyTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export const useCompany = () => {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used inside CompanyProvider');
  return ctx;
};

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [squads, setSquads] = useState<CompanySquad[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [boards, setBoards] = useState<CompanyBoard[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(false);
  const [tasks, setTasks] = useState<CompanyTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // ---- Squads ----
  const seedDefaultSquads = useCallback(async (userId: string) => {
    const { data: existing } = await supabase
      .from('company_squads')
      .select('id')
      .eq('user_id', userId);

    if (!existing || existing.length === 0) {
      const rows = DEFAULT_SQUADS.map((s) => ({ ...s, user_id: userId }));
      await supabase.from('company_squads').insert(rows);
    }
  }, []);

  const loadSquads = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      await seedDefaultSquads(userId);
      const { data, error } = await supabase
        .from('company_squads')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('sort_order');

      if (error) throw error;
      setSquads(data || []);
    } catch (err) {
      console.error('[CompanyContext] Error loading squads:', err);
    } finally {
      setIsLoading(false);
    }
  }, [seedDefaultSquads]);

  useEffect(() => {
    if (user) {
      void loadSquads(user.id);
    } else {
      setSquads([]);
      setBoards([]);
    }
  }, [user, loadSquads]);

  const addSquad = useCallback(async (data: Omit<CompanySquad, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { data: inserted, error } = await supabase
      .from('company_squads')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    setSquads((prev) => [...prev, inserted].sort((a, b) => a.sort_order - b.sort_order));
  }, [user]);

  const updateSquad = useCallback(async (id: string, data: Partial<CompanySquad>) => {
    const { data: updated, error } = await supabase
      .from('company_squads')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setSquads((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }, []);

  const archiveSquad = useCallback(async (id: string) => {
    await updateSquad(id, { is_archived: true });
    setSquads((prev) => prev.filter((s) => s.id !== id));
  }, [updateSquad]);

  // ---- Boards ----
  const seedDefaultBoards = useCallback(async (squadId: string, userId: string) => {
    // Descobre o nome do squad para saber quais boards criar
    const { data: squad } = await supabase
      .from('company_squads')
      .select('name')
      .eq('id', squadId)
      .single();

    if (!squad) return;
    const templates = DEFAULT_BOARDS_BY_SQUAD[squad.name];
    if (!templates) return;

    const rows = templates.map((b, i) => ({
      squad_id: squadId,
      user_id: userId,
      name: b.name,
      icon: b.icon,
      description: b.description,
      is_archived: false,
      sort_order: i,
    }));
    await supabase.from('company_boards').insert(rows);
  }, []);

  const loadBoards = useCallback(async (squadId: string) => {
    if (!squadId) return;
    setBoardsLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_boards')
        .select('*')
        .eq('squad_id', squadId)
        .eq('is_archived', false)
        .order('sort_order');
      if (error) throw error;

      // Se não há boards, faz seed automático
      if (!data || data.length === 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await seedDefaultBoards(squadId, user.id);
          const { data: seeded } = await supabase
            .from('company_boards')
            .select('*')
            .eq('squad_id', squadId)
            .eq('is_archived', false)
            .order('sort_order');
          setBoards(seeded || []);
          return;
        }
      }

      setBoards(data || []);
    } catch (err) {
      console.error('[CompanyContext] Error loading boards:', err);
    } finally {
      setBoardsLoading(false);
    }
  }, [seedDefaultBoards]);

  const addBoard = useCallback(async (data: Omit<CompanyBoard, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const { data: inserted, error } = await supabase
      .from('company_boards')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    setBoards((prev) => [...prev, inserted].sort((a, b) => a.sort_order - b.sort_order));
  }, [user]);

  const updateBoard = useCallback(async (id: string, data: Partial<CompanyBoard>) => {
    const { data: updated, error } = await supabase
      .from('company_boards')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setBoards((prev) => prev.map((b) => (b.id === id ? updated : b)));
  }, []);

  const archiveBoard = useCallback(async (id: string) => {
    await updateBoard(id, { is_archived: true });
    setBoards((prev) => prev.filter((b) => b.id !== id));
  }, [updateBoard]);

  // ---- Tasks ----
  const seedDefaultTasks = useCallback(async (boardId: string, userId: string) => {
    // Descobre o nome do board para saber quais tasks criar
    const { data: board } = await supabase
      .from('company_boards')
      .select('name')
      .eq('id', boardId)
      .single();

    if (!board) return;
    const templates = DEFAULT_TASKS_BY_BOARD[board.name];
    if (!templates || templates.length === 0) return;

    const rows = templates.map((t, i) => ({
      board_id: boardId,
      user_id: userId,
      title: t.title,
      description: t.description,
      status: 'TODO' as const,
      priority: t.priority,
      assignee_name: t.assignee_name ?? null,
      assignee_id: null,
      assignee_avatar: null,
      tags: t.tags,
      due_date: t.due_date ?? null,
      sort_order: i,
    }));
    await supabase.from('company_tasks').insert(rows);
  }, []);

  const loadTasks = useCallback(async (boardId: string) => {
    setTasksLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_tasks')
        .select('*')
        .eq('board_id', boardId)
        .order('sort_order');
      if (error) throw error;

      // Se não há tasks, faz seed automático (apenas para boards do squad Marketing)
      if (!data || data.length === 0) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await seedDefaultTasks(boardId, authUser.id);
          const { data: seeded } = await supabase
            .from('company_tasks')
            .select('*')
            .eq('board_id', boardId)
            .order('sort_order');
          setTasks(seeded || []);
          return;
        }
      }

      setTasks(data || []);
    } catch (err) {
      console.error('[CompanyContext] Error loading tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  }, [seedDefaultTasks]);

  const addTask = useCallback(async (data: Omit<CompanyTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CompanyTask> => {
    if (!user) throw new Error('Not authenticated');
    const { data: inserted, error } = await supabase
      .from('company_tasks')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    setTasks((prev) => [...prev, inserted].sort((a, b) => a.sort_order - b.sort_order));
    return inserted;
  }, [user]);

  const updateTask = useCallback(async (id: string, data: Partial<CompanyTask>) => {
    const { data: updated, error } = await supabase
      .from('company_tasks')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('company_tasks').delete().eq('id', id);
    if (error) throw error;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <CompanyContext.Provider value={{
      squads, isLoading, addSquad, updateSquad, archiveSquad,
      boards, boardsLoading, loadBoards, addBoard, updateBoard, archiveBoard,
      tasks, tasksLoading, loadTasks, addTask, updateTask, deleteTask,
    }}>
      {children}
    </CompanyContext.Provider>
  );
};
