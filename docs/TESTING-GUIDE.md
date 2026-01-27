# SPFP Testing Guide

Quick reference for running, writing, and maintaining tests in the SPFP project.

## Quick Start

### Run all tests
```bash
npm test
```

### Run tests in UI mode
```bash
npm run test:ui
```

### Run specific test file
```bash
npm test -- src/test/utilities.test.ts
```

### Watch mode (auto-run on changes)
```bash
npm test -- --watch
```

### Generate coverage report
```bash
npm test -- --coverage
```

---

## Test File Organization

### Location
All tests live in `src/test/` directory:

```
src/test/
├── setup.ts                      # Test environment setup
├── test-utils.tsx               # Mock data generators
├── test-helpers.ts              # Assertion helpers
│
├── utilities.test.ts            # Util function tests
├── crmUtils.test.ts             # CRM utility tests
├── transactionCalculations.test.ts
├── transactionGrouping.test.ts
├── budgetAndGoals.test.ts
├── dataValidation.test.ts
├── financeContextLogic.test.ts
├── integration.test.ts
└── ...
```

### Naming Convention
- Test files: `*.test.ts` or `*.test.tsx`
- Describe blocks: Descriptive feature name
- Test cases: Start with "should" (e.g., "should calculate balance correctly")

---

## Test Structure

### Basic Test Template
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockAccount } from './test-utils';

describe('Feature Being Tested', () => {
  let account;

  beforeEach(() => {
    // Setup before each test
    account = createMockAccount();
  });

  it('should do something specific', () => {
    // Arrange
    const input = 100;

    // Act
    const result = input * 2;

    // Assert
    expect(result).toBe(200);
  });

  it('should handle error cases', () => {
    expect(() => {
      someFunction(invalidInput);
    }).toThrow();
  });
});
```

### Test Organization Pattern
```typescript
describe('Feature', () => {
  describe('Happy Path', () => {
    it('should work correctly with valid input', () => { ... });
    it('should handle edge case A', () => { ... });
  });

  describe('Error Handling', () => {
    it('should throw error with invalid input', () => { ... });
    it('should handle null gracefully', () => { ... });
  });

  describe('Edge Cases', () => {
    it('should handle zero', () => { ... });
    it('should handle very large numbers', () => { ... });
  });
});
```

---

## Available Test Utilities

### Mock Data Generators (test-utils.tsx)

Create mock objects for testing:

```typescript
import {
  createMockUser,
  createMockAccount,
  createMockTransaction,
  createMockGoal,
  generators
} from './test-utils';

// Create mock data
const user = createMockUser({ email: 'custom@example.com' });
const account = createMockAccount({ balance: 5000, name: 'Test' });
const transaction = createMockTransaction({ type: 'INCOME', value: 500 });
const goal = createMockGoal({ targetAmount: 10000 });

// Use generators
const randomId = generators.randomId();
const randomEmail = generators.randomEmail();
const randomAmount = generators.randomAmount(100, 10000);
const futureDate = generators.futureDate(30);
```

### Assertion Helpers (test-helpers.ts)

```typescript
import {
  expectMoneyEqual,
  assertDefined,
  MockLocalStorage,
  installMockLocalStorage,
  retryAssertion,
  measureTime,
  expectPerformance
} from './test-helpers';

// Money assertions (with tolerance)
expectMoneyEqual(100.001, 100, 0.01); // Passes

// Define assertions
const value = assertDefined(maybeValue); // Throws if undefined

// Test localStorage
const storage = installMockLocalStorage();
storage.setItem('key', 'value');

// Retry logic (useful for async)
await retryAssertion(async () => {
  expect(someAsyncValue()).toBe(expected);
}, 3, 100);

// Performance testing
const { result, duration } = await measureTime(async () => {
  return heavyCalculation();
});
expect(duration).toBeLessThan(1000);
```

### React Component Testing (test-utils.tsx)

```typescript
import { renderWithProviders } from './test-utils';

describe('MyComponent', () => {
  it('should render', () => {
    const { getByText } = renderWithProviders(<MyComponent />);
    expect(getByText('Expected Text')).toBeDefined();
  });
});
```

---

## Common Test Patterns

### Testing Balance Calculations
```typescript
it('should calculate balance correctly', () => {
  let balance = 1000;

  // Apply transaction
  const transaction = createMockTransaction({
    type: 'EXPENSE',
    value: 250
  });

  balance -= transaction.value;

  expectMoneyEqual(balance, 750);
});
```

### Testing Recurring Transactions
```typescript
it('should handle recurring transactions', () => {
  const groupId = generators.randomId();
  const transactions = Array.from({ length: 12 }, (_, i) =>
    createMockTransaction({
      groupId,
      groupIndex: i,
      value: 100
    })
  );

  const total = transactions.reduce((sum, tx) => sum + tx.value, 0);
  expectMoneyEqual(total, 1200);
});
```

### Testing State Updates
```typescript
it('should update state correctly', () => {
  const storage = installMockLocalStorage();
  const state = { balance: 1000, transactions: [] };

  // Save state
  localStorage.setItem('state', JSON.stringify(state));

  // Retrieve and verify
  const retrieved = JSON.parse(localStorage.getItem('state'));
  expect(retrieved.balance).toBe(1000);
});
```

### Testing Error Cases
```typescript
it('should validate email format', () => {
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  expect(validateEmail('valid@example.com')).toBe(true);
  expect(validateEmail('invalid.email')).toBe(false);
  expect(validateEmail('@nodomain.com')).toBe(false);
});
```

---

## Vitest Assertion Methods

### Basic Assertions
```typescript
expect(value).toBe(expected);                 // Strict equality
expect(value).toEqual(expected);              // Deep equality
expect(value).not.toBe(unexpected);           // Negation
expect(array).toHaveLength(3);                // Array length
expect(array).toContain(item);                // Contains item
```

### Type Assertions
```typescript
expect(value).toBeDefined();
expect(value).toBeUndefined();
expect(value).toBeNull();
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(typeof value).toBe('string');
```

### Number Assertions
```typescript
expect(value).toBeGreaterThan(5);
expect(value).toBeLessThan(10);
expect(value).toBeGreaterThanOrEqual(5);
expect(value).toBeLessThanOrEqual(10);
expect(value).toBeCloseTo(5.1, 1);            // Within precision
```

### String Assertions
```typescript
expect(str).toMatch(/pattern/);               // Regex match
expect(str).toHaveLength(5);
expect(str).toContain('substring');
```

### Error Assertions
```typescript
expect(() => {
  throw new Error('message');
}).toThrow();

