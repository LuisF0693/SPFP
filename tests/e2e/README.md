# E2E Tests for SPFP

End-to-end tests using **Playwright** for critical user journeys and security verification.

## 📋 Test Coverage

### 1. **Signup & First Transaction** (`signup.spec.ts`)
- User signup with email/password
- Create first transaction
- Error handling (duplicate email, empty fields)
- **Happy Path:** ✅ User creates account and adds transaction
- **Error Cases:** ✅ Duplicate email detection, validation errors

### 2. **Recurring Transactions** (`transactions.spec.ts`)
- Create recurring/installment transactions
- Edit transaction frequency/amount
- Delete recurring transactions
- Verify recurring transactions appear on correct dates
- **Happy Path:** ✅ Monthly subscription created and updated
- **Data Validation:** ✅ Transactions persist across months

### 3. **CSV Import** (`import.spec.ts`)
- Import transactions from CSV file
- CSV validation and error handling
- Preview before import
- Duplicate detection
- **Happy Path:** ✅ 5 transactions imported successfully
- **Error Cases:** ✅ Invalid CSV rejected, duplicates detected

### 4. **Admin Impersonation** (`admin.spec.ts`)
- Access admin panel (restricted to `nando062218@gmail.com`)
- View client list
- Impersonate a client and view their data
- Exit impersonation and return to admin view
- Audit trail logging
- **Happy Path:** ✅ Admin views client data in isolation
- **Data Isolation:** ✅ Admin data separated from client data

### 5. **Multi-User Security** (`security.spec.ts`)
- User A cannot see User B's transactions
- URL-based access control
- Session token isolation
- Concurrent user sessions
- Logout clears session
- **Happy Path:** ✅ Two users with separate data
- **Security:** ✅ No cross-user data leakage

### 6. **AI Insights** (`insights.spec.ts`)
- Generate financial insights
- Chat with AI about spending
- Persist chat history
- Generate insights from transaction data
- Error handling for API failures
- Clear chat history
- **Happy Path:** ✅ User asks questions, AI responds
- **Data:** ✅ Insights generated from real transaction data

## 🚀 Running Tests

### Prerequisites
```bash
npm install -D @playwright/test
```

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Specific Test File
```bash
npm run test:e2e -- signup.spec.ts
npm run test:e2e -- security.spec.ts
```

### Run with UI (Debug Mode)
```bash
npm run test:e2e:ui
```

### Run with Inspector
```bash
npm run test:e2e:debug
```

### Run in Specific Browser
```bash
npm run test:e2e -- --project chromium
npm run test:e2e -- --project firefox
npm run test:e2e -- --project webkit
```

## 📁 File Structure

```
tests/e2e/
├── signup.spec.ts           # User registration & first transaction
├── transactions.spec.ts     # Recurring transaction management
├── import.spec.ts          # CSV file import
├── admin.spec.ts           # Admin impersonation workflow
├── security.spec.ts        # Multi-user data isolation
├── insights.spec.ts        # AI financial insights
├── helpers.ts              # Reusable test utilities
├── README.md               # This file
└── playwright.config.ts    # Playwright configuration
```

## 🛠️ Helper Functions

Use helpers from `tests/e2e/helpers.ts`:

```typescript
import { testHelpers, testData } from './helpers';

test('example', async ({ page }) => {
  // Login
  await testHelpers.login(page, 'user@example.com', 'password');

  // Create transaction
  await testHelpers.createTransaction(
    page,
    'Coffee',
    '5.50',
    'Food',
    true,  // isRecurring
    'Daily'
  );

  // Delete transaction
  await testHelpers.deleteTransaction(page, 'Coffee');

  // Get all transactions
  const transactions = await testHelpers.getTransactions(page);

  // Wait for element
  const loaded = await testHelpers.waitForElement(page, '[data-testid="dashboard"]');
});
```

## 🔐 Security Test Notes

### Admin Account
- Email: `nando062218@gmail.com` (from CLAUDE.md)
- Tests use this account for admin impersonation tests

### Multi-User Tests
- Create unique test users with timestamps: `user-${Date.now()}@example.com`
- Each test context is isolated (separate browser instance)
- Session data is not shared between contexts

### Data Isolation Verification
- User A transactions must NOT appear for User B
- URL manipulation cannot access other user data
- Session tokens are context-specific

## 📊 Performance Targets

- Page load: < 3s
- Transaction creation: < 2s
- CSV import (5 items): < 5s
- AI insight response: < 10s (depends on API)

## 🐛 Known Issues & Workarounds

### Issue: Test selectors brittle to UI changes
**Solution:** Use data-testid attributes instead of text matching where possible

### Issue: CSV file handling in Windows
**Solution:** Use `path.join()` and proper path separators

### Issue: AI responses vary
**Solution:** Use flexible text matching (e.g., `text=spending|expense|cost`)

### Issue: Timing issues with async operations
**Solution:** Use `waitForNavigation()` and explicit waits instead of fixed timeouts

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test report
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 📝 Writing New Tests

### Template
```typescript
import { test, expect } from '@playwright/test';
import { testHelpers, testData } from './helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login, create data, etc.
    await testHelpers.login(page, testData.generateEmail(), testData.password);
  });

  test('Happy path scenario', async ({ page }) => {
    // Act
    await testHelpers.createTransaction(page, 'Test', '100');

    // Assert
    await expect(page.locator('text=Test')).toBeVisible();
  });

  test('Error scenario', async ({ page }) => {
    // Act & Assert
    const success = await testHelpers.deleteTransaction(page, 'Nonexistent');
    expect(success).toBeFalsy();
  });
});
```

### Best Practices
1. **Use data-testid** for selectors when possible
2. **Wait for navigation** after form submissions
3. **Use helpers** to reduce code duplication
4. **Test happy path + error cases** for each feature
5. **Clear data** after tests if needed
6. **Make tests independent** (can run in any order)
7. **Use meaningful test names** describing the scenario

## 🔍 Debugging Tips

### View Element State
```bash
# Take screenshot at any point
await page.screenshot({ path: 'debug.png' });

# Pause execution
await page.pause();

# Get all text on page
console.log(await page.content());
```

### Inspect Network
```bash
# View all network requests
page.on('response', response => console.log(response.url()));
```

### Check Console Errors
```bash
page.on('console', msg => console.log(msg.text()));
```

## 📞 Support

- **Playwright Docs:** https://playwright.dev/
- **Project Repo:** SPFP Financial Planning App
- **Test Owner:** @qa (Quinn)

---

**Last Updated:** 2026-01-27
**Status:** ✅ All 6 test suites implemented and ready for validation
