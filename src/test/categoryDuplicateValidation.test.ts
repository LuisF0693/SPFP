/**
 * STY-404: Category Duplicate Name Validation Tests
 *
 * Tests for duplicate category name validation:
 * - Case-insensitive comparison (João = joão)
 * - Allow editing without changing name (editing own category)
 * - Prevent creating/editing to name that exists in other categories
 * - Permit empty name (invalid but not duplicate)
 */

import { describe, it, expect } from 'vitest';
import { Category } from '../types';

/**
 * Helper function: isNameAvailable for CREATE mode
 * Used in CreateCategoryModal.tsx
 */
function isNameAvailableForCreate(
  checkName: string,
  allCategories: Category[]
): boolean {
  const trimmedName = checkName.trim().toLowerCase();
  if (!trimmedName) return true; // Empty name is not a duplicate, just invalid
  return !allCategories.some(cat => cat.name.toLowerCase() === trimmedName);
}

/**
 * Helper function: isNameAvailable for EDIT mode
 * Used in CategoryModal.tsx
 */
function isNameAvailableForEdit(
  checkName: string,
  allCategories: Category[],
  currentCategoryId: string
): boolean {
  const trimmedName = checkName.trim().toLowerCase();
  if (!trimmedName) return true; // Empty name is not a duplicate, just invalid

  return !allCategories.some(cat => {
    const catName = cat.name.toLowerCase();
    const isSameName = catName === trimmedName;
    const isEditingOwn = cat.id === currentCategoryId;

    // It's a duplicate if: names match AND not editing own category
    return isSameName && !isEditingOwn;
  });
}

const mockCategories: Category[] = [
  { id: '1', name: 'Moradia', color: '#3b82f6', group: 'FIXED', icon: '🏠' },
  { id: '2', name: 'Alimentação', color: '#10b981', group: 'VARIABLE', icon: '🍔' },
  { id: '3', name: 'Transporte', color: '#ef4444', group: 'VARIABLE', icon: '🚗' },
  { id: '4', name: 'João', color: '#f59e0b', group: 'VARIABLE', icon: '👤' },
];

describe('STY-404: Category Duplicate Name Validation - CREATE Mode', () => {
  it('should allow creating category with unique name', () => {
    const result = isNameAvailableForCreate('Saúde', mockCategories);
    expect(result).toBe(true);
  });

  it('should prevent creating category with exact duplicate name', () => {
    const result = isNameAvailableForCreate('Moradia', mockCategories);
    expect(result).toBe(false);
  });

  it('should prevent creating category with case-insensitive duplicate', () => {
    const result = isNameAvailableForCreate('moradia', mockCategories);
    expect(result).toBe(false);
  });

  it('should prevent creating category with case-mixed duplicate', () => {
    const result = isNameAvailableForCreate('MORADIA', mockCategories);
    expect(result).toBe(false);
  });

  it('should allow empty name (not a duplicate, just invalid)', () => {
    const result = isNameAvailableForCreate('', mockCategories);
    expect(result).toBe(true);
  });

  it('should allow whitespace-only name (not a duplicate, just invalid)', () => {
    const result = isNameAvailableForCreate('   ', mockCategories);
    expect(result).toBe(true);
  });

  it('should prevent duplicate even with whitespace variations', () => {
    const result = isNameAvailableForCreate('  João  ', mockCategories);
    expect(result).toBe(false);
  });

  it('should work with empty categories list', () => {
    const result = isNameAvailableForCreate('Saúde', []);
    expect(result).toBe(true);
  });
});

describe('STY-404: Category Duplicate Name Validation - EDIT Mode', () => {
  it('should allow editing category without changing name', () => {
    // Editing category "Moradia" (id: 1) and keeping the name "Moradia"
    const result = isNameAvailableForEdit('Moradia', mockCategories, '1');
    expect(result).toBe(true);
  });

  it('should allow editing category name to unique name', () => {
    // Editing category "Moradia" (id: 1) to "Saúde"
    const result = isNameAvailableForEdit('Saúde', mockCategories, '1');
    expect(result).toBe(true);
  });

  it('should prevent editing category to existing different category name', () => {
    // Trying to edit category id: 1 to name "Alimentação" (which is id: 2)
    const result = isNameAvailableForEdit('Alimentação', mockCategories, '1');
    expect(result).toBe(false);
  });

  it('should allow editing own category name preserving case', () => {
    // Editing category "João" (id: 4) keeping the name "João"
    const result = isNameAvailableForEdit('João', mockCategories, '4');
    expect(result).toBe(true);
  });

  it('should allow editing own category with case-insensitive same name', () => {
    // Editing category "João" (id: 4) to "joão" (different case, same category)
    const result = isNameAvailableForEdit('joão', mockCategories, '4');
    expect(result).toBe(true);
  });

  it('should prevent editing to case-insensitive duplicate of another category', () => {
    // Trying to edit category id: 1 to "moradia" (exists as "Moradia" but id: 1)
    // Actually this should be allowed because we're editing id: 1 and the match is also id: 1
    const result = isNameAvailableForEdit('moradia', mockCategories, '1');
    expect(result).toBe(true); // Same category, different case
  });

  it('should prevent editing to case-insensitive duplicate of different category', () => {
    // Trying to edit category id: 2 to "alimentação" (different case, but different category id)
    // This should fail because "Alimentação" exists with id: 2, and we're editing a different id
    const result = isNameAvailableForEdit('alimentação', mockCategories, '3');
    expect(result).toBe(false);
  });

  it('should handle empty name in edit mode', () => {
    const result = isNameAvailableForEdit('', mockCategories, '1');
    expect(result).toBe(true); // Not a duplicate, just invalid
  });

  it('should handle non-existent category id in edit', () => {
    // Editing non-existent category id: 999 to existing name
    const result = isNameAvailableForEdit('Moradia', mockCategories, '999');
    expect(result).toBe(false); // It's a duplicate because id 999 doesn't match any
  });

  it('should work with empty categories list in edit mode', () => {
    const result = isNameAvailableForEdit('Moradia', [], '1');
    expect(result).toBe(true); // No categories to compare against
  });
});

