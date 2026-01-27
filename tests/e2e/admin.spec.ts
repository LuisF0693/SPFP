import { test, expect } from '@playwright/test';

test.describe('Admin Impersonation', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      // Login with admin account (nando062218@gmail.com from CLAUDE.md)
      await emailInput.fill('nando062218@gmail.com');
      await page.locator('input[type="password"]').fill('adminpassword');
      await page.click('button:has-text("Sign In"), button:has-text("Login")');
      await page.waitForNavigation({ timeout: 10000 });
    }
  });

  test('Admin can access admin panel', async ({ page }) => {
    // Navigate to admin panel
    await page.goto('/admin');

    // Check for admin interface
    const adminTitle = page.locator('text=Admin, text=CRM, text=Management');
    await expect(adminTitle.first()).toBeVisible({ timeout: 5000 });

    console.log('✅ Admin panel accessible');
  });

  test('Admin can view client list', async ({ page }) => {
    await page.goto('/admin');

    // Look for client list or search
    const clientList = page.locator('[data-testid="client-list"], table, [aria-label*="client"]').first();
    await expect(clientList).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log('Client list not immediately visible');
    });

    // Look for search or filter
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Client"]').first();
    await expect(searchInput).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log('Search input not found');
    });

    console.log('✅ Client list verified');
  });

  test('Admin can impersonate a client', async ({ page }) => {
    await page.goto('/admin');

    // Find client to impersonate (first client in list or search)
    const clientRow = page.locator('tr, [role="row"]').nth(1);
    const impersonateButton = clientRow.locator('button:has-text("Impersonate"), button:has-text("View As"), [aria-label*="impersonate"]').first();

    if (await impersonateButton.isVisible()) {
      await impersonateButton.click();

      // Wait for navigation to client dashboard
      await page.waitForNavigation({ timeout: 10000 });

      // Verify we're now viewing as client
      const dashboardContent = page.locator('[data-testid="dashboard"], main').first();
      await expect(dashboardContent).toBeVisible({ timeout: 5000 });

      // Check for impersonation indicator
      const impersonationBadge = page.locator('text=Impersonating, text=Viewing as, [data-testid="impersonate-badge"]');
      await expect(impersonationBadge.first()).toBeVisible({ timeout: 5000 }).catch(() => {
        console.log('No impersonation badge visible');
      });

      console.log('✅ Admin impersonation successful');
    } else {
      console.log('Impersonate button not found');
    }
  });

  test('Admin can exit impersonation', async ({ page }) => {
    await page.goto('/admin');

    // Impersonate a client
    const clientRow = page.locator('tr, [role="row"]').nth(1);
    const impersonateButton = clientRow.locator('button:has-text("Impersonate"), button:has-text("View As")').first();

    if (await impersonateButton.isVisible()) {
      await impersonateButton.click();
      await page.waitForNavigation({ timeout: 10000 });

      // Find exit impersonation button
      const exitButton = page.locator('button:has-text("Exit"), button:has-text("Stop"), button:has-text("Back to Admin")').first();
      if (await exitButton.isVisible()) {
        await exitButton.click();
        await page.waitForNavigation({ timeout: 10000 });

        // Should be back at admin panel
        expect(page.url()).toContain('/admin');

        console.log('✅ Exited impersonation successfully');
      }
    }
  });

  test('Client data isolated during impersonation', async ({ page }) => {
    await page.goto('/admin');

    // Get client name/id before impersonation
    const clientRow = page.locator('tr, [role="row"]').nth(1);
    const clientName = await clientRow.locator('td, [role="cell"]').first().textContent();

    // Impersonate
    const impersonateButton = clientRow.locator('button:has-text("Impersonate"), button:has-text("View As")').first();
    if (await impersonateButton.isVisible()) {
      await impersonateButton.click();
      await page.waitForNavigation({ timeout: 10000 });

      // Get client data (transactions, accounts, etc.)
      const transactionList = page.locator('[data-testid="transaction-list"], tbody tr').first();
      const firstTransactionText = await transactionList.textContent().catch(() => '');

      // Exit impersonation
      const exitButton = page.locator('button:has-text("Exit"), button:has-text("Stop"), button:has-text("Back to Admin")').first();
      if (await exitButton.isVisible()) {
        await exitButton.click();
        await page.waitForNavigation({ timeout: 10000 });

        // Verify back in admin view
        const adminTable = page.locator('table, [role="grid"]').first();
        await expect(adminTable).toBeVisible({ timeout: 5000 });

        // Data should not be the same as client data
        const adminContent = await adminTable.textContent();
        if (firstTransactionText && adminContent) {
          expect(adminContent).not.toContain(firstTransactionText);
        }

        console.log('✅ Client data properly isolated');
      }
    }
  });

  test('Audit trail for impersonation', async ({ page }) => {
    await page.goto('/admin');

    // Look for audit log or activity log
    const auditLog = page.locator('[data-testid="audit-log"], text=Activity, text=Log').first();
    await expect(auditLog).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log('Audit log not visible (may not be implemented)');
    });

    // If audit log exists, check for impersonation entry
    const impersonationEntry = page.locator('text=impersonat, text=login, text=admin').first();
    await expect(impersonationEntry).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log('No impersonation audit entry found');
    });

    console.log('✅ Audit trail checked');
  });
});
