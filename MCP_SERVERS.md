# Playwright MCP servers - what each carries and when to use what

There are **two** Playwright MCP servers you can point your agent (OpenCode or
Claude Code) at, and they are easy to confuse because they share the same
`browser_*` tool names but behave very differently. This repo wires up **both**
for each client (`.mcp.json` for Claude Code, `opencode.json` for OpenCode); the
general server has been around since stage 02, the test server arrives here in
stage 04 with the Test Agents.

> **TL;DR**
> - **`@playwright/mcp` (general)** - a raw browser driver. Full surface (route,
>   storage, tracing, verify), no setup ceremony. **Use it to explore/automate a
>   live browser.** This repo runs it as the `playwright` server (since stage 02).
> - **`playwright run-test-mcp-server` (test)** - the engine behind the
>   planner/generator/healer **Test Agents**. Runs inside a test suite, needs
>   `planner_setup_page`, and carries the `planner_*`/`generator_*`/`test_*`
>   orchestration tools. **Use it to plan/generate/heal tests.** (New in stage 04.)

All numbers below were measured against the versions installed in this repo
(`playwright`, `playwright-core`, `@playwright/test` all **1.62.1**).

---

## First, the packages (they are layers, not siblings)

```
@playwright/test   test runner: test(), expect(), fixtures, config
     |  depends on
     v
playwright         browser-automation library + the `npx playwright` CLI
     |  depends on   (the CLI carries the hidden `run-test-mcp-server` command)
     v
playwright-core    the engine: browser protocol + the bundled MCP tools +
                   BOTH MCP server implementations (incl. lib/entry/mcp.js,
                   the general "Playwright MCP" that @playwright/mcp publishes)
```

- **`playwright`** is a *package/CLI*, **not** an MCP server itself - but since 1.62
  its CLI runs **both** servers first-class: `npx playwright mcp` (general) and
  `npx playwright run-test-mcp-server` (test). It also carries `npx playwright cli`
  (agent-friendly terminal driver), `init-agents`, and `init-skills`.
- **`@playwright/mcp`** is a *separately published* package that exposes the same
  general MCP. Because the engine ships inside `playwright-core`, this repo just runs
  `npx playwright mcp` and needs no extra install.

---

## Side-by-side comparison

| Dimension | `@playwright/mcp` (general) | `playwright run-test-mcp-server` (test) |
|---|---|---|
| What it is | Standalone browser-automation MCP | Hidden subcommand of the `playwright` CLI |
| Launch (this repo) | `npx playwright mcp --caps ...` | `npx playwright run-test-mcp-server` |
| Launch (published) | `npx @playwright/mcp@latest --caps ...` | (same as above) |
| Server name here | `playwright` | `playwright-test` |
| Primary purpose | Drive/inspect a live browser | Author tests with the Test Agents |
| Browser tool count | 24 default -> **42** with documented `--caps` -> **68** with the legacy full caps string | **87** (78 `browser_*` + 9 orchestration) |
| Setup ceremony | **None** - just `browser_navigate` | **`planner_setup_page` first** (attaches to a seed test); browser tools error with "Must setup test" until then |
| Runs inside a test suite | No (raw browser) | Yes (test-runner context) |
| Orchestration tools | None | `planner_*`, `generator_*`, `test_*` (unique to it) |
| Capability control | `--caps=vision,pdf,devtools` documented; `network,storage,testing` still accepted as legacy values | No flag (full surface inside a set-up test) |
| Ties to planner/generator/healer | No | **Yes - this is their engine** |
| Browser/state model | Its own browser context | A different browser inside the test context |
| Best for | Exploration, bug-hunting, network mocking, storage, tracing | Plan -> generate -> heal test authoring |
| In this repo since | **Stage 02** | **Stage 04** |

> **Do not run both in the same manual flow.** They drive **separate browsers with
> no shared state** - log in on one and the other still sees a blank, logged-out
> page. This repo denies the test MCP during stage 1 so exploration stays on one
> browser; stage 2 turns it on for the agents (which drive their own browser).

---

## What each one carries (tool surface by capability)

