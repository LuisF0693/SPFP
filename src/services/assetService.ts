/**
 * Asset Acquisition Service
 * FASE 2: STY-071 (Asset Acquisition Data Model & Calculations)
 *
 * Calculates buy vs rent scenarios and comparisons
 */

import {
  Asset,
  AssetCategory,
  AssetCondition,
  AcquisitionScenario,
  AcquisitionType,
  AssetComparison
} from '../types/assets';

const generateId = (): string => `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Calculate total cost over 30 years for a scenario
 */
const calculateTotalCost30Years = (scenario: AcquisitionScenario): number => {
  const months = 30 * 12; // 30 years

  if (scenario.type === AcquisitionType.BUY) {
    // Buy: initial + (monthly payment * remaining months) + maintenance
    const monthsRemaining = Math.max(0, months - scenario.loanTerm);
    const loanPayments = scenario.monthlyPayment * scenario.loanTerm;
    const maintenanceTotal = scenario.maintenanceCost * 30; // Annual to total
    return scenario.initialPayment + loanPayments + maintenanceTotal;
  } else {
    // Rent: (monthly payment * 360 months) + initial deposit
    return scenario.initialPayment + scenario.monthlyPayment * months;
  }
};

/**
 * Calculate break-even point (when buy cost = rent cost)
 */
const calculateBreakEvenMonths = (
  buyScenario: AcquisitionScenario,
  rentScenario: AcquisitionScenario
): number => {
  const buyMonthly = (buyScenario.initialPayment + buyScenario.maintenanceCost / 12) / buyScenario.loanTerm + buyScenario.monthlyPayment;
  const rentMonthly = rentScenario.monthlyPayment;

  if (buyMonthly <= rentMonthly) {
    return 0; // Buy is always cheaper
  }

  const monthlyDifference = buyMonthly - rentMonthly;
  const initialDifference = rentScenario.initialPayment - buyScenario.initialPayment;

  return Math.ceil(initialDifference / monthlyDifference);
};

/**
 * Asset Service
 */
export const assetService = {
  /**
   * Create new asset with buy and rent scenarios
   */
  createAsset: (data: Omit<Asset, 'id' | 'dateAdded' | 'lastUpdated'>): Asset => {
    const asset: Asset = {
      id: generateId(),
      ...data,
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // Calculate total costs for each scenario
    asset.scenarios = asset.scenarios.map(scenario => ({
      ...scenario,
      totalCost30Years: calculateTotalCost30Years(scenario)
    }));

    // Determine best scenario
    const buyScenario = asset.scenarios.find(s => s.type === AcquisitionType.BUY);
    const rentScenario = asset.scenarios.find(s => s.type === AcquisitionType.RENT);

    if (buyScenario && rentScenario) {
      asset.bestScenario =
        buyScenario.totalCost30Years < rentScenario.totalCost30Years ? AcquisitionType.BUY : AcquisitionType.RENT;
    }

    return asset;
  },

  /**
   * Update asset
   */
  updateAsset: (asset: Asset, updates: Partial<Asset>): Asset => {
    const updated = { ...asset, ...updates, lastUpdated: new Date().toISOString() };

    // Recalculate total costs
    if (updated.scenarios) {
      updated.scenarios = updated.scenarios.map(scenario => ({
        ...scenario,
        totalCost30Years: calculateTotalCost30Years(scenario)
      }));

      // Update best scenario
      const buyScenario = updated.scenarios.find(s => s.type === AcquisitionType.BUY);
      const rentScenario = updated.scenarios.find(s => s.type === AcquisitionType.RENT);

      if (buyScenario && rentScenario) {
        updated.bestScenario =
          buyScenario.totalCost30Years < rentScenario.totalCost30Years ? AcquisitionType.BUY : AcquisitionType.RENT;
      }
    }

    return updated;
  },

  /**
   * Soft delete asset
   */
  deleteAsset: (asset: Asset): Asset => {
    return { ...asset, deletedAt: Date.now() };
  },

  /**
   * Get asset comparison
   */
  getAssetComparison: (asset: Asset): AssetComparison | null => {
    const buyScenario = asset.scenarios.find(s => s.type === AcquisitionType.BUY);
    const rentScenario = asset.scenarios.find(s => s.type === AcquisitionType.RENT);

    if (!buyScenario || !rentScenario) return null;

    const buyTotal = buyScenario.totalCost30Years;
    const rentTotal = rentScenario.totalCost30Years;
    const difference = Math.abs(buyTotal - rentTotal);

    let savingsWith: 'BUY' | 'RENT' | 'SIMILAR';
    if (difference < rentTotal * 0.05) {
      // Less than 5% difference
      savingsWith = 'SIMILAR';
    } else {
      savingsWith = buyTotal < rentTotal ? 'BUY' : 'RENT';
    }

    return {
      assetId: asset.id,
      assetName: asset.name,
      buyScenario,
      rentScenario,
      savingsWith,
      savingsAmount: difference,
      breakEvenMonths: calculateBreakEvenMonths(buyScenario, rentScenario)
    };
  },

  /**
   * Get all active assets
   */
  getActiveAssets: (assets: Asset[]): Asset[] => {
    return assets.filter(a => !a.deletedAt);
  },

  /**
   * Get assets by category
   */
  getAssetsByCategory: (assets: Asset[], category: AssetCategory): Asset[] => {
    return assets.filter(a => !a.deletedAt && a.category === category);
  },

  /**
   * Calculate total asset value (sum of purchase prices)
   */
  calculateTotalValue: (assets: Asset[]): number => {
    return assets
      .filter(a => !a.deletedAt)
      .reduce((sum, asset) => sum + asset.purchasePrice, 0);
  },

  /**
   * Get assets summary by category
   */
  getAssetsSummary: (assets: Asset[]): Record<string, { count: number; total: number }> => {
    const active = assetService.getActiveAssets(assets);
    const summary: Record<string, { count: number; total: number }> = {};

    Object.values(AssetCategory).forEach(category => {
      const categoryAssets = active.filter(a => a.category === category);
      summary[category] = {
        count: categoryAssets.length,
        total: categoryAssets.reduce((sum, a) => sum + a.purchasePrice, 0)
      };
    });

    return summary;
  }
};

export default assetService;
