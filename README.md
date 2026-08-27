# Playwright MCP Workshop

A staged, self-paced Playwright course built on **Playwright 1.62**. You upgrade
the project yourself, stage by stage, by checking out the next branch. Every
stage works in **OpenCode** and **Claude Code** alike.

App under test: **https://playwright-workshop.pages.dev** - a SauceDemo-style
store (no local server to run). Elements are tagged with `data-test`;
`playwright.config.ts` maps `getByTestId()` to it.

## The branch ladder

Each stage has an **exercise** branch (your starting point) and a **solution**
branch (a verified, working answer). Each exercise branch builds on the
previous stage's solution, so you can always fast-forward.

| Stage | Exercise branch | Solution branch | You learn |
|---|---|---|---|
| 0 | `main` | - | Project baseline: config, specs, fixtures |
| 1 | `01-pw-architecture` | `01-pw-architecture-solution` | Playwright architecture: runner, projects, fixtures, trace, storage state |
| 2 | `02-pw-mcp` | `02-pw-mcp-solution` | The Playwright MCP server: drive a live browser from your agent |
| 3 | `03-mcp-skills` | `03-mcp-skills-solution` | Skills: teach the agent your house style, refactor with it |
| 4 | `04-pw-agents` | `04-pw-agents-solution` | Test Agents: planner → generator → healer |
| 5 | `05-pw-cli` | `05-pw-cli-solution` | The Playwright CLI for agents and terminals |
| 6 | `06-langgraph-jira` | `06-langgraph-jira-solution` | Finale: a LangGraph pipeline - Jira ticket → plan → generated specs (+ self-heal) |

Work a stage like this:

```bash
git checkout 02-pw-mcp          # start the stage
cat exercises/02-*.md           # the exercise sheet
# ... do the work ...
git checkout 02-pw-mcp-solution # compare with a working answer
git checkout 03-mcp-skills      # move on (includes the stage-2 solution)
```

## Setup (once)

- **Node.js 20+** (see `.nvmrc`)
- One agentic client: **OpenCode** (`npm i -g opencode-ai`) or **VS Code +
  Claude Code** (`anthropic.claude-code` extension)

```bash
npm install
npm run install:browsers
npm test          # the baseline suite - all green on main
```

## Test accounts

All use password **`workshop123`**:

| User | Behaviour |
|---|---|
| `standard_user` | Happy path |
| `locked_out_user` | Cannot sign in |
| `problem_user` | Planted UI bugs |
| `glitch_user` | Intermittent behaviour |

## Handy scripts

```bash
npm test              # run the suite (headed locally, headless in CI)
npm run test:ui       # UI mode (time-travel debugging)
npm run test:debug    # step through with the Inspector
npm run report        # open the last HTML report
npm run typecheck     # strict TypeScript check
```

Slides for the architecture stage live outside this repo; everything hands-on
lives here, one branch per stage.
