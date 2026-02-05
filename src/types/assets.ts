/**
 * Asset Acquisition Types
 * FASE 2: STY-071 (Asset Acquisition Data Model)
 *
 * Supports buy vs rent comparison analysis
 */

export enum AssetCategory {
  REAL_ESTATE = 'REAL_ESTATE',
  VEHICLE = 'VEHICLE',
  MOTORCYCLE = 'MOTORCYCLE',
  ELECTRONICS = 'ELECTRONICS',
  FURNITURE = 'FURNITURE',
  OTHER = 'OTHER'
}

export enum AssetCondition {
  NEW = 'NEW',
  USED = 'USED'
}

export enum AcquisitionType {
  BUY = 'BUY',
  RENT = 'RENT'
}

export interface AcquisitionScenario {
  id: string;
  type: AcquisitionType;
  initialPayment: number; // Entrada ou depósito caução
  monthlyPayment: number; // Financiamento ou aluguel
  loanTerm: number; // Meses para pagar (se for financiamento)
  interestRate: number; // Taxa anual (se financiamento)
  maintenanceCost: number; // Manutenção anual
  totalCost30Years: number; // Calculado
  depreciationRate?: number; // Depreciação anual (para compra)
  residualValue?: number; // Valor residual após 30 anos
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  condition: AssetCondition;
  purchasePrice: number; // Preço de compra ou aluguel base
  notes?: string;
  scenarios: AcquisitionScenario[];
  bestScenario?: AcquisitionType;
  dateAdded: string;
  lastUpdated: string;
  deletedAt?: number;
}

export interface AssetComparison {
  assetId: string;
  assetName: string;
  buyScenario: AcquisitionScenario;
  rentScenario: AcquisitionScenario;
  savingsWith: 'BUY' | 'RENT' | 'SIMILAR';
  savingsAmount: number;
  breakEvenMonths: number; // Quantos meses até buy = rent
}

export const ASSET_CATEGORY_CONFIG: Record<AssetCategory, { label: string; icon: string; color: string }> = {
  [AssetCategory.REAL_ESTATE]: {
    label: 'Imóvel',
    icon: 'Home',
    color: '#8B5CF6'
  },
  [AssetCategory.VEHICLE]: {
    label: 'Carro',
    icon: 'Car',
    color: '#3B82F6'
  },
  [AssetCategory.MOTORCYCLE]: {
    label: 'Moto',
    icon: 'Bike',
    color: '#EC4899'
  },
  [AssetCategory.ELECTRONICS]: {
    label: 'Eletrônicos',
    icon: 'Smartphone',
    color: '#14B8A6'
  },
  [AssetCategory.FURNITURE]: {
    label: 'Móvel',
    icon: 'Sofa',
    color: '#F59E0B'
  },
  [AssetCategory.OTHER]: {
    label: 'Outro',
    icon: 'Package',
    color: '#6B7280'
  }
};
