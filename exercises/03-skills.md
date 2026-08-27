# Stage 03 - Skills: teach the agent your house style

Stage 02 proved the agent can drive the app. This stage makes it write **code
you would accept in review**. The difference is not the model - it is the
**skills** now in `.claude/skills/`: markdown playbooks the agent loads on
demand. Claude Code discovers them natively; OpenCode discovers the same
directory (`.claude/skills/*/SKILL.md` is part of its skill search path), so
both clients share one set.

Solution branch: `03-mcp-skills-solution`.

## 0 · See the difference skills make

Before reading any skill, ask your agent:

> Write a Playwright test that logs in and checks the cart badge.

Save what it produces somewhere (do not commit it). Then ask:

> Read the test-craftsmanship and playwright-locators skills, then write the
> same test.

Compare. This before/after is the whole argument for skills.

## 1 · Refactor the checkout specs (exercise)

The five specs in `tests/checkout/` are deliberately raw - locator chains like
`page.locator('[data-test="username"]')`, login steps copy-pasted five times.
With the agent (skills loaded):

1. Extract the login flow into `tests/support/session.ts` as
   `loginAs(page, user)` - a plain function, **not** a page object
   (`test-craftsmanship` explains why).
2. Replace raw `page.locator('[data-test=...]')` with `getByTestId(...)` and
   role/name locators (`playwright-locators` has the priority order).
3. Keep every assertion web-first and in the spec, not in the helper.
4. The suite must stay green: `npm test`.

## 2 · Mock the network (exercise)

With `playwright-network-mocking` loaded:

1. New spec `tests/mocking/empty-inventory.spec.ts`: stub `**/api/products`
   to return `{ "products": [] }` and assert what `/inventory` shows.
   (Spoiler you will discover: there is no empty-state message - the list
   just renders nothing. Assert that truthfully, and note the UX finding.)
2. Bonus: delay the API by two seconds with `route.continue()` and decide
   whether the page needs a loading state.

## 3 · Test the API directly (exercise)

With `playwright-api-testing` loaded: new spec `tests/api/products.spec.ts`
using the `request` fixture only (no browser):

1. `GET /api/products` returns 200 and exactly 6 products.
2. Every product has `id` (`p-NNN`), `name` (string), `price` (number).
3. Discuss: why can this app's *login* not be tested through the API?
   (`CLAUDE.md` has the answer.)

## Done when

- `npm test` green, `npm run typecheck` clean.
- No `page.locator('[data-test=...]')` left in `tests/checkout/`.
- You can articulate what each loaded skill changed about the agent's output.
