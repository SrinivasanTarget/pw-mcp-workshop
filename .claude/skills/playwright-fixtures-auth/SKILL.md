---
name: playwright-fixtures-auth
description: Build custom Playwright fixtures, skip repeated login with storage state, and keep tests isolated so they run in any order in parallel. Use when tests need auth, share setup, or are slow because every test re-logs-in.
---

# Fixtures, auth & test isolation

A fixture that injects a collaborator into a test *is* Dependency Injection
(see [[test-craftsmanship]]): the spec names what it needs, the fixture supplies it.
Typical build-out: a base fixture for the app's entry point, then an
**authenticated** variant composed on top of it.

> Before designing auth reuse, find out where the session actually lives. It is
> not always a cookie - some apps keep it in `localStorage`. `storageState`
> captures cookies **and** localStorage/origins, so the pattern works either way;
> just verify what the saved file contains.

## Fixtures > `beforeEach`

- Run only for tests that ask for the fixture (named parameter destructuring).
- Return a typed value via `use()`; teardown after `use`.
- Compose: a fixture can depend on other fixtures (e.g. an authenticated fixture that builds on the base one).

## Isolation contract

Playwright gives every test a fresh browser context + page. So:

- Tests must be **independent** - don't write `test('step 1')` + `test('step 2')` that depend on order.
- "Works alone, fails in suite" → some other test mutated shared state.
- "Works locally, fails in CI" → CI runs more workers in parallel.
- Put shared setup in a fixture, not in another test.

## Storage state - skip the UI login

```ts
// once: after a real login, save the session (cookies + localStorage + origins)
await page.context().storageState({ path: 'playwright/.auth/user.json' });

// after: new contexts start already signed in
const context = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
```

## When to use which auth pattern

| Situation | Use |
|---|---|
| Most tests need the same logged-in user | `globalSetup` + `use.storageState` in config |
| Multiple user types | One storage file per user + `test.use({ storageState })` |
| Test is *about* login | No storage state - start fresh |
| One or two tests share login | A composed authenticated fixture |

## Pitfalls

- **Auth file missing in CI** → generate via `globalSetup`; commit a `.gitkeep`, never real credentials.
- **Token expired** → regenerate in `globalSetup` per run.
- **Leaked state between tests** → storage state loads at context creation; mutations don't persist back. Good.