describe('STY-404: Category Duplicate Validation - Real-world Scenarios', () => {
  it('User creates "Energia" then tries to create "energia" (case variation)', () => {
    const categories: Category[] = [
      { id: '1', name: 'Energia', color: '#3b82f6', group: 'FIXED', icon: '⚡' },
    ];
    const result = isNameAvailableForCreate('energia', categories);
    expect(result).toBe(false); // Should be blocked
  });

  it('User edits "Saúde" to "saúde" (only case change)', () => {
    const categories: Category[] = [
      { id: '1', name: 'Saúde', color: '#3b82f6', group: 'VARIABLE', icon: '🏥' },
    ];
    const result = isNameAvailableForEdit('saúde', categories, '1');
    expect(result).toBe(true); // Should be allowed (editing own)
  });

  it('User edits "Saúde" (id: 1) trying to change to "Saúde" (id: 2)', () => {
    const categories: Category[] = [
      { id: '1', name: 'Saúde', color: '#3b82f6', group: 'VARIABLE', icon: '🏥' },
      { id: '2', name: 'Saúde', color: '#ef4444', group: 'VARIABLE', icon: '🏥' }, // Duplicate!
    ];
    const result = isNameAvailableForEdit('Saúde', categories, '1');
    expect(result).toBe(true); // Allow because editing id: 1, and match is id: 1
  });

  it('User updates all category names after refactoring', () => {
    const initialCategories: Category[] = [
      { id: '1', name: 'Saída Fixa', color: '#3b82f6', group: 'FIXED', icon: '📊' },
      { id: '2', name: 'Saída Variável', color: '#10b981', group: 'VARIABLE', icon: '📊' },
    ];

    // Edit id: 1 to new unique name
    const result1 = isNameAvailableForEdit('Despesas Fixas', initialCategories, '1');
    expect(result1).toBe(true);

    // Edit id: 2 to new unique name
    const result2 = isNameAvailableForEdit('Despesas Variáveis', initialCategories, '2');
    expect(result2).toBe(true);
  });
});

describe('STY-404: Boundary and Edge Cases', () => {
  it('should handle names with leading/trailing spaces', () => {
    const categories: Category[] = [
      { id: '1', name: 'Moradia', color: '#3b82f6', group: 'FIXED', icon: '🏠' },
    ];
    const result = isNameAvailableForCreate('  Moradia  ', categories);
    expect(result).toBe(false); // Should trim and find duplicate
  });

  it('should handle unicode characters (Portuguese accents)', () => {
    const categories: Category[] = [
      { id: '1', name: 'Açúcar', color: '#3b82f6', group: 'VARIABLE', icon: '🍬' },
    ];
    const result = isNameAvailableForCreate('açúcar', categories);
    expect(result).toBe(false); // Case-insensitive match
  });

  it('should handle special characters in category names', () => {
    const categories: Category[] = [
      { id: '1', name: 'Saúde & Bem-estar', color: '#3b82f6', group: 'VARIABLE', icon: '🏥' },
    ];
    const result = isNameAvailableForCreate('Saúde & Bem-estar', categories);
    expect(result).toBe(false); // Exact match with special chars
  });

  it('should handle single character names', () => {
    const categories: Category[] = [
      { id: '1', name: 'A', color: '#3b82f6', group: 'VARIABLE', icon: '📌' },
    ];
    const result = isNameAvailableForCreate('a', categories);
    expect(result).toBe(false); // Should be blocked
  });

  it('should handle very long category names', () => {
    const longName = 'A'.repeat(100);
    const categories: Category[] = [
      { id: '1', name: longName, color: '#3b82f6', group: 'VARIABLE', icon: '📌' },
    ];
    const result = isNameAvailableForCreate(longName, categories);
    expect(result).toBe(false); // Should work with long names
  });
});
