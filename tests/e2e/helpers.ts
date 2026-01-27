import { Page, Browser } from '@playwright/test';

/**
 * Helper functions for E2E tests
 */

export const testHelpers = {
  /**
   * Login with email and password
   */
  async login(page: Page, email: string, password: string) {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill(email);
      await page.locator('input[type="password"]').fill(password);
      await page.click('button:has-text("Sign In"), button:has-text("Login")');
      await page.waitForNavigation({ timeout: 10000 });
      return true;
    }
    return false;
  },

  /**
   * Signup with email and password
   */
  async signup(page: Page, email: string, password: string) {
    await page.goto('/');

    const signupButton = page.locator('button:has-text("Sign Up"), a:has-text("Sign Up")').first();
    await signupButton.click();

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    const confirmPasswordField = page.locator('input[placeholder*="Confirm"], input[name*="confirm"]');
    if (await confirmPasswordField.isVisible()) {
      await confirmPasswordField.fill(password);
    }

    await page.click('button:has-text("Sign Up"), button:has-text("Create Account")');
    await page.waitForNavigation({ timeout: 10000 });
  },

  /**
   * Logout
   */
  async logout(page: Page) {
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), [aria-label*="logout"]').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForNavigation({ timeout: 10000 });
      return true;
    }
    return false;
  },

  /**
   * Create a transaction
   */
  async createTransaction(
    page: Page,
    description: string,
    amount: string,
    category?: string,
    isRecurring?: boolean,
    frequency?: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'
  ) {
    await page.goto('/transactions');

    const addButton = page.locator('button:has-text("Add"), button:has-text("New")').first();
    await addButton.click();

    await page.fill('input[placeholder*="description"], input[placeholder*="Description"]', description);

    const amountInput = page.locator('input[type="number"], input[placeholder*="amount"]').first();
    await amountInput.fill(amount);

    if (category) {
      const categorySelect = page.locator('select, [role="listbox"]').first();
      if (await categorySelect.isVisible()) {
        await categorySelect.click();
        await page.locator(`[role="option"]:has-text("${category}")`).click();
      }
    }

    if (isRecurring) {
      const recurringCheckbox = page.locator('input[type="checkbox"][aria-label*="ecurring"], label:has-text("Recurring")').first();
      if (await recurringCheckbox.isVisible()) {
        await recurringCheckbox.click();
      }

      if (frequency) {
        const frequencySelect = page.locator('select:has-text("Month"), [aria-label*="frequency"]').first();
        if (await frequencySelect.isVisible()) {
          await frequencySelect.selectOption({ label: frequency });
        }
      }
    }

    await page.click('button:has-text("Save"), button:has-text("Create")');
    await page.waitForTimeout(2000);
  },

  /**
   * Delete a transaction by description
   */
  async deleteTransaction(page: Page, description: string) {
    const transactionRow = page.locator(`text=${description}`).first();
    if (await transactionRow.isVisible()) {
      const deleteButton = transactionRow.locator('..').locator('button[aria-label*="delete"], button:has-text("Delete")').first();

      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Confirm if dialog
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")').first();
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        await page.waitForTimeout(2000);
        return true;
      }
    }
    return false;
  },

  /**
   * Wait for app to be ready (dashboard visible)
   */
  async waitForApp(page: Page) {
    const dashboard = page.locator('[data-testid="dashboard"], main, .dashboard').first();
    await dashboard.waitFor({ timeout: 10000 });
  },

  /**
   * Get all visible transactions text
   */
  async getTransactions(page: Page) {
    const rows = page.locator('tbody tr, [role="row"]');
    const transactions = [];

    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).textContent();
      if (text && text.trim()) {
        transactions.push(text.trim());
      }
    }

    return transactions;
  },

  /**
   * Find and click element by text pattern
   */
  async clickByText(page: Page, pattern: string | RegExp, index = 0) {
    const elements = page.locator(`text=${pattern}`);
    if (await elements.nth(index).isVisible()) {
      await elements.nth(index).click();
      return true;
    }
    return false;
  },

  /**
   * Check if element is visible
   */
  async isVisible(page: Page, selector: string) {
    try {
      return await page.locator(selector).isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  },

  /**
   * Wait for element with fallback
   */
  async waitForElement(page: Page, selector: string, timeout = 5000) {
    try {
      await page.locator(selector).waitFor({ timeout });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get localStorage value
   */
  async getLocalStorage(page: Page, key: string) {
    return page.evaluate(key => localStorage.getItem(key), key);
  },

  /**
   * Set localStorage value
   */
  async setLocalStorage(page: Page, key: string, value: string) {
    await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key, value });
  },

  /**
   * Clear localStorage
   */
  async clearLocalStorage(page: Page) {
    await page.evaluate(() => localStorage.clear());
  },
};

/**
 * Test data generators
 */
export const testData = {
  /**
   * Generate unique email
   */
  generateEmail(prefix = 'test') {
    return `${prefix}-${Date.now()}@example.com`;
  },

  /**
   * Generate test transaction data
   */
  generateTransaction(overrides?: Partial<any>) {
    return {
      description: `Test Transaction ${Date.now()}`,
      amount: '100.00',
      category: 'Testing',
      ...overrides,
    };
  },

  /**
   * Standard test password
   */
  password: 'SecurePassword123!',
};

/**
 * Performance measurement helpers
 */
export const performanceHelpers = {
  /**
   * Measure action execution time
   */
  async measureTime(action: () => Promise<void>) {
    const startTime = Date.now();
    await action();
    return Date.now() - startTime;
  },

  /**
   * Verify action completes within timeout
   */
  async verifyPerformance(action: () => Promise<void>, maxMs: number) {
    const time = await this.measureTime(action);
    return time <= maxMs;
  },

  /**
   * Get page load metrics
   */
  async getLoadMetrics(page: Page) {
    return page.evaluate(() => {
      const perfData = window.performance.timing;
      return {
        loadTime: perfData.loadEventEnd - perfData.navigationStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        firstPaint: perfData.navigationStart,
      };
    });
  },
};
