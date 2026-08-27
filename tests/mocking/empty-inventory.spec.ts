import { test, expect } from '../fixtures';

/**
 * Network mocking (stage 03): what does the UI do when the API returns
 * nothing? Finding: the app has NO empty-state message - the product list
 * simply renders nothing. The assertions below pin that observed behaviour;
 * if the app ever gains a proper empty state, update them and celebrate.
 */
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Inventory with a mocked API', () => {
  test('renders an empty product list when the API returns no products', async ({
    page,
  }) => {
    await page.route('**/api/products', (route) =>
      route.fulfill({ json: { products: [] } })
    );

    await page.goto('/inventory');

    // The page chrome still renders...
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    await expect(page.getByTestId('sort')).toBeVisible();

    // ...but there are zero product cards and no empty-state message (UX gap).
    await expect(page.getByTestId(/^product-p-/)).toHaveCount(0);
  });
});
