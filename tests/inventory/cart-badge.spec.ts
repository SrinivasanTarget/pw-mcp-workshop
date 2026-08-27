import { test, expect } from '../fixtures';
import { loginAs } from '../support/session';

/**
 * Implements the cart-badge scenario of specs/inventory.md. Signs in through
 * the UI (no shared storage state) so the cart always starts empty - the
 * app keeps the cart in localStorage, and reusing state would leak items
 * between tests.
 */
test.describe('Cart badge', () => {
  test('counts each added product', async ({ page }) => {
    await loginAs(page);

    await page.getByTestId('add-p-001').click();
    await expect(page.getByTestId('cart-badge')).toHaveText('1');

    await page.getByTestId('add-p-003').click();
    await expect(page.getByTestId('cart-badge')).toHaveText('2');
  });
});
