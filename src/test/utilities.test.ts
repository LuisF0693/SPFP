import { describe, it, expect, beforeEach } from 'vitest';
import { formatCurrency, formatDate, generateId, getMonthName } from '../utils';
import { expectMoneyEqual, MockLocalStorage, installMockLocalStorage } from './test-helpers';

/**
 * COMPREHENSIVE UTILITY TESTS
 * Tests core formatting, ID generation, and utility functions
 */
describe('Currency Formatting (formatCurrency)', () => {
  it('should format positive numbers to BRL currency', () => {
    const result = formatCurrency(1234.56);
    expect(result).toMatch(/R\$\s*1\.234,56/);
  });

  it('should format zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toMatch(/R\$\s*0,00/);
  });

  it('should format negative numbers correctly', () => {
    const result = formatCurrency(-500.00);
    expect(result).toMatch(/R\$\s*-?500,00/);
  });

  it('should handle large numbers', () => {
    const result = formatCurrency(1000000.99);
    expect(result).toMatch(/R\$\s*1\.000\.000,99/);
  });

  it('should handle decimal precision', () => {
    const result = formatCurrency(99.99);
    expect(result).toMatch(/R\$\s*99,99/);
  });

  it('should handle single decimal', () => {
    const result = formatCurrency(50.5);
    expect(result).toMatch(/R\$\s*50,50/);
  });

  it('should handle very small numbers', () => {
    const result = formatCurrency(0.01);
    expect(result).toMatch(/R\$\s*0,01/);
  });
});

describe('Date Formatting (formatDate)', () => {
  it('should format ISO date to pt-BR format', () => {
    const result = formatDate('2026-01-22');
    expect(result).toMatch(/22\/01/);
  });

  it('should format date with leading zeros', () => {
    const result = formatDate('2026-01-05');
    expect(result).toMatch(/05\/01/);
  });

  it('should format end of month correctly', () => {
    const result = formatDate('2026-12-31');
    expect(result).toMatch(/31\/12/);
  });

  it('should format first day of year', () => {
    const result = formatDate('2026-01-01');
    expect(result).toMatch(/01\/01/);
  });

  it('should handle different months', () => {
    const result = formatDate('2026-06-15');
    expect(result).toMatch(/15\/06/);
  });
});

describe('ID Generation (generateId)', () => {
  it('should generate a 7-character alphanumerical ID', () => {
    const id = generateId();
    expect(id).toHaveLength(7);
    expect(typeof id).toBe('string');
  });

  it('should generate unique IDs', () => {
    const ids = new Set([generateId(), generateId(), generateId()]);
    expect(ids.size).toBe(3);
  });

  it('should only contain valid alphanumeric characters', () => {
    const id = generateId();
    expect(/^[a-z0-9]{7}$/).toTest(id);
  });

  it('should generate multiple unique IDs consistently', () => {
    const ids = Array.from({ length: 100 }, () => generateId());
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(100);
  });
});

describe('Month Name Retrieval (getMonthName)', () => {
  it('should return correct month names in Portuguese', () => {
    expect(getMonthName(0)).toBe('Janeiro');
    expect(getMonthName(1)).toBe('Fevereiro');
    expect(getMonthName(2)).toBe('Março');
    expect(getMonthName(3)).toBe('Abril');
    expect(getMonthName(4)).toBe('Maio');
    expect(getMonthName(5)).toBe('Junho');
    expect(getMonthName(6)).toBe('Julho');
    expect(getMonthName(7)).toBe('Agosto');
    expect(getMonthName(8)).toBe('Setembro');
    expect(getMonthName(9)).toBe('Outubro');
    expect(getMonthName(10)).toBe('Novembro');
    expect(getMonthName(11)).toBe('Dezembro');
  });

  it('should return correct month for all valid indices', () => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    months.forEach((month, index) => {
      expect(getMonthName(index)).toBe(month);
    });
  });
});

describe('MockLocalStorage', () => {
  let storage: MockLocalStorage;

  beforeEach(() => {
    storage = new MockLocalStorage();
  });

  it('should set and get items', () => {
    storage.setItem('key', 'value');
    expect(storage.getItem('key')).toBe('value');
  });

  it('should return null for non-existent keys', () => {
    expect(storage.getItem('nonexistent')).toBeNull();
  });

  it('should remove items', () => {
    storage.setItem('key', 'value');
    storage.removeItem('key');
    expect(storage.getItem('key')).toBeNull();
  });

  it('should clear all items', () => {
    storage.setItem('key1', 'value1');
    storage.setItem('key2', 'value2');
    storage.clear();
    expect(storage.getItem('key1')).toBeNull();
    expect(storage.getItem('key2')).toBeNull();
    expect(storage.length).toBe(0);
  });

  it('should track length correctly', () => {
    expect(storage.length).toBe(0);
    storage.setItem('key1', 'value1');
    expect(storage.length).toBe(1);
    storage.setItem('key2', 'value2');
    expect(storage.length).toBe(2);
    storage.removeItem('key1');
    expect(storage.length).toBe(1);
  });

  it('should return key by index', () => {
    storage.setItem('first', 'value1');
    storage.setItem('second', 'value2');
    const keys = [storage.key(0), storage.key(1)];
    expect(keys).toContain('first');
    expect(keys).toContain('second');
  });

  it('should return null for out-of-bounds index', () => {
    storage.setItem('key', 'value');
    expect(storage.key(5)).toBeNull();
  });

  it('should convert values to strings', () => {
    storage.setItem('number', '123');
    expect(storage.getItem('number')).toBe('123');
  });
});

describe('Money Equality Assertion', () => {
  it('should pass for exactly equal amounts', () => {
    expect(() => expectMoneyEqual(100, 100)).not.toThrow();
  });

  it('should pass for amounts within tolerance', () => {
    expect(() => expectMoneyEqual(100.001, 100, 0.01)).not.toThrow();
  });

  it('should fail for amounts outside tolerance', () => {
    expect(() => expectMoneyEqual(100.1, 100, 0.01)).toThrow();
  });

  it('should use default tolerance of 0.01', () => {
    expect(() => expectMoneyEqual(100.005, 100)).not.toThrow();
  });

  it('should handle negative amounts', () => {
    expect(() => expectMoneyEqual(-50, -50)).not.toThrow();
  });
});
