import { test as setup, expect } from '@playwright/test';

/**
 * Project-dependency setup: signs in once through the UI and captures the
 * browser storage (the app keeps its session in localStorage) so other
 * projects can start already authenticated via `storageState`.
 *
 * Wired in playwright.config.ts as the `setup` project; `chromium` declares
 * `dependencies: ['setup']`, so this always runs first.
 */
const authFile = 'playwright/.auth/user.json';

setup('authenticate as standard_user', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('username').fill('standard_user');
  await page.getByTestId('password').fill('workshop123');
  await page.getByTestId('login-submit').click();

  await expect(page).toHaveURL(/\/inventory$/);

  await page.context().storageState({ path: authFile });
});
