import { test, expect } from '../fixtures';
import { loginAs } from '../support/session';

test.describe('Guest Checkout', () => {
  test('Successful checkout - single item', async ({ page }) => {
    await loginAs(page);

    // Add the Workshop Backpack and open the cart
    await page.getByTestId('add-p-001').click();
    await page.getByRole('link', { name: /^Cart/ }).click();

    // Check out with a complete address
    await page.getByTestId('checkout-btn').click();
    await page.getByTestId('firstName').fill('Ada');
    await page.getByTestId('lastName').fill('Lovelace');
    await page.getByTestId('zip').fill('00001');
    await page.getByTestId('place-order').click();

    await expect(page.getByTestId('thank-you')).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Continue shopping' })
    ).toBeVisible();
  });
});
