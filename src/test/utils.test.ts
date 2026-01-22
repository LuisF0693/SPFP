import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, generateId, getMonthName } from '../utils';

describe('Utility Functions', () => {
    describe('formatCurrency', () => {
        it('should format numbers to BRL currency', () => {
            // Use a regex to match the currency format since spaces can vary (non-breaking spaces)
            const result = formatCurrency(1234.56);
            expect(result).toMatch(/R\$\s*1\.234,56/);
        });

        it('should handle zero correctly', () => {
            const result = formatCurrency(0);
            expect(result).toMatch(/R\$\s*0,00/);
        });
    });

    describe('formatDate', () => {
        it('should format ISO strings to pt-BR format', () => {
            const result = formatDate('2026-01-22');
            expect(result).toMatch(/22\/01/);
        });
    });

    describe('generateId', () => {
        it('should generate a 7-character alphanumerical ID', () => {
            const id = generateId();
            expect(id).toHaveLength(7);
            expect(typeof id).toBe('string');
        });

        it('should generate unique IDs', () => {
            const id1 = generateId();
            const id2 = generateId();
            expect(id1).not.toBe(id2);
        });
    });

    describe('getMonthName', () => {
        it('should return the correct month name in Portuguese', () => {
            expect(getMonthName(0)).toBe('Janeiro');
            expect(getMonthName(11)).toBe('Dezembro');
            expect(getMonthName(5)).toBe('Junho');
        });
    });
});
