import { test, expect } from '../fixtures';

/**
 * Implements specs/inventory.md (stage 04, generator output reviewed to house
 * style). Starts signed in via the storage state captured by
 * tests/auth.setup.ts; the cart-badge scenario uses a fresh sign-in path
 * through the UI helpers instead, because the badge state lives in
 * localStorage and storage state would leak it between tests.
 */
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Inventory browsing', () => {
  test('lists all six products with name, price and stock note', async ({
    page,
  }) => {
    await page.goto('/inventory');

    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    await expect(page.getByTestId(/^product-p-/)).toHaveCount(6);
    await expect(page.getByTestId(/^product-name-/)).toHaveCount(6);
    await expect(page.getByTestId(/^product-stock-/)).toHaveCount(6);

    for (const price of await page.getByTestId(/^product-price-/).all()) {
      await expect(price).toHaveText(/^\$\d+\.\d{2}$/);
    }
  });

  test('sorts by price, low to high', async ({ page }) => {
    await page.goto('/inventory');
    await page.getByTestId('sort').selectOption('price-asc');

    const names = page.getByTestId(/^product-name-/);
    await expect(names.first()).toHaveText('Lab Notebook');
    await expect(names.last()).toHaveText('Field Recorder');
  });

  test('out-of-stock product cannot be added', async ({ page }) => {
    await page.goto('/inventory');

    await expect(page.getByTestId('product-stock-p-004')).toHaveText(
      'Out of stock'
    );
    const addButton = page.getByTestId('add-p-004');
    await expect(addButton).toBeDisabled();
    await expect(addButton).toHaveText('Unavailable');
  });

  test('low-stock product is flagged but addable', async ({ page }) => {
    await page.goto('/inventory');

    await expect(page.getByTestId('product-stock-p-006')).toHaveText(
      'Only 1 left'
    );
    await expect(page.getByTestId('add-p-006')).toBeEnabled();
  });
});
