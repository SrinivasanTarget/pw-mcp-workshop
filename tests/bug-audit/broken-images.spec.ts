import { test, expect } from '../fixtures';

/**
 * Codifies the finding from the stage 02 MCP exploration: the invariant is
 * "no broken product images", and the MCP session showed exactly one
 * violation. We pin the exact known failure instead of skipping the test, so
 * any ADDITIONAL broken image still fails the suite while the known bug is
 * tracked below.
 *
 * BUG(WORKSHOP-1): the Desk Lamp product image points at a 404.
 * When the app fixes it, change the expectation back to [].
 */
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Inventory image audit', () => {
  test('every product image loads, except the known Desk Lamp bug', async ({ page }) => {
    await page.goto('/inventory');

    // The cards render after /api/products resolves, and each image needs to
    // finish fetching before naturalWidth means anything - so poll until all
    // six images are present and complete, then report the broken ones
    // (a failed image completes with naturalWidth 0).
    await expect(page.getByTestId(/^product-image-/)).toHaveCount(6);

    await expect
      .poll(() =>
        page.evaluate(() => {
          const imgs = Array.from(
            document.querySelectorAll('[data-test^="product-image-"]')
          ).map((el) => el as HTMLImageElement);
          if (imgs.some((img) => !img.complete)) return null; // still loading
          return imgs.filter((img) => img.naturalWidth === 0).map((img) => img.alt);
        })
      )
      .toEqual(['Desk Lamp']);
  });
});
