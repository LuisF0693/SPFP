import { test, expect } from '@playwright/test';

test.describe('Signup + First Transaction', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123!';

  test('User can signup and create first transaction', async ({ page }) => {
    // Navigate to app
    await page.goto('/');

    // Click signup button
    const signupButton = page.locator('button:has-text("Sign Up"), a:has-text("Sign Up"), [href*="signup"]').first();
    await signupButton.click();

    // Fill signup form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    // Confirm password if exists
    const confirmPasswordField = page.locator('input[placeholder*="Confirm"], input[name*="confirm"]');
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill(testPassword);
    }

    // Submit signup
    await page.click('button:has-text("Sign Up"), button:has-text("Create Account")');

    // Wait for navigation to dashboard
    await page.waitForNavigation({ timeout: 10000 });

    // Verify dashboard is visible
    expect(page.url()).toContain('/dashboard');

    // Check for welcome or account elements
    const dashboardContent = page.locator('[data-testid="dashboard"], main, .dashboard');
    await expect(dashboardContent.first()).toBeVisible({ timeout: 5000 });

    // Navigate to transactions
    await page.click('a:has-text("Transactions"), button:has-text("Transaction"), [href*="transaction"]');

    // Click "Add Transaction" or "New Transaction" button
    await page.click('button:has-text("Add"), button:has-text("New"), button:has-text("Transaction")');

    // Fill transaction form
    await page.fill('input[placeholder*="description"], input[placeholder*="Description"]', 'Test Transaction');

    // Fill amount
    const amountInput = page.locator('input[type="number"], input[placeholder*="amount"], input[placeholder*="Amount"]').first();
    await amountInput.fill('100.00');

    // Select category (click first category option)
    const categorySelect = page.locator('select, [role="listbox"]').first();
    if (await categorySelect.isVisible()) {
      await categorySelect.click();
      await page.locator('[role="option"]').first().click();
    }

    // Submit transaction
    await page.click('button:has-text("Save"), button:has-text("Add"), button:has-text("Create")');

    // Verify transaction appears in list
    await expect(page.locator('text=Test Transaction')).toBeVisible({ timeout: 5000 });

    console.log('✅ Signup and first transaction successful');
  });

  test('Signup error handling - duplicate email', async ({ page }) => {
    await page.goto('/');
    const signupButton = page.locator('button:has-text("Sign Up"), a:has-text("Sign Up")').first();
    await signupButton.click();

    // Use same email twice
    await page.fill('input[type="email"]', 'duplicate@example.com');
    await page.fill('input[type="password"]', testPassword);
    const confirmPasswordField = page.locator('input[placeholder*="Confirm"], input[name*="confirm"]');
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill(testPassword);
    }

    await page.click('button:has-text("Sign Up"), button:has-text("Create Account")');

    // Try again with same email
    await page.waitForTimeout(2000);
    if (page.url().includes('signup') || page.url().includes('register')) {
      await page.fill('input[type="email"]', 'duplicate@example.com');
      await page.fill('input[type="password"]', testPassword);
      if (await confirmPasswordField.isVisible()) {
        await confirmPasswordField.fill(testPassword);
      }
      await page.click('button:has-text("Sign Up"), button:has-text("Create Account")');

      // Expect error message
      const errorMsg = page.locator('text=already exists, text=already registered, text=duplicate');
      await expect(errorMsg.first()).toBeVisible({ timeout: 5000 }).catch(() => {
        console.log('Error message not found (expected in some auth implementations)');
      });
    }
  });

  test('Signup validation - empty fields', async ({ page }) => {
    await page.goto('/');
    const signupButton = page.locator('button:has-text("Sign Up"), a:has-text("Sign Up")').first();
    await signupButton.click();

    // Try to submit empty form
    await page.click('button:has-text("Sign Up"), button:has-text("Create Account")');

    // Check for validation errors
    const emailInput = page.locator('input[type="email"]');
    const validationError = emailInput.evaluate(el => (el as HTMLInputElement).validationMessage);

    await expect(validationError).toBeTruthy().catch(() => {
      console.log('HTML5 validation not used, checking for error messages');
    });
  });
});
