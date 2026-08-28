---
name: playwright-api-testing
description: Mix API calls into Playwright suites - pure API tests via the request fixture and hybrid tests that seed state via API then assert through the UI. Use when login/setup is slow, when verifying side-effects, or for API regression coverage alongside UI.
---

# API testing with Playwright

The `request` fixture is a built-in HTTP client with the same context model as the browser.

## Pure API test

```ts
import { test, expect } from '@playwright/test';

// Assert on the contract: status, shape, invariants - not incidental values.
test('GET /api/articles returns the published list', async ({ request }) => {
  const res = await request.get('/api/articles');
  expect(res.status()).toBe(200);
  const { articles } = await res.json();
  expect(articles.length).toBeGreaterThan(0);
  expect(articles[0]).toHaveProperty('id');
});
```

Inherits `baseURL`, sends cookies, supports the same `storageState` as the browser.

## Hybrid test - the speedup

Seed state via API (fast, reliable), assert through the UI (the part you care
about). Discover what the app actually exposes before writing this - not every
app has an `/api/login` (some auth is purely client-side; seed storage state
instead, see [[playwright-fixtures-auth]]). Adapt the pattern to the real
endpoints:

```ts
test('shows a drafted article on the dashboard', async ({ page, request }) => {
  const { token } = await (await request.post('/api/login', { data: user })).json();
  await request.post('/api/articles', {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'Q3 report', status: 'draft' },
  });

  await page.goto('/dashboard');
  await expect(page.getByRole('link', { name: 'Q3 report' })).toBeVisible();
});
```

Replaces a 30-second click chain with one API call. Less flaky too - fewer UI steps to break.

## Auth strategies

- **Cookie-based** - share `playwright/.auth/user.json` between browser and `request` (see `[[playwright-fixtures-auth]]`).
- **Bearer token** - fixture that hits `/api/login` once, exposes `apiToken`.
- **Separate context** - `playwrightRequest.newContext({ baseURL, extraHTTPHeaders })` when talking to a second API.

## When to pick which

| Verify… | Do it via |
|---|---|
| Button calls the right endpoint with the right payload | UI |
| Endpoint returns the right shape for various inputs | API |
| End-to-end user flow | Hybrid: API setup + UI assertion |
| Backend bug (5xx, validation) | API |
| Layout / a11y | UI |

## Pitfalls

- **`res.json()` on a 500** throws opaque parse errors. Check `res.status()` first.
- **DB-shared state** between tests breaks isolation. Each test creates and cleans its own data.
- **Mixing `request` and `page.request`** - `page.request` shares cookies with the browser context; the top-level `request` is independent. Pick one per test.
