import type { Page } from '@playwright/test';

export type WorkshopUser =
  | 'standard_user'
  | 'locked_out_user'
  | 'problem_user'
  | 'glitch_user';

/**
 * Signs in through the UI and lands on /inventory. A plain business-intent
 * function, not a page object: it owns the login flow and nothing else
 * (see the test-craftsmanship skill). Assertions stay in the specs.
 */
export async function loginAs(
  page: Page,
  user: WorkshopUser = 'standard_user'
): Promise<void> {
  await page.goto('/login');
  await page.getByTestId('username').fill(user);
  await page.getByTestId('password').fill('workshop123');
  await page.getByTestId('login-submit').click();
}