expect(() => {
  throw new Error('message');
}).toThrow('message');

expect(() => {
  throw new TypeError('message');
}).toThrow(TypeError);
```

### Async Assertions
```typescript
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

---

## Best Practices

### 1. Test Naming
✓ Clear and specific
```typescript
it('should calculate balance correctly when expense is added')
it('should return 0 for empty transaction list')
```

✗ Vague and unclear
```typescript
it('works')
it('tests balance')
```

### 2. Test Organization
- Group related tests with `describe`
- Use `beforeEach` for common setup
- Clean up in `afterEach` if needed

### 3. DRY Testing
- Use helper functions for common assertions
- Create reusable mock data builders
- Extract common setup logic

### 4. One Assertion Per Test (Usually)
```typescript
✓ Good - Single responsibility
it('should format currency correctly', () => {
  const result = formatCurrency(1234.56);
  expect(result).toMatch(/R\$\s*1\.234,56/);
});

✗ Avoid - Multiple unrelated assertions
it('should handle everything', () => {
  expect(formatCurrency(100)).toBe('R$ 100,00');
  expect(formatDate('2026-01-22')).toBe('22/01/2026');
  expect(generateId()).toHaveLength(7);
});
```

### 5. Arrange-Act-Assert Pattern
```typescript
it('should calculate correct balance', () => {
  // Arrange
  const account = createMockAccount({ balance: 1000 });
  const expense = createMockTransaction({ value: 250 });

  // Act
  const newBalance = account.balance - expense.value;

  // Assert
  expectMoneyEqual(newBalance, 750);
});
```

### 6. Avoid Test Interdependencies
- Each test should be independent
- Don't rely on test execution order
- Clean up state properly

### 7. Focus on Behavior, Not Implementation
```typescript
✓ Good - Tests behavior
expect(calculateBalance(1000, [expense])).toBe(750);

✗ Bad - Tests internal implementation
expect(balanceReducer).toHaveBeenCalledWith(1000, expense);
```

---

## Debugging Tests

### Run single test
```bash
npm test -- -t "should format currency"
```

### Run tests in specific file
```bash
npm test src/test/utilities.test.ts
```

### Verbose output
```bash
npm test -- --reporter=verbose
```

### Debug in browser
```bash
npm test -- --inspect
```

### Add console logs
```typescript
it('should work', () => {
  console.log('Debug info:', someValue);
  expect(result).toBe(expected);
});
```

---

## Writing New Tests

### Checklist
- [ ] Test file created in `src/test/`
- [ ] File named `*.test.ts`
- [ ] Imports from `vitest`
- [ ] Uses appropriate mock data
- [ ] Tests happy path AND error cases
- [ ] Clear test descriptions
- [ ] Proper assertions
- [ ] No test interdependencies
- [ ] Follows project patterns

### Template for New Test File
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { functionToTest } from '../path/to/function';
import { createMockData } from './test-utils';

describe('Feature Name', () => {
  let setupData;

  beforeEach(() => {
    setupData = createMockData();
  });

  describe('Happy Path', () => {
    it('should work with valid input', () => {
      expect(true).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input', () => {
      expect(true).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle edge case', () => {
      expect(true).toBe(true);
    });
  });
});
```

---

## Coverage Goals

### Current Target
- **Baseline:** 40%+ coverage
- **Functions:** 70%
- **Branches:** 70%
- **Statements:** 70%

### Run coverage
```bash
npm test -- --coverage
```

---

## Troubleshooting

### Tests hang or timeout
- Increase timeout: `testTimeout: 20000` in vitest.config.ts
- Check for unresolved promises
- Verify mock functions complete

### Import errors
- Check file paths (use `@` alias: `@/path`)
- Ensure file exists
- Check export names

### Mock data issues
- Verify mock generator functions
- Check default values in createMock* functions
- Use `JSON.parse(JSON.stringify(...))` for deep copies

### Async test failures
- Use `async` keyword on test function
- Await async operations
- Use `.resolves` or `.rejects`

---

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- Project: `docs/TEST-SUMMARY-STY-009.md`

---

*Last Updated: 2026-01-27*
