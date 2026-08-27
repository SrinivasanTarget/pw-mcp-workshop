import { test, expect } from '../fixtures';
import { beginCheckoutWithBackpack } from '../support/checkout';

test.describe('Guest Checkout', () => {
  test('Empty Last name shows validation error', async ({ page }) => {
    await beginCheckoutWithBackpack(page);

    // Last name stays empty; the rest of the form is valid
    await page.getByTestId('firstName').fill('Ada');
    await page.getByTestId('zip').fill('00001');
    await page.getByTestId('place-order').click();

    await expect(page.getByTestId('error-lastName')).toHaveText(
      'Last name is required'
    );
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  });
});
