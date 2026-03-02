export interface SPFPAgent {
  id: string;
  name: string;
  avatar: string; // emoji
  squad: string;
  role: 'agent' | 'human';
  description?: string;
}

export const SPFP_AGENTS: SPFPAgent[] = [
  {
    id: 'agent-marketing',
    name: 'Thiago Finch',
    avatar: '🎯',
    squad: 'Marketing',
    role: 'agent',
    description: 'AI Head de Marketing — Performance, tráfego e crescimento',
  },
  {
    id: 'agent-vendas',
    name: 'Alex Hormozi',
    avatar: '💰',
    squad: 'Vendas',
    role: 'agent',
    description: 'AI Head de Vendas — Offer design, pipeline e fechamento',
  },
  {
    id: 'agent-ops',
    name: 'Pedro Valerio',
    avatar: '⚙️',
    squad: 'OPS',
    role: 'agent',
    description: 'AI Head de OPS — Processos, ClickUp e automações',
  },
  {
    id: 'agent-admin',
    name: 'Sheryl Sandberg',
    avatar: '🏛️',
    squad: 'Admin',
    role: 'agent',
    description: 'AI Head de Admin — Backoffice, financeiro e compliance',
  },
  {
    id: 'agent-produtos',
    name: 'Marty Cagan',
    avatar: '📦',
    squad: 'Produtos',
    role: 'agent',
    description: 'AI Head de Produtos — Discovery, roadmap e qualidade',
  },
  {
    id: 'agent-cs',
    name: 'Lincoln Murphy',
    avatar: '💬',
    squad: 'CS',
    role: 'agent',
    description: 'AI Head de CS — Onboarding, retenção e churn prevention',
  },
];
