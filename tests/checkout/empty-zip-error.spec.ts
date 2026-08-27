import { test, expect } from '../fixtures';
import { beginCheckoutWithBackpack } from '../support/checkout';

test.describe('Guest Checkout', () => {
  test('Empty ZIP shows validation error', async ({ page }) => {
    await beginCheckoutWithBackpack(page);

    // ZIP stays empty; the rest of the form is valid
    await page.getByTestId('firstName').fill('Ada');
    await page.getByTestId('lastName').fill('Lovelace');
    await page.getByTestId('place-order').click();

    await expect(page.getByTestId('error-zip')).toHaveText(
      'ZIP / postal code is required'
    );
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  });
});
