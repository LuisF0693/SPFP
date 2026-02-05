/**
 * Retirement Planning Types
 * FASE 2: STY-066 (Retirement Context & Calculations)
 */

export enum RetirementScenario {
  CONSERVATIVE = 'CONSERVATIVE',
  MODERATE = 'MODERATE',
  AGGRESSIVE = 'AGGRESSIVE'
}

export interface RetirementProjection {
  year: number;
  age: number;
  patrimony: number;
  contribution: number;
  yield: number;
  estimatedValue: number;
}

export interface RetirementPlan {
  id: string;
  userId?: string;
  targetDate: string; // ISO date
  targetAge: number;
  desiredMonthlyIncome: number;
  currentAge: number;
  currentPatrimony: number;
  monthlyContribution: number;
  inflationRate: number; // 2%, 4%, 6%
  createdAt: string;
  updatedAt: string;
}

export interface RetirementScenarioProjection {
  scenario: RetirementScenario;
  projections: RetirementProjection[];
  finalPatrimony: number;
  annualIncome: number;
  yearsToRetirement: number;
  averageReturn: number;
  color: string;
}

export const SCENARIO_CONFIG: Record<RetirementScenario, { label: string; color: string; returnRate: number }> = {
  [RetirementScenario.CONSERVATIVE]: {
    label: 'Conservador',
    color: '#F59E0B',
    returnRate: 0.05 // 5% ao ano
  },
  [RetirementScenario.MODERATE]: {
    label: 'Moderado',
    color: '#3B82F6',
    returnRate: 0.08 // 8% ao ano
  },
  [RetirementScenario.AGGRESSIVE]: {
    label: 'Agressivo',
    color: '#10B981',
    returnRate: 0.12 // 12% ao ano
  }
};
