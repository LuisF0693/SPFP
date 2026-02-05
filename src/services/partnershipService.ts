/**
 * Partnership Service
 * FASE 3: STY-076 (Partner Profiles & KPI Tracking) + STY-077 (Commission Models)
 *
 * Manages partner profiles, KPI tracking, and commission calculations
 */

import {
  Partner,
  PartnerKPI,
  PartnerCommission,
  CommissionModel,
  PartnerStatus,
  PartnerPerformance,
  CommissionRule
} from '../types/partnership';

const generateId = (): string => `partner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Calculate commission based on model and amount
 */
export const calculateCommission = (
  amount: number,
  rules: CommissionRule[],
  model: CommissionModel
): { amount: number; percentage: number } => {
  const rule = rules[0]; // Use first rule for simplicity
  if (!rule) return { amount: 0, percentage: 0 };

  switch (model) {
    case CommissionModel.PERCENTAGE:
      const percentage = rule.value;
      return {
        amount: (amount * percentage) / 100,
        percentage
      };

    case CommissionModel.FIXED:
      return {
        amount: rule.value,
        percentage: (rule.value / amount) * 100
      };

    case CommissionModel.TIERED:
      if (amount >= (rule.threshold || 0)) {
        const percentage = rule.value;
        return {
          amount: (amount * percentage) / 100,
          percentage
        };
      }
      return { amount: 0, percentage: 0 };

    case CommissionModel.HYBRID:
      // Fixed + percentage
      const fixedPart = rules[0]?.value || 0;
      const percentagePart = rules[1]?.value || 0;
      const total = fixedPart + (amount * percentagePart) / 100;
      return {
        amount: total,
        percentage: (total / amount) * 100
      };

    default:
      return { amount: 0, percentage: 0 };
  }
};

/**
 * Calculate KPI completion rate
 */
export const calculateKPICompletion = (kpis: PartnerKPI[]): number => {
  if (kpis.length === 0) return 0;
  const completed = kpis.filter(k => k.current >= k.target).length;
  return (completed / kpis.length) * 100;
};

/**
 * Partnership Service
 */
export const partnershipService = {
  /**
   * Create new partner
   */
  createPartner: (data: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>): Partner => {
    const now = new Date().toISOString();
    return {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now
    };
  },

  /**
   * Update partner
   */
  updatePartner: (partner: Partner, updates: Partial<Partner>): Partner => {
    return {
      ...partner,
      ...updates,
      updatedAt: new Date().toISOString()
    };
  },

  /**
   * Soft delete partner
   */
  deletePartner: (partner: Partner): Partner => {
    return {
      ...partner,
      deletedAt: Date.now()
    };
  },

  /**
   * Add KPI to partner
   */
  addKPI: (partner: Partner, kpi: Omit<PartnerKPI, 'id'>): Partner => {
    const newKPI: PartnerKPI = {
      id: generateId(),
      ...kpi
    };
    return {
      ...partner,
      kpis: [...partner.kpis, newKPI],
      updatedAt: new Date().toISOString()
    };
  },

  /**
   * Update KPI progress
   */
  updateKPI: (partner: Partner, kpiId: string, current: number): Partner => {
    return {
      ...partner,
      kpis: partner.kpis.map(k =>
        k.id === kpiId ? { ...k, current } : k
      ),
      updatedAt: new Date().toISOString()
    };
  },

  /**
   * Calculate monthly commission
   */
  calculateMonthlyCommission: (
    partner: Partner,
    aumGrowth: number
  ): PartnerCommission => {
    const commission = calculateCommission(
      aumGrowth,
      partner.commissionRules,
      partner.commissionModel
    );

    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    return {
      id: generateId(),
      partnerId: partner.id,
      amount: commission.amount,
      percentage: commission.percentage,
      period,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
  },

  /**
   * Calculate partner performance metrics
   */
  calculatePerformance: (
    partner: Partner,
    lastMonthAUM: number,
    thisMonthAUM: number
  ): PartnerPerformance => {
    const aumGrowth = ((thisMonthAUM - lastMonthAUM) / lastMonthAUM) * 100;

    return {
      partnerId: partner.id,
      partnerName: partner.name,
      aumGrowth,
      clientCount: partner.clientsManaged,
      currentCommission: partner.totalCommissions,
      monthlyCommissionAverage: partner.totalCommissions / 12,
      kpiCompletionRate: calculateKPICompletion(partner.kpis),
      lastMonthAUM,
      thisMonthAUM
    };
  },

  /**
   * Filter active partners
   */
  getActivePartners: (partners: Partner[]): Partner[] => {
    return partners
      .filter(p => !p.deletedAt && p.status === PartnerStatus.ACTIVE)
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  },

  /**
   * Get partners by status
   */
  getPartnersByStatus: (partners: Partner[], status: PartnerStatus): Partner[] => {
    return partners.filter(p => !p.deletedAt && p.status === status);
  },

  /**
   * Top performers by AUM
   */
  getTopPerformers: (partners: Partner[], limit: number = 5): Partner[] => {
    return partners
      .filter(p => !p.deletedAt)
      .sort((a, b) => b.totalAUM - a.totalAUM)
      .slice(0, limit);
  },

  /**
   * Calculate commission earnings for period
   */
  calculatePeriodEarnings: (
    commissions: PartnerCommission[],
    period: string
  ): number => {
    return commissions
      .filter(c => c.period === period && c.status === 'PAID')
      .reduce((sum, c) => sum + c.amount, 0);
  }
};

export default partnershipService;
