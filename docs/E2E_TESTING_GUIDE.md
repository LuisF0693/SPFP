# E2E Testing Guide (STY-016)

## Overview

This guide documents the E2E testing strategy for SPFP (Sistema de Planejamento Financeiro Pessoal). Our E2E tests ensure critical user journeys work correctly across browsers and devices.

## Test Infrastructure

### Setup & Configuration

- **Framework**: Playwright 1.40+
- **Configuration**: `playwright.config.ts`
- **Test Directory**: `tests/e2e/`
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium (CI), Chrome, Firefox, Safari, Mobile (local)

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (local debugging)
npm run test:e2e:ui

# Run debug mode (step-through)
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/e2e/transactions.spec.ts

# Run with specific project (browser)
npx playwright test --project=chromium
```

## Test Helpers

Located in `tests/e2e/helpers.ts`, providing utilities for:

### Authentication Helpers
- `testHelpers.login(page, email, password)` - Login via email/password
- `testHelpers.signup(page, email, password)` - Register new account
- `testHelpers.logout(page)` - Logout and redirect

### Transaction Helpers
- `testHelpers.createTransaction(page, description, amount, category?, isRecurring?, frequency?)` - Create transaction
- `testHelpers.deleteTransaction(page, description)` - Delete transaction by description

### Utility Helpers
- `testHelpers.waitForApp(page)` - Wait for app to initialize
- `testHelpers.getTransactions(page)` - Get all visible transactions
- `testHelpers.clickByText(page, pattern, index)` - Find and click element by text
- `testHelpers.isVisible(page, selector)` - Check element visibility
- `testHelpers.waitForElement(page, selector, timeout)` - Wait for element

### Storage Helpers
- `testHelpers.getLocalStorage(page, key)` - Read localStorage
- `testHelpers.setLocalStorage(page, key, value)` - Write to localStorage
- `testHelpers.clearLocalStorage(page)` - Clear all localStorage

### Cleanup Helpers
- `testCleanup.clearAllLocalStorage(page)` - Remove all localStorage
- `testCleanup.clearSessionStorage(page)` - Remove session storage
- `testCleanup.clearAllCookies(page)` - Remove all cookies
- `testCleanup.clearPageCache(page)` - Clear IndexedDB and cache
- `testCleanup.deleteTestUser(userId, adminToken)` - Delete test user from DB
- `testCleanup.completeCleanup(page, options)` - Full cleanup routine

### Performance Helpers
- `performanceHelpers.measureTime(action)` - Measure execution time
- `performanceHelpers.verifyPerformance(action, maxMs)` - Assert performance within threshold
- `performanceHelpers.getLoadMetrics(page)` - Get page load metrics

### Test Data Generators
- `testData.generateEmail(prefix?)` - Generate unique test email
- `testData.generateTransaction(overrides?)` - Generate test transaction
- `testData.password` - Standard test password

## Test Organization

### Test Files

| File | Coverage |
|------|----------|
| `signup.spec.ts` | Registration, validation, first transaction |
| `transactions.spec.ts` | Create, edit, delete, recurring transactions |
| `admin.spec.ts` | Admin panel, client impersonation, user management |
| `security.spec.ts` | Auth flows, permissions, data isolation |
| `import.spec.ts` | CSV import/export, transaction bulk operations |
| `insights.spec.ts` | AI chat, financial insights, diagnostics |

### Test Patterns

#### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';
import { testHelpers, testData, testCleanup, performanceHelpers } from './helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await testHelpers.login(page, 'test@example.com', testData.password);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
    await testCleanup.completeCleanup(page);
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const data = testData.generateTransaction();

    // Act
    await testHelpers.createTransaction(page, data.description, data.amount);

    // Assert
    await expect(page.locator('text=' + data.description)).toBeVisible();
  });
});
```

#### Performance Test
```typescript
test('create transaction completes within SLA', async ({ page }) => {
  const isWithinSLA = await performanceHelpers.verifyPerformance(
    async () => {
      await testHelpers.createTransaction(page, 'Test', '100.00');
    },
    2000 // 2 seconds max
  );

  expect(isWithinSLA).toBe(true);
});
```

## Test Attributes & Selectors

### Using data-testid

For stable, resilient selectors, use `data-testid` attributes on components:

```tsx
// Component
<button data-testid="transaction-form-submit-btn">Save</button>

// Test
await page.click('[data-testid="transaction-form-submit-btn"]');
```

**Critical Components with data-testid:**
- `dashboard-main` - Main dashboard container
- `dashboard-metrics-section` - Top metrics cards
- `dashboard-charts-section` - Chart visualizations
- `dashboard-alerts-section` - Alert notifications
- `dashboard-transactions-section` - Recent transactions
- `transaction-form` - Transaction creation form
- `transaction-form-submit-btn` - Form submit button
- `transaction-form-close-btn` - Form close button
- `transactions-list` - Transaction list container
- `transaction-filters` - Filter controls
- `transaction-search-input` - Search field
- `transaction-filter-all` - Filter button (variations: income, expense, pending)
- `admin-crm-search-input` - Admin search
- `admin-crm-filters` - Admin filters
- `insights-chat-input` - AI chat input
- `insights-send-btn` - AI chat send button
- `theme-light-btn` - Light theme button
- `theme-dark-btn` - Dark theme button
- `theme-system-btn` - System theme button

