import { test, expect } from '../fixtures';
import { loginAs } from '../support/session';

test.describe('Guest Checkout', () => {
  test('Successful checkout - two items', async ({ page }) => {
    await loginAs(page);

    // Add the Workshop Backpack and the Mechanical Keyboard
    await page.getByTestId('add-p-001').click();
    await page.getByTestId('add-p-002').click();
    await expect(page.getByTestId('cart-badge')).toHaveText('2');

    await page.getByRole('link', { name: /^Cart/ }).click();
    await expect(page).toHaveURL(/\/cart$/);

    await page.getByTestId('checkout').click();
    await expect(page).toHaveURL(/\/checkout$/);

    await page.getByTestId('firstName').fill('Ada');
    await page.getByTestId('lastName').fill('Lovelace');
    await page.getByTestId('zip').fill('00001');

    // The order summary lists both items and their combined subtotal
    const orderSummary = page
      .locator('ul')
      .filter({ hasText: 'Workshop Backpack' });
    await expect(orderSummary.getByText('Workshop Backpack')).toBeVisible();
    await expect(orderSummary.getByText('Mechanical Keyboard')).toBeVisible();

    const backpackPrice = 29.99;
    const keyboardPrice = 89.5;
    const expectedSubtotal = (backpackPrice + keyboardPrice).toFixed(2);
    await expect(page.getByText('Subtotal').locator('..')).toContainText(
      `$${expectedSubtotal}`
    );

    await page.getByTestId('place-order').click();

    await expect(page).toHaveURL(/\/checkout\/complete$/);
    await expect(
      page.getByRole('heading', { name: 'Thanks for your order' })
    ).toBeVisible();
  });
});
