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

## MCP (this stage)

One MCP server is wired for both clients: the general **`playwright`** server
(`npx playwright mcp`, bundled with Playwright 1.62) - `.mcp.json` for Claude
Code, `opencode.json` for OpenCode. It is a raw browser driver: no setup
ceremony, `browser_navigate` works immediately. `browser_run_code_unsafe` is
denied by policy. When asked to explore or verify the app, prefer `browser_*`
tools over guessing from source.

## Skills (this stage)

House-style playbooks live in `.claude/skills/` and are shared by both clients
(OpenCode discovers `.claude/skills/*/SKILL.md` natively). Read
`test-craftsmanship` and `playwright-locators` before writing or refactoring
tests; reach for `playwright-network-mocking`, `playwright-api-testing`,
`playwright-debugging`, `playwright-bug-hunting`, `playwright-fixtures-auth`,
and `playwright-trace` when the task matches.

## Test Agents (this stage)

Planner / generator / healer agents are wired for both clients
(`.claude/agents/` and `.opencode/prompts/` + `opencode.json`). Their engine
is the `playwright-test` MCP server; every `browser_*` call there must run
inside a set-up test (`planner_setup_page` / `generator_setup_page` first)
and takes an `intent` argument. Guardrails:

- `tests/seed.spec.ts` stays **active and empty** - never edit it, never
  import it from `tests/fixtures.ts`.
- The planner writes plans to `specs/`; the generator implements plans as
  specs; the healer edits only failing specs, minimally.
- If a failure looks like changed app behaviour (not a stale selector), stop
  and flag it for human review instead of rewriting the expectation.
- Never mix the two MCP servers in one manual flow - separate browsers, no
  shared state.

## Playwright CLI (this stage)

`npm run cli -- <command>` (alias for `npx playwright cli`) drives a live
browser from the terminal - open/snapshot/find/click/fill, video with
chapters, traces. The `playwright-cli` skill is the reference. Prefer it over
the MCP for quick one-off pokes and for scripted, repeatable sessions
(`scripts/`). Session scratch lives in `.playwright-cli/` (gitignored). In
this repo pass CSS `[data-test=...]` selectors or roles/labels - the
standalone CLI does not read `testIdAttribute` from the config.

## LangGraph pipeline (this stage)

`langgraph-agent/` is a standalone LangGraph.js pipeline: Jira ticket (or
`TICKET_FILE` offline ticket) → structured test plan → generated specs via
the general Playwright MCP, reusing `.claude/agents/playwright-test-generator.md`
as its system prompt - so never rename those agent files. It needs
`ANTHROPIC_API_KEY` (see `langgraph-agent/.env.example`). Its `npm run heal`
counterpart repairs failing specs through the `playwright-test` MCP. Both run
one browser at a time - never parallelize their nodes.

## Repo conventions

- `tests/fixtures.ts` extends `test` with an auto network-evidence fixture;
  specs import `test`/`expect` from it, not from `@playwright/test`.
- `tests/checkout/` - the baseline suite (all green on `main`).
- Locators: `getByRole` → `getByLabel` → `getByTestId`; no CSS chains or
  positional XPath. Web-first assertions only; never `page.waitForTimeout()`.
- Exercise sheets live in `exercises/`; solutions live on the matching
  `*-solution` branch, not in this branch.
