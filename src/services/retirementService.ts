/**
 * Retirement Planning Service
 * FASE 2: STY-066 (Retirement Context & Calculations)
 *
 * Calculates retirement projections using future value formula:
 * FV = PV * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
 */

import {
  RetirementPlan,
  RetirementProjection,
  RetirementScenario,
  RetirementScenarioProjection,
  SCENARIO_CONFIG
} from '../types/retirement';

/**
 * Calculate future value using compound interest formula
 * FV = PV * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
 */
const calculateFutureValue = (
  presentValue: number,
  monthlyPayment: number,
  annualRate: number,
  years: number
): number => {
  const monthlyRate = annualRate / 12;
  const months = years * 12;

  if (monthlyRate === 0) {
    return presentValue + monthlyPayment * months;
  }

  const fv = presentValue * Math.pow(1 + monthlyRate, months) +
    monthlyPayment * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;

  return fv;
};

/**
 * Calculate retirement projection for a specific scenario
 */
export const calculateRetirementProjection = (
  plan: RetirementPlan,
  scenario: RetirementScenario
): RetirementScenarioProjection => {
  const config = SCENARIO_CONFIG[scenario];
  const projections: RetirementProjection[] = [];

  const startDate = new Date();
  const targetDate = new Date(plan.targetDate);
  const totalYears = Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365));

  let currentPatrimony = plan.currentPatrimony;
  const monthlyRate = config.returnRate / 12;

  for (let year = 0; year <= totalYears + 5; year++) {
    const age = plan.currentAge + year;
    const months = year * 12;

    // Calculate patrimony at this year
    const monthlyPayment = plan.monthlyContribution;
    let patrimony = calculateFutureValue(
      plan.currentPatrimony,
      monthlyPayment,
      config.returnRate,
      year
    );

    // Apply inflation
    const inflationFactor = Math.pow(1 + plan.inflationRate, year);
    const adjustedIncome = plan.desiredMonthlyIncome * inflationFactor;

    // Calculate annual yield
    const monthlyYield = currentPatrimony * monthlyRate;
    const annualYield = monthlyYield * 12;

    projections.push({
      year,
      age,
      patrimony,
      contribution: monthlyPayment * 12,
      yield: annualYield,
      estimatedValue: patrimony
    });

    currentPatrimony = patrimony;
  }

  // Calculate summary metrics
  const finalProjection = projections[projections.length - 1];
  const targetProjection = projections.find(p => p.year >= totalYears);

  const finalPatrimony = finalProjection?.patrimony || 0;
  const monthlyAnnualIncome = plan.desiredMonthlyIncome * 12;
  const yearsToRetirement = totalYears;
  const averageReturn = config.returnRate * 100;

  return {
    scenario,
    projections,
    finalPatrimony,
    annualIncome: monthlyAnnualIncome,
    yearsToRetirement,
    averageReturn,
    color: config.color
  };
};

/**
 * Retirement Service
 */
export const retirementService = {
  /**
   * Calculate projections for all 3 scenarios
   */
  calculateAllScenarios: (plan: RetirementPlan): RetirementScenarioProjection[] => {
    return [
      calculateRetirementProjection(plan, RetirementScenario.CONSERVATIVE),
      calculateRetirementProjection(plan, RetirementScenario.MODERATE),
      calculateRetirementProjection(plan, RetirementScenario.AGGRESSIVE)
    ];
  },

  /**
   * Recommend scenario based on risk profile
   */
  recommendScenario: (monthlyIncome: number, riskTolerance: 'low' | 'medium' | 'high'): RetirementScenario => {
    if (riskTolerance === 'low' || monthlyIncome < 3000) {
      return RetirementScenario.CONSERVATIVE;
    }
    if (riskTolerance === 'high' && monthlyIncome > 5000) {
      return RetirementScenario.AGGRESSIVE;
    }
    return RetirementScenario.MODERATE;
  },

  /**
   * Calculate years to retirement
   */
  calculateYearsToRetirement: (plan: RetirementPlan): number => {
    const targetDate = new Date(plan.targetDate);
    const today = new Date();
    const diffTime = Math.abs(targetDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 365);
  },

  /**
   * Calculate monthly savings needed
   */
  calculateMonthlySavingsNeeded = (
    targetAmount: number,
    currentAmount: number,
    years: number,
    annualRate: number
  ): number => {
    const monthlyRate = annualRate / 12;
    const months = years * 12;

    const compoundedCurrent = currentAmount * Math.pow(1 + monthlyRate, months);
    const remainingNeeded = targetAmount - compoundedCurrent;

    if (monthlyRate === 0) {
      return Math.max(0, remainingNeeded / months);
    }

    const monthlyPayment = remainingNeeded / (Math.pow(1 + monthlyRate, months) - 1) * monthlyRate;
    return Math.max(0, monthlyPayment);
  }
};

export default retirementService;
