# Stage 05 - The Playwright CLI: a browser in your terminal

Since 1.62 Playwright bundles `playwright-cli` - the same engine the MCP
server exposes to agents, driven from a shell. Where the MCP is "the agent's
hands", the CLI is *your* hands (and what agent skills call under the hood).
Run it here as:

```bash
npm run cli -- <command>      # or: npx playwright cli <command>
```

The `playwright-cli` skill (`.claude/skills/playwright-cli/`) is the full
reference - both clients can load it, and so can you: it is just markdown.

Solution branch: `05-pw-cli-solution` (a complete scripted session).

> The CLI stores session state under `.playwright-cli/` (gitignored). One
> caveat from the skill: the standalone CLI defaults `getByTestId` to
> `data-testid`, but this app uses `data-test` - prefer role/label locators
> or CSS `[data-test=...]` selectors here.

## 1 · A hand-driven session

```bash
npm run cli -- open https://playwright-workshop.pages.dev/login
npm run cli -- snapshot                 # accessibility tree with [ref=eN] ids
npm run cli -- find "Sign in"           # new in 1.62: search the page
npm run cli -- fill e12 standard_user   # use the real refs from YOUR snapshot
npm run cli -- fill e14 workshop123
npm run cli -- click e16
npm run cli -- snapshot                 # now /inventory
npm run cli -- screenshot --filename=inventory.png
npm run cli -- close
```

Notice: every action responds with a fresh snapshot reference - the same
observe-act-observe loop you watched the MCP agents run in stages 02-04.

## 2 · Evidence artifacts (exercise)

1. Record a video of a full checkout with chapter markers:
   `video-start`, `video-chapter "Login"`, act, `video-chapter "Checkout"`,
   act, `video-stop`. Add `video-show-actions` first so every click gets an
   on-screen callout.
2. Save a trace of the same session (`trace-start` / `trace-stop`) and open
   it with `npx playwright show-trace`.
3. Try `open --mobile` and compare the inventory snapshot with desktop.

## 3 · Script it (exercise)

Turn section 1 into a committed script: `scripts/cli-checkout-session.sh`,
runnable end to end on a fresh checkout. Rules:

- No hardcoded `eN` refs - they change between runs. Use selector-based
  commands (`[data-test=...]` CSS) instead of snapshot refs.
- End with the thank-you page confirmed (`find "Thanks"` or a snapshot grep)
  and `close`.

## 4 · Full circle (discussion)

You have now used all four surfaces on one app: raw specs (stages 00-01),
the MCP server (02), skills (03), Test Agents (04), and the CLI (05). For
each, name one task where it beats the other three. That answer is the
workshop takeaway.

## Done when

- Your script runs clean twice in a row.
- You produced a chaptered video and a trace from a CLI session.
- `npm test` still green (nothing in this stage should have touched specs).
