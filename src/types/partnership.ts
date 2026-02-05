/**
 * Partnership Management Types
 * FASE 3: STY-076 (Partner Profiles & KPI Tracking)
 */

export enum CommissionModel {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
  TIERED = 'TIERED',
  HYBRID = 'HYBRID'
}

export enum PartnerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}

export interface CommissionRule {
  id: string;
  model: CommissionModel;
  value: number; // percentage or fixed amount
  threshold?: number; // for tiered
  tier?: number; // for tiered models
}

export interface PartnerKPI {
  id: string;
  partnerId: string;
  metric: 'AUM_GROWTH' | 'CLIENT_ACQUISITION' | 'RETENTION_RATE' | 'SATISFACTION';
  target: number;
  current: number;
  period: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  startDate: string;
  endDate: string;
}

export interface PartnerCommission {
  id: string;
  partnerId: string;
  amount: number;
  percentage: number;
  period: string;
  status: 'PENDING' | 'APPROVED' | 'PAID';
  paidDate?: string;
  createdAt: string;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: PartnerStatus;
  commissionModel: CommissionModel;
  commissionRules: CommissionRule[];
  kpis: PartnerKPI[];
  clientsManaged: number;
  totalAUM: number;
  totalCommissions: number;
  joinDate: string;
  lastActivity: string;
  notes?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: number;
}

export interface PartnerPerformance {
  partnerId: string;
  partnerName: string;
  aumGrowth: number;
  clientCount: number;
  currentCommission: number;
  monthlyCommissionAverage: number;
  kpiCompletionRate: number;
  lastMonthAUM: number;
  thisMonthAUM: number;
}
