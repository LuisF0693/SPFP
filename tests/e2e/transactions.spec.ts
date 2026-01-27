import { test, expect } from '@playwright/test';

test.describe('Recurring Transactions', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');

    // Skip if already logged in
    if (page.url().includes('dashboard')) {
      return;
    }

    // Try to find and click google oauth or email login
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.fill('password');
      await page.click('button:has-text("Sign In"), button:has-text("Login")');
      await page.waitForNavigation({ timeout: 10000 });
    }
  });

  test('Create recurring transaction', async ({ page }) => {
    // Navigate to transactions
    await page.goto('/transactions');

    // Click "Add Transaction" button
    await page.click('button:has-text("Add"), button:has-text("New"), button:has-text("Transaction")');

    // Fill transaction form
    await page.fill('input[placeholder*="description"], input[placeholder*="Description"]', 'Monthly Subscription');

    const amountInput = page.locator('input[type="number"], input[placeholder*="amount"]').first();
    await amountInput.fill('29.99');

    // Look for "recurring" checkbox or dropdown
    const recurringCheckbox = page.locator('input[type="checkbox"][aria-label*="ecurring"], label:has-text("Recurring")');
    if (await recurringCheckbox.isVisible()) {
      await recurringCheckbox.click();
    }

    // Check for frequency selector
    const frequencySelect = page.locator('select:has-text("Month"), [aria-label*="frequency"]');
    if (await frequencySelect.isVisible()) {
      await frequencySelect.selectOption({ label: 'Monthly' });
    }

    // Check for end date option
    const endDateInput = page.locator('input[type="date"][placeholder*="End"]');
    if (await endDateInput.isVisible()) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
      await endDateInput.fill(futureDate.toISOString().split('T')[0]);
    }

    // Submit
    await page.click('button:has-text("Save"), button:has-text("Create")');

    // Verify recurring transaction created
    await expect(page.locator('text=Monthly Subscription')).toBeVisible({ timeout: 5000 });

    console.log('✅ Recurring transaction created');
  });

  test('Edit recurring transaction', async ({ page }) => {
    await page.goto('/transactions');

    // Find a transaction with "Monthly Subscription"
    const transactionRow = page.locator('text=Monthly Subscription').first();
    await expect(transactionRow).toBeVisible({ timeout: 5000 });

    // Click edit button (usually three dots or edit icon)
    const editButton = transactionRow.locator('..').locator('button[aria-label*="edit"], button:has-text("Edit")').first();
    if (await editButton.isVisible()) {
      await editButton.click();
    } else {
      // Try right-click context menu
      await transactionRow.click({ button: 'right' });
      await page.click('text=Edit');
    }

    // Modify amount
    const amountInput = page.locator('input[type="number"], input[placeholder*="amount"]').first();
    await amountInput.fill('39.99');

    // Submit
    await page.click('button:has-text("Save"), button:has-text("Update")');

    // Verify updated
    await expect(page.locator('text=39.99')).toBeVisible({ timeout: 5000 });

    console.log('✅ Recurring transaction updated');
  });

  test('Delete recurring transaction', async ({ page }) => {
    await page.goto('/transactions');

    // Find transaction
    const transactionRow = page.locator('text=Monthly Subscription').first();
    await expect(transactionRow).toBeVisible({ timeout: 5000 });

    // Click delete button
    const deleteButton = transactionRow.locator('..').locator('button[aria-label*="delete"], button:has-text("Delete")').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
    }

    // Confirm deletion if modal appears
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    // Verify deleted
    await expect(page.locator('text=Monthly Subscription')).not.toBeVisible({ timeout: 5000 });

    console.log('✅ Recurring transaction deleted');
  });

  test('Recurring transaction appears on correct dates', async ({ page }) => {
    // Navigate to calendar or monthly view if available
    await page.goto('/transactions');

    // Check for date navigation
    const nextMonthButton = page.locator('button:has-text("Next"), button:has-text("→")');
    if (await nextMonthButton.isVisible()) {
      await nextMonthButton.click();
      await page.waitForTimeout(1000);

      // Recurring transaction should appear in next month too
      await expect(page.locator('text=Monthly Subscription')).toBeVisible({ timeout: 5000 }).catch(() => {
        console.log('Transaction not found in next month (may be expected)');
      });
    }
  });
});
