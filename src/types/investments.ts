// ============================================
// SPFP Evolution v2.0 - Investment Types
// ============================================

export type InvestmentType =
  | 'tesouro'
  | 'cdb'
  | 'lci'
  | 'lca'
  | 'renda_fixa'
  | 'acao'
  | 'stock'
  | 'reit'
  | 'fii'
  | 'etf'
  | 'fundo';

export type Currency = 'BRL' | 'USD';

export type Liquidity = 'D+0' | 'D+1' | 'D+30' | 'D+60' | 'D+90' | 'maturity';

export type RateType = 'pre' | 'pos_cdi' | 'ipca';

export type FundType = 'rf' | 'rv' | 'multi' | 'cambial';

export type TesouroDiretoType = 'selic' | 'ipca' | 'prefixado';

export interface Investment {
  id: string;
  user_id: string;

  // Identification
  name: string;
  ticker?: string;
  type: InvestmentType;

  // Values
  quantity: number;
  average_price: number;
  current_price?: number;
  currency: Currency;

  // Type-specific details
  institution?: string; // Broker/Bank
  rate?: number; // Rate (% or % CDI)
  rate_type?: RateType;
  maturity_date?: string; // Vencimento
  liquidity?: Liquidity;

  // Tesouro specific
  tesouro_type?: TesouroDiretoType;

  // Funds specific
  cnpj?: string;
  fund_type?: FundType;
  fund_manager?: string; // Gestora

  // Linking
  goal_id?: string;
  is_retirement: boolean;

  // Metadata
  notes?: string;
  created_at: string;
  updated_at: string;

  // Computed (client-side)
  total_value?: number;
  return_percentage?: number;
  return_value?: number;
}

export interface RetirementSettings {
  id: string;
  user_id: string;

  current_age: number;
  retirement_age: number;
  life_expectancy?: number;

  annual_return_rate: number; // %
  inflation_rate: number; // %

  monthly_contribution: number;
  desired_monthly_income: number;
  current_patrimony?: number;

  created_at?: string;
  updated_at?: string;
}

export interface RetirementProjection {
  age: number;
  year: number;
  balance: number;
  phase: 'accumulation' | 'withdrawal';
  contribution: number;
  withdrawal: number;
}

export interface Partner {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  default_commission_rate: number;
  created_at: string;
  updated_at: string;
}

export interface PartnershipClient {
  id: string;
  user_id: string;
  partner_id: string;
  partner?: Partner;

  client_name: string;
  contract_value: number;
  commission_rate: number;

  // Computed
  total_commission: number;
  my_share: number;
  partner_share: number;

  status: 'pending' | 'paid';
  closed_at: string;
  created_at: string;
}

export interface GoalInvestmentSummary {
  goal_id: string;
  goal_name: string;
  target_value: number;
  invested_amount: number;
  progress_percentage: number;
  investments: Investment[];
}

// Default values for retirement settings
export const DEFAULT_RETIREMENT_SETTINGS: Omit<RetirementSettings, 'id' | 'user_id'> = {
  current_age: 30,
  retirement_age: 65,
  life_expectancy: 100,
  annual_return_rate: 8.0,
  inflation_rate: 4.5,
  monthly_contribution: 0,
  desired_monthly_income: 0,
};

// Investment type labels in Portuguese
export const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  tesouro: 'Tesouro Direto',
  cdb: 'CDB',
  lci: 'LCI',
  lca: 'LCA',
  renda_fixa: 'Renda Fixa',
  acao: 'Ações',
  stock: 'Stocks (USD)',
  reit: 'REITs (USD)',
  fii: 'FIIs',
  etf: 'ETF',
  fundo: 'Fundos',
};

// Investment category mapping
export const INVESTMENT_CATEGORIES: Record<InvestmentType, string> = {
  tesouro: 'Renda Fixa',
  cdb: 'Renda Fixa',
  lci: 'Renda Fixa',
  lca: 'Renda Fixa',
  renda_fixa: 'Renda Fixa',
  acao: 'Renda Variável',
  stock: 'Internacional',
  reit: 'Internacional',
  fii: 'FIIs',
  etf: 'Renda Variável',
  fundo: 'Fundos',
};

// Liquidity labels
export const LIQUIDITY_LABELS: Record<Liquidity, string> = {
  'D+0': 'D+0 (Imediato)',
  'D+1': 'D+1',
  'D+30': 'D+30',
  'D+60': 'D+60',
  'D+90': 'D+90',
  'maturity': 'No Vencimento',
};
