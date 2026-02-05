/**
 * Investment Portfolio Types
 * FASE 1: STY-063 (Investment Portfolio Data Model)
 *
 * Type definitions for investment assets and portfolio management
 */

/**
 * Asset Type Enum
 */
export enum AssetType {
  STOCKS = 'STOCKS',
  FUNDS = 'FUNDS',
  FIXED_INCOME = 'FIXED_INCOME',
  CRYPTO = 'CRYPTO',
  ETFS = 'ETFS',
  OTHER = 'OTHER'
}

/**
 * Investment Asset Interface
 * Represents a single investment holding
 */
export interface InvestmentAsset {
  id: string;
  userId?: string;
  name: string;
  assetType: AssetType;
  quantity: number;
  purchasePrice: number; // Price at which it was purchased
  currentPrice: number; // Current market price
  totalValue: number; // quantity * currentPrice
  purchaseValue: number; // quantity * purchasePrice
  dateAdded: string; // ISO date
  lastUpdated: string; // ISO date
  notes?: string;
  deletedAt?: number; // Soft delete timestamp
}

/**
 * Asset Type Display Config
 */
export interface AssetTypeConfig {
  label: string;
  color: string;
  icon: string;
}

/**
 * Asset Type Configurations
 */
export const ASSET_TYPE_CONFIG: Record<AssetType, AssetTypeConfig> = {
  [AssetType.STOCKS]: {
    label: 'Ações',
    color: '#3B82F6',
    icon: '📈'
  },
  [AssetType.FUNDS]: {
    label: 'Fundos',
    color: '#8B5CF6',
    icon: '💼'
  },
  [AssetType.FIXED_INCOME]: {
    label: 'Renda Fixa',
    color: '#10B981',
    icon: '💰'
  },
  [AssetType.CRYPTO]: {
    label: 'Criptos',
    color: '#F59E0B',
    icon: '₿'
  },
  [AssetType.ETFS]: {
    label: 'ETFs',
    color: '#EC4899',
    icon: '🎯'
  },
  [AssetType.OTHER]: {
    label: 'Outro',
    color: '#6B7280',
    icon: '📦'
  }
};

/**
 * Portfolio Summary
 */
export interface PortfolioSummary {
  totalAssets: number;
  totalValue: number;
  totalInvested: number;
  gain: number;
  gainPercentage: number;
  assetsByType: Record<AssetType, { count: number; value: number; percentage: number }>;
}

/**
 * Performance Indicator
 */
export interface PerformanceIndicator {
  assetId: string;
  gain: number; // Valor ganho/perdido
  gainPercentage: number; // Percentual de ganho/perda
  status: 'positive' | 'negative' | 'neutral';
}

/**
 * Default initial investment
 */
export const createDefaultInvestment = (partial?: Partial<InvestmentAsset>): InvestmentAsset => {
  const now = new Date().toISOString();
  return {
    id: `inv_${Date.now()}`,
    name: '',
    assetType: AssetType.STOCKS,
    quantity: 0,
    purchasePrice: 0,
    currentPrice: 0,
    totalValue: 0,
    purchaseValue: 0,
    dateAdded: now,
    lastUpdated: now,
    notes: '',
    ...partial
  };
};