### Selector Strategies (Priority Order)

1. **data-testid** (most stable, preferred)
   ```typescript
   page.locator('[data-testid="button-name"]')
   ```

2. **role-based** (semantic, accessible)
   ```typescript
   page.locator('button[aria-label="Submit"]')
   page.locator('[role="button"]')
   ```

3. **text content** (human-readable, requires exact match)
   ```typescript
   page.locator('text=Submit')
   page.locator(':has-text("Submit")')
   ```

4. **CSS selectors** (last resort, brittle)
   ```typescript
   page.locator('.button.submit')
   ```

## CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:
- Push to `main` or `sprint-*` branches
- All pull requests

Workflow: `.github/workflows/e2e-tests.yml`

**Features:**
- Parallel shard execution (3 shards)
- Auto-retry on failure (up to 2 retries)
- Test reports uploaded as artifacts
- PR comments with test status
- Videos of failed tests for debugging
- Screenshots on failure

### Running Tests Locally Before PR

```bash
# Install dependencies
npm install

# Start dev server (in background)
npm run dev &

# Run E2E tests
npm run test:e2e

# View results
npm run test:e2e:ui
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` for setup, `afterEach` for cleanup
- Don't rely on test execution order

### 2. Explicit Waits
```typescript
// Good - explicit wait with timeout
await page.locator('[data-testid="element"]').waitFor({ timeout: 5000 });

// Avoid - hardcoded delays
await page.waitForTimeout(2000); // Last resort only
```

### 3. Meaningful Assertions
```typescript
// Good
await expect(page.locator('[data-testid="total-balance"]')).toContainText('R$');

// Avoid - too generic
await expect(page).toHaveURL('anywhere');
```

### 4. Clean Error Messages
```typescript
test('user can save profile', async ({ page }) => {
  // ... test code ...
}, {
  // Provide context on failure
  timeout: 30000,
  // Use descriptive test name
  tag: '@critical @profile'
});
```

### 5. Data-Driven Tests
```typescript
const scenarios = [
  { type: 'INCOME', label: 'Receitas' },
  { type: 'EXPENSE', label: 'Despesas' }
];

scenarios.forEach(scenario => {
  test(`filter shows ${scenario.label}`, async ({ page }) => {
    await page.click(`[data-testid="transaction-filter-${scenario.type.toLowerCase()}"]`);
    // assertions
  });
});
```

## Performance Benchmarks

Expected performance thresholds (per user preference):

| Action | SLA | Test Attribute |
|--------|-----|-----------------|
| Page load | < 3s | `page.goto()` timing |
| Create transaction | < 2s | `handleSend()` timing |
| Search/filter | < 1s | Input debounce + render |
| CSV import | < 5s | File processing |
| AI insights generation | < 10s | API call + response |

## Debugging Failed Tests

### 1. View Test Report
```bash
npx playwright show-report
```

### 2. Run in UI Mode
```bash
npm run test:e2e:ui
```

### 3. Run Single Test with Debug
```bash
npx playwright test tests/e2e/transactions.spec.ts --debug
```

### 4. View Trace
Traces automatically collected on first retry failure. Open at:
```
playwright-report/trace/trace.zip
```

### 5. Screenshots & Videos
Available in:
```
test-results/
playwright-report/
```

## Common Issues & Solutions

### Test Timeout (30s default)
**Problem:** Test exceeds timeout
**Solution:**
1. Increase test timeout: `test.setTimeout(60000)`
2. Use explicit waits instead of hardcoded delays
3. Check if dev server is running

### Flaky Tests
**Problem:** Test passes/fails inconsistently
**Solution:**
1. Use `waitFor()` instead of hardcoded waits
2. Add data-testid for stable selectors
3. Check for race conditions (state updates)
4. Review app animations (add `animation: none` for tests)

### Selector Not Found
**Problem:** Element not found by selector
**Solution:**
1. Run with `--debug` flag to inspect DOM
2. Use browser console: `document.querySelector('[data-testid="..."]')`
3. Check for dynamic IDs or attributes
4. Wait for element: `.waitFor({ timeout: 5000 })`

### Login Failures
**Problem:** Auth helpers can't login
**Solution:**
1. Verify test user exists in database
2. Check password policy in auth service
3. Look for CAPTCHA or MFA blocking tests
4. Inspect auth error in console

## Contribution Guidelines

When adding new tests:

1. **Name tests clearly**: `test('user can create recurring transaction')`
2. **Use test data generators**: `testData.generateTransaction()`
3. **Add data-testid** to components being tested
4. **Add cleanup hooks** to prevent data pollution
5. **Document complex scenarios** with comments
6. **Use helpers** from `tests/e2e/helpers.ts`
7. **Tag critical tests** with `@critical` for easy identification
8. **Run locally** before pushing: `npm run test:e2e`

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright API Reference](https://playwright.dev/docs/api/class-page)
- [Test Reporters](https://playwright.dev/docs/test-reporters)
- [GitHub Actions Integration](https://playwright.dev/docs/ci)

## Support

For questions or issues with E2E tests:
1. Check test logs: `test-results/`
2. Review test trace: `playwright-report/trace/trace.zip`
3. Run test locally with `--debug`
4. Open GitHub issue with test failure details