| Capability group | Example tools | General MCP | Test MCP |
|---|---|---|---|
| **core** (navigate, click, type, snapshot, find, evaluate, dialogs, screenshot, wait, network-*observe*) | `browser_navigate`, `browser_click`, `browser_snapshot`, `browser_find` (new in 1.62), `browser_evaluate`, `browser_network_requests` | YES | YES |
| **testing** (assertions + locator) | `browser_verify_*`, `browser_generate_locator` | YES (`--caps=testing`) | YES |
| **network** (mock/intercept/offline) | `browser_route`, `browser_unroute`, `browser_route_list`, `browser_network_state_set` | YES (legacy `--caps=network`) | YES |
| **storage** (cookies, localStorage, sessionStorage, storage state) | `browser_cookie_*`, `browser_localstorage_*`, `browser_sessionstorage_*`, `browser_storage_state` | YES (legacy `--caps=storage`) | YES |
| **devtools** (tracing, video, highlight, annotate) | `browser_start_tracing`, `browser_start_video`, `browser_highlight`, `browser_annotate` | YES (`--caps=devtools`) | YES |
| **pdf** | `browser_pdf_save` | YES (`--caps=pdf`) | YES |
| **vision** (coordinate mouse) | `browser_mouse_click_xy`, `browser_mouse_wheel` | YES (`--caps=vision`) | YES |
| **testing extras** (assertions + locator) | `browser_verify_*`, `browser_generate_locator` | YES (legacy `--caps=testing`) | YES |
| **orchestration** (the Test Agents) | `planner_setup_page`, `planner_submit_plan` (new in 1.62), `generator_write_test`, `test_run`, ... | **no** | **YES (only here)** |
| **test-MCP-only extras** | `browser_reload`, `browser_check`/`uncheck`, `browser_navigate_forward`, `browser_console_clear`, `browser_press_sequentially`, `browser_keydown`/`keyup`, `browser_network_clear`, `browser_get_config` | no | YES |

### Three caveats worth knowing (changed in 1.62)

1. **The old "advertised, not dispatched" trap is gone.** In 1.61 the test MCP
   advertised 86 tools but dispatched only 28 (`Tool not found` for the rest). In
   1.62 the full 87-tool surface dispatches - but every browser tool errors with
   `Must setup test before interacting with the page` until `planner_setup_page` /
   `generator_setup_page` has run. The general MCP remains the right choice for
   "explore everything" with zero ceremony.
2. **The dispatch gap inverted.** A handful of tools now exist *only* on the test
   MCP: `browser_reload`, `browser_check`/`uncheck`, `browser_navigate_forward`,
   `browser_console_clear`, `browser_press_sequentially`, `browser_keydown`/`keyup`,
   `browser_network_clear`, `browser_get_config`. On the general MCP the old
   workarounds still apply: re-`browser_navigate` instead of reload, `browser_click`
   a checkbox instead of `browser_check`.
3. **`--caps` values were re-tiered.** The documented values are now only
   `vision,pdf,devtools` (24 default -> 42 tools). The old `network,storage,testing`
   values still work as undocumented legacy caps (-> 68 tools), and this repo keeps
   passing them so exploration retains routing, storage, and `browser_verify_*`.
   On the **test MCP** every tool call now also requires an `intent` string
   describing why the action is taken (agents pass it automatically); the general
   MCP does not require it.

---

## When to use what

**Reach for the general `@playwright/mcp` when you want to:**
- explore or drive a live app freely (no test suite, no `planner_setup_page`)
- mock or intercept the network (`browser_route`), go offline, force errors
- inspect/seed cookies, localStorage, sessionStorage, or storage state
- record a trace or video, highlight/annotate, save a PDF
- bug-hunt or investigate ad hoc

**Reach for `playwright run-test-mcp-server` when you want to:**
- run the **planner** (produce a test plan), **generator** (write specs), or
  **healer** (repair failing tests) agents
- author tests inside a real test-runner context and use `test_run`/`test_debug`
- work through the plan -> generate -> heal loop

---

## How this repo uses them

Both clients register both servers:

- **Claude Code** (`.mcp.json`): both servers are available in the chat.
  `browser_run_code_unsafe` is denied on both via `.claude/settings.json`.
- **OpenCode** (`opencode.json`): the main chat gets the general `playwright`
  server only; every `playwright-test` tool is disabled globally
  (`"playwright-test*": false`) and re-enabled per-subagent for
  `playwright-test-planner` / `-generator` / `-healer` (prompts under
  `.opencode/prompts/`). Chat drives the raw browser; the Test Agents own the
  test engine.

Rule of thumb in either client: explore on `playwright`, plan/generate/heal
through the agents (which use `playwright-test`). Never drive both in one
manual flow.

## Appendix - the exact commands

```bash
# General MCP (this repo, bundled since 1.62 - no extra install):
npx playwright mcp --caps vision,pdf,devtools,network,storage,testing

# General MCP (published package equivalent):
npx @playwright/mcp@latest --caps vision,pdf,devtools,network,storage,testing

# Test MCP (Test Agents engine):
npx playwright run-test-mcp-server
```

Verify a server's real surface by asking it over MCP (`initialize` then
`tools/list`): the general MCP returns 68 tools with the caps above (24 with none,
42 with the documented `vision,pdf,devtools`); the test MCP returns 87, all of
which dispatch once a test is set up.
