/**
 * Investment Portfolio Service
 * FASE 1: STY-063 (Investment Portfolio Data Model)
 *
 * CRUD operations and calculations for investment management
 */

import { InvestmentAsset, PortfolioSummary, PerformanceIndicator, AssetType, ASSET_TYPE_CONFIG } from '../types/investment';
import { generateId } from '../utils';

/**
 * Calculate total value of investment
 */
export const calculateTotalValue = (quantity: number, currentPrice: number): number => {
  return quantity * currentPrice;
};

/**
 * Calculate purchase value of investment
 */
export const calculatePurchaseValue = (quantity: number, purchasePrice: number): number => {
  return quantity * purchasePrice;
};

/**
 * Calculate gain/loss for a single investment
 */
export const calculateGain = (investment: InvestmentAsset): number => {
  return investment.totalValue - investment.purchaseValue;
};

/**
 * Calculate gain percentage for a single investment
 */
export const calculateGainPercentage = (investment: InvestmentAsset): number => {
  if (investment.purchaseValue === 0) return 0;
  return ((investment.totalValue - investment.purchaseValue) / investment.purchaseValue) * 100;
};

/**
 * Get performance indicator for investment
 */
export const getPerformanceIndicator = (investment: InvestmentAsset): PerformanceIndicator => {
  const gainPercentage = calculateGainPercentage(investment);
  let status: 'positive' | 'negative' | 'neutral' = 'neutral';

  if (gainPercentage > 5) status = 'positive';
  else if (gainPercentage < -5) status = 'negative';

  return {
    assetId: investment.id,
    gain: calculateGain(investment),
    gainPercentage,
    status
  };
};

/**
 * Calculate portfolio summary
 */
export const calculatePortfolioSummary = (investments: InvestmentAsset[]): PortfolioSummary => {
  const active = investments.filter(i => !i.deletedAt);

  const totalValue = active.reduce((sum, inv) => sum + inv.totalValue, 0);
  const totalInvested = active.reduce((sum, inv) => sum + inv.purchaseValue, 0);
  const gain = totalValue - totalInvested;
  const gainPercentage = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;

  // Group by asset type
  const assetsByType: Record<AssetType, { count: number; value: number; percentage: number }> = {
    [AssetType.STOCKS]: { count: 0, value: 0, percentage: 0 },
    [AssetType.FUNDS]: { count: 0, value: 0, percentage: 0 },
    [AssetType.FIXED_INCOME]: { count: 0, value: 0, percentage: 0 },
    [AssetType.CRYPTO]: { count: 0, value: 0, percentage: 0 },
    [AssetType.ETFS]: { count: 0, value: 0, percentage: 0 },
    [AssetType.OTHER]: { count: 0, value: 0, percentage: 0 }
  };

  active.forEach(inv => {
    assetsByType[inv.assetType].count += 1;
    assetsByType[inv.assetType].value += inv.totalValue;
  });

  // Calculate percentages
  Object.keys(assetsByType).forEach(type => {
    const typeKey = type as AssetType;
    assetsByType[typeKey].percentage = totalValue > 0 ? (assetsByType[typeKey].value / totalValue) * 100 : 0;
  });

  return {
    totalAssets: active.length,
    totalValue,
    totalInvested,
    gain,
    gainPercentage,
    assetsByType
  };
};

/**
 * Investment Service
 */
export const investmentService = {
  /**
   * Create new investment
   */
  createInvestment: (data: Omit<InvestmentAsset, 'id' | 'dateAdded' | 'lastUpdated'>): InvestmentAsset => {
    const now = new Date().toISOString();
    return {
      id: generateId(),
      dateAdded: now,
      lastUpdated: now,
      totalValue: calculateTotalValue(data.quantity, data.currentPrice),
      purchaseValue: calculatePurchaseValue(data.quantity, data.purchasePrice),
      ...data
    };
  },

  /**
   * Update investment
   */
  updateInvestment: (investment: InvestmentAsset, updates: Partial<InvestmentAsset>): InvestmentAsset => {
    const updated = { ...investment, ...updates, lastUpdated: new Date().toISOString() };

    // Recalculate total values if quantity or prices changed
    if (updates.quantity !== undefined || updates.currentPrice !== undefined || updates.purchasePrice !== undefined) {
      updated.totalValue = calculateTotalValue(updated.quantity, updated.currentPrice);
      updated.purchaseValue = calculatePurchaseValue(updated.quantity, updated.purchasePrice);
    }

    return updated;
  },

  /**
   * Delete investment (soft delete)
   */
  deleteInvestment: (investment: InvestmentAsset): InvestmentAsset => {
    return { ...investment, deletedAt: Date.now() };
  },

  /**
   * Recover deleted investment
   */
  recoverInvestment: (investment: InvestmentAsset): InvestmentAsset => {
    const { deletedAt, ...rest } = investment;
    return rest as InvestmentAsset;
  },

  /**
   * Get total portfolio value
   */
  getTotalValue: (investments: InvestmentAsset[]): number => {
    return investments
      .filter(i => !i.deletedAt)
      .reduce((sum, inv) => sum + inv.totalValue, 0);
  },

  /**
   * Get total invested value
   */
  getTotalInvested: (investments: InvestmentAsset[]): number => {
    return investments
      .filter(i => !i.deletedAt)
      .reduce((sum, inv) => sum + inv.purchaseValue, 0);
  },

  /**
   * Get total gain/loss
   */
  getTotalGain: (investments: InvestmentAsset[]): number => {
    const summary = calculatePortfolioSummary(investments);
    return summary.gain;
  },

  /**
   * Get assets by type
   */
  getAssetsByType: (investments: InvestmentAsset[], assetType: AssetType): InvestmentAsset[] => {
    return investments.filter(i => i.assetType === assetType && !i.deletedAt);
  },

  /**
   * Sort investments
   */
  sortInvestments: (investments: InvestmentAsset[], sortBy: 'name' | 'type' | 'value' | 'gain'): InvestmentAsset[] => {
    const active = investments.filter(i => !i.deletedAt);

    switch (sortBy) {
      case 'name':
        return [...active].sort((a, b) => a.name.localeCompare(b.name));
      case 'type':
        return [...active].sort((a, b) => a.assetType.localeCompare(b.assetType));
      case 'value':
        return [...active].sort((a, b) => b.totalValue - a.totalValue);
      case 'gain':
        return [...active].sort((a, b) => calculateGainPercentage(b) - calculateGainPercentage(a));
      default:
        return active;
    }
  }
};

export default investmentService;
