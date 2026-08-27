import { test, expect } from '../fixtures';

/**
 * Starts signed in via the storage state captured by tests/auth.setup.ts.
 * Scoped here with test.use (not on the whole chromium project) because the
 * checkout specs deliberately exercise the login UI.
 */
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Inventory sorting', () => {
  test('sorts by price, low to high', async ({ page, request }) => {
    // The API is the source of truth for prices - derive the expectation
    // instead of hardcoding product names that may change.
    const response = await request.get('/api/products');
    expect(response.ok()).toBeTruthy();
    const { products } = await response.json();
    const byPriceAsc = [...products].sort(
      (a: { price: number }, b: { price: number }) => a.price - b.price
    );
    const cheapest = byPriceAsc[0].name;
    const priciest = byPriceAsc[byPriceAsc.length - 1].name;

    // No login steps: storage state puts us straight on the inventory.
    await page.goto('/inventory');

    await page.getByTestId('sort').selectOption('price-asc');

    const names = page.getByTestId(/^product-name-/);
    await expect(names.first()).toHaveText(cheapest);
    await expect(names.last()).toHaveText(priciest);
  });
});
