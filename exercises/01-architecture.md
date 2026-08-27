# Stage 01 - Playwright architecture, hands on

The slides covered the theory: test runner vs library, workers, projects,
fixtures, auto-waiting, the trace format. This sheet makes each concept
concrete in the repo you are holding. No AI tooling yet - that starts in
stage 02.

Solution branch: `01-pw-architecture-solution`.

## 1 · Feel the runner

```bash
npm test                # headed locally - watch the 5 specs run in parallel
npm run test:ui         # UI mode: time-travel through a run
npm run test:debug      # the Inspector: step a spec action by action
```

- In UI mode, open `two-item-checkout.spec.ts` and walk the timeline. Find the
  DOM snapshot at the moment the cart badge is asserted.
- Question to answer for yourself: why do the specs not contain a single
  explicit wait?

## 2 · Read a trace

Force a trace on a passing run, then open it:

```bash
npx playwright test tests/checkout/single-item-checkout.spec.ts --trace on
npx playwright show-report      # click the trace icon
```

Locate: network tab, console tab, the action timeline, the before/after DOM
snapshots per action.

## 3 · Study the fixture

Read `tests/fixtures.ts`. It is a real dependency-injection seam:

- Why is it declared `{ auto: true }`?
- Why does it attach evidence only when `testInfo.status !==
  testInfo.expectedStatus`?
- Break the app on purpose (`page.route` a 500 onto `/api/products` in any
  spec, or just assert something false) and watch `network-failures.txt`
  appear in the report.

## 4 · Write a spec: inventory sorting (exercise)

Create `tests/inventory/sort.spec.ts`:

1. Log in as `standard_user`.
2. Use the **Sort** dropdown (`getByTestId('sort')`) to sort by price,
   low → high.
3. Assert the first product card is the cheapest product and the last is the
   most expensive. (Hint: `GET /api/products` tells you the prices; assert
   names, not indexes into CSS.)
4. Keep it green and keep it free of `waitForTimeout`.

## 5 · Skip the UI login: storage state (exercise)

Login is client-side (`localStorage["workshop-auth"]`), which makes it a
perfect storage-state candidate:

1. Add a setup project (`tests/auth.setup.ts`) that signs in once through the
   UI and saves `playwright/.auth/user.json` via
   `page.context().storageState({ path })`.
2. Wire it in `playwright.config.ts`: a `setup` project matching
   `auth.setup.ts`, and `dependencies: ['setup']` on `chromium`.
3. Do **not** put `storageState` on the whole `chromium` project - the checkout
   specs deliberately walk through the login UI and would break if the browser
   started signed in. Scope it to your new spec instead:
   `test.use({ storageState: 'playwright/.auth/user.json' })` at the top of
   `sort.spec.ts`, then `page.goto('/inventory')` straight in - no login steps.
4. Run the suite; your sort spec should never touch the login form.

## Done when

- `npm test` is green, including your two new files.
- `npm run typecheck` is clean.
- You can explain: worker, project, fixture, storage state, trace - each in
  one sentence, each pointing at a line of this repo.
