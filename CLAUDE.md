# Project guide for the AI assistant

> Read by Claude Code as `CLAUDE.md`; OpenCode falls back to this file when no
> `AGENTS.md` exists, so it serves both clients. It grows as the workshop
> stages add capabilities - check the branch you are on.

This is a staged Playwright workshop (Playwright **1.62**). The repo is the
exercise material: prefer minimal, teaching-quality changes over clever ones,
and never solve an exercise the user has not asked you to solve.

## The app under test

Deployed at **https://playwright-workshop.pages.dev** (`baseURL`; override with
`BASE_URL`). A SauceDemo-style store.

- `/login` - 4 accounts, password `workshop123`: `standard_user` (happy path),
  `locked_out_user`, `problem_user`, `glitch_user` (the last three have planted
  quirks).
- `/inventory` (6 products, sort, add-to-cart), `/cart`, `/checkout`,
  `/checkout/complete`, `/playground` (forms, tables, dialogs, drag-drop,
  iframes, shadow DOM, async, toasts).
- API: `GET /api/products` (+ `/:id`), `/api/health`, `POST /api/checkout`,
  `/api/orders/:id`. **Login is client-side** - no `/api/login`; the session
  lives in `localStorage["workshop-auth"]`, the cart in
  `localStorage["workshop-cart"]`.
- Elements are tagged **`data-test`** (not `data-testid`);
  `playwright.config.ts` sets `testIdAttribute: 'data-test'`, so
  `getByTestId('username')` resolves to `[data-test="username"]`.
- Known planted bug: the **Desk Lamp** product image 404s.

## Repo conventions

- `tests/fixtures.ts` extends `test` with an auto network-evidence fixture;
  specs import `test`/`expect` from it, not from `@playwright/test`.
- `tests/checkout/` - the baseline suite (all green on `main`).
- Locators: `getByRole` → `getByLabel` → `getByTestId`; no CSS chains or
  positional XPath. Web-first assertions only; never `page.waitForTimeout()`.
- Exercise sheets live in `exercises/`; solutions live on the matching
  `*-solution` branch, not in this branch.
