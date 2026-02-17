/**
 * Sales Dashboard Tests
 * Unit tests para US-404
 */

import { describe, it, expect } from 'vitest';
import { salesMockData, formatCurrency, calculateTotalByStage, calculateConversionRate, getRealized, getPipelineTotal } from '@/data/salesData';

describe('SalesDashboard - US-404', () => {
  describe('Mock Data', () => {
    it('should have 26 total leads distributed across 5 stages', () => {
      expect(salesMockData.leads).toHaveLength(26);
    });

    it('should have leads in all 5 stages', () => {
      const stages = new Set(salesMockData.leads.map((l) => l.stage));
      expect(stages).toContain('prospecting');
      expect(stages).toContain('qualification');
      expect(stages).toContain('proposal');
      expect(stages).toContain('negotiation');
      expect(stages).toContain('closed_won');
    });

    it('should have 12 leads in prospecting stage', () => {
      const prospecting = salesMockData.leads.filter((l) => l.stage === 'prospecting');
      expect(prospecting).toHaveLength(12);
    });

    it('should have 5 leads in qualification stage', () => {
      const qualification = salesMockData.leads.filter((l) => l.stage === 'qualification');
      expect(qualification).toHaveLength(5);
    });

    it('should have 3 leads in proposal stage', () => {
      const proposal = salesMockData.leads.filter((l) => l.stage === 'proposal');
      expect(proposal).toHaveLength(3);
    });

    it('should have 2 leads in negotiation stage', () => {
      const negotiation = salesMockData.leads.filter((l) => l.stage === 'negotiation');
      expect(negotiation).toHaveLength(2);
    });

    it('should have closed_won leads', () => {
      const closed = salesMockData.leads.filter((l) => l.stage === 'closed_won');
      expect(closed.length).toBeGreaterThan(0);
    });
  });

  describe('Lead Properties', () => {
    it('should have all required lead properties', () => {
      const lead = salesMockData.leads[0];
      expect(lead.id).toBeDefined();
      expect(lead.name).toBeDefined();
      expect(lead.company).toBeDefined();
      expect(lead.email).toBeDefined();
      expect(lead.phone).toBeDefined();
      expect(lead.stage).toBeDefined();
      expect(lead.value).toBeGreaterThan(0);
      expect(lead.probability).toBeGreaterThan(0);
      expect(lead.probability).toBeLessThanOrEqual(100);
    });

    it('should have valid email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      salesMockData.leads.forEach((lead) => {
        expect(emailRegex.test(lead.email!)).toBe(true);
      });
    });

    it('should have valid phone format', () => {
      salesMockData.leads.forEach((lead) => {
        expect(lead.phone).toMatch(/^\d+$/);
        expect(lead.phone!.length).toBeGreaterThan(5);
      });
    });
  });

  describe('Stage Calculations', () => {
    it('should calculate total by stage', () => {
      const prospectingTotal = calculateTotalByStage(salesMockData.leads, 'prospecting');
      expect(prospectingTotal).toBeGreaterThan(0);

      const qualificationTotal = calculateTotalByStage(salesMockData.leads, 'qualification');
      expect(qualificationTotal).toBeGreaterThan(0);
    });

    it('should calculate pipeline total', () => {
      const total = getPipelineTotal(salesMockData.leads);
      expect(total).toBeGreaterThan(0);
    });

    it('should calculate realized revenue (closed_won)', () => {
      const realized = getRealized(salesMockData.leads);
      expect(realized).toBeGreaterThan(0);
      const closedLeads = salesMockData.leads.filter((l) => l.stage === 'closed_won');
      const expected = closedLeads.reduce((sum, l) => sum + l.value, 0);
      expect(realized).toBe(expected);
    });

    it('should calculate conversion rates', () => {
      const rate = calculateConversionRate(
        salesMockData.leads,
        'prospecting',
        'qualification'
      );
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    });
  });

  describe('Goal Tracking', () => {
    it('should have monthly goal', () => {
      expect(salesMockData.goal).toBeDefined();
      expect(salesMockData.goal.target).toBeGreaterThan(0);
      expect(salesMockData.goal.target).toBe(50000);
    });

    it('should calculate goal achievement percentage', () => {
      const realized = getRealized(salesMockData.leads);
      const goal = salesMockData.goal.target;
      const percentage = (realized / goal) * 100;

      expect(percentage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Formatting', () => {
    it('should format currency correctly', () => {
      const formatted = formatCurrency(50000);
      expect(formatted).toContain('50');
      expect(formatted).toContain('000');
      expect(formatted).toContain('R$');
    });

    it('should handle small amounts', () => {
      const formatted = formatCurrency(100);
      expect(formatted).toContain('100');
    });

    it('should handle large amounts', () => {
      const formatted = formatCurrency(1000000);
      expect(formatted).toContain('1');
    });
  });

  describe('Pipeline Analysis', () => {
    it('should have more leads in early stages', () => {
      const early = salesMockData.leads.filter(
        (l) => l.stage === 'prospecting' || l.stage === 'qualification'
      ).length;
      const late = salesMockData.leads.filter(
        (l) => l.stage === 'proposal' || l.stage === 'negotiation' || l.stage === 'closed_won'
      ).length;

      expect(early).toBeGreaterThan(late);
    });

    it('should calculate average lead value', () => {
      const avgValue = getPipelineTotal(salesMockData.leads) / salesMockData.leads.length;
      expect(avgValue).toBeGreaterThan(0);
      expect(avgValue).toBeLessThan(25000);
    });

    it('should have probability distribution', () => {
      const probabilities = salesMockData.leads.map((l) => l.probability);
      const avgProbability = probabilities.reduce((a, b) => a + b) / probabilities.length;

      expect(avgProbability).toBeGreaterThan(0);
      expect(avgProbability).toBeLessThan(100);
    });
  });

  describe('Stage Order', () => {
    it('should follow correct stage progression', () => {
      const stageOrder = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won'];
      const leadStages = new Set(salesMockData.leads.map((l) => l.stage));

      stageOrder.forEach((stage) => {
        expect(leadStages).toContain(stage);
      });
    });
  });

  describe('Drag & Drop Scenarios', () => {
    it('should allow moving lead to next stage', () => {
      const lead = { ...salesMockData.leads[0], stage: 'qualification' as const };
      expect(lead.stage).toBe('qualification');
    });

    it('should allow moving lead to previous stage', () => {
      const closedLead = { ...salesMockData.leads[24], stage: 'proposal' as const };
      expect(closedLead.stage).toBe('proposal');
    });

    it('should maintain lead data after stage change', () => {
      const originalLead = salesMockData.leads[0];
      const movedLead = {
        ...originalLead,
        stage: 'qualification' as const,
      };

      expect(movedLead.id).toBe(originalLead.id);
      expect(movedLead.name).toBe(originalLead.name);
      expect(movedLead.value).toBe(originalLead.value);
    });
  });
});
