import { test, expect } from '../fixtures';

/**
 * Pure API tests (stage 03): the request fixture, no browser. Note what is
 * NOT here: login. This app authenticates client-side (localStorage), so
 * there is no /api/login to exercise - the API surface is products/checkout.
 */
test.describe('Products API', () => {
  test('GET /api/products returns 200 and exactly 6 well-formed products', async ({
    request,
  }) => {
    const response = await request.get('/api/products');
    expect(response.status()).toBe(200);

    const { products } = await response.json();
    expect(products).toHaveLength(6);

    for (const product of products) {
      expect(product).toMatchObject({
        id: expect.stringMatching(/^p-\d{3}$/),
        name: expect.any(String),
        price: expect.any(Number),
      });
    }
  });

  test('GET /api/products/:id returns the requested product', async ({
    request,
  }) => {
    const response = await request.get('/api/products/p-001');
    expect(response.status()).toBe(200);

    const { product } = await response.json();
    expect(product).toMatchObject({ id: 'p-001', name: 'Workshop Backpack' });
  });
});
