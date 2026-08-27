import type { Page } from '@playwright/test';
import { loginAs } from './session';

/**
 * Shared journey for the checkout validation specs: sign in, add the
 * Workshop Backpack, open the cart, and land on the checkout form.
 * One flow, one function (DRY) - assertions belong to the specs.
 */
export async function beginCheckoutWithBackpack(page: Page): Promise<void> {
  await loginAs(page);
  await page.getByTestId('add-p-001').click();
  await page.getByRole('link', { name: /^Cart/ }).click();
  await page.getByTestId('checkout').click();
}
