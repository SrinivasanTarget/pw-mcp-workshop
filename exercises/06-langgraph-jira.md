# Stage 06 - The pipeline agent: Jira ticket → Playwright tests (finale)

Stages 02-05 kept a human in the chat. This stage removes the chat: a
**LangGraph.js** agent (`langgraph-agent/`) that takes a ticket key, reads the
ticket, plans scenarios, and generates real specs by driving the same
Playwright MCP you used in stage 02 - as a pipeline you could run from CI.

```
START -> fetch_issue -> plan_tests -> generate_tests -> END
         (Jira MCP or   (structured   (general playwright MCP +
          TICKET_FILE)   output LLM)   write_test_file, one browser,
                                       sequential per scenario)
```

It reuses `.claude/agents/playwright-test-generator.md` as the generator's
system prompt - one agent definition, three runtimes (Claude Code, OpenCode,
LangGraph). Full details: `langgraph-agent/README.md`.

Solution branch: `06-langgraph-jira-solution`.

> **Requirements:** an `ANTHROPIC_API_KEY` (the pipeline calls Claude via
> LangChain regardless of which client you used for earlier stages). No Jira
> account needed - offline mode reads `tickets/WSP-101.md`.

## 1 · Run the pipeline offline

```bash
cd langgraph-agent
npm install
cp .env.example .env        # set ANTHROPIC_API_KEY and TICKET_FILE=tickets/WSP-101.md
npm run agent -- WSP-101
```

Watch the three nodes log. Then, from the repo root:

1. Read the generated specs under `tests/login/`.
2. `npm test` - do they pass?
3. Review them like a human PR. At least one house-style deviation is baked
   into the generator's instructions (the specs import from
   `@playwright/test`, not `tests/fixtures`). Find it, fix it, understand why
   the pipeline produced it.

## 2 · Read the ticket, judge the plan

`tickets/WSP-101.md` has three acceptance criteria. Compare them with the
scenarios the `plan_tests` node produced:

- Did every criterion become a scenario? Did it invent any?
- Change the ticket (add a vague criterion like "login should be fast") and
  re-run. What does the planner do with an untestable requirement?

## 3 · Close the loop: add a verify node (exercise)

The pipeline currently trusts the generator. Make it prove itself: add a
fourth node `verify_tests` after `generate_tests` that

1. runs the generated spec files with the Playwright CLI runner
   (`spawnSync("npx", ["playwright", "test", ...files, "--reporter=list"])`
   from the repo root - see `healGraph.ts` for a working `spawnSync` pattern),
2. appends pass/fail per file into the graph state `results`,
3. makes the process exit non-zero when a generated spec fails.

Wire it: `generate_tests -> verify_tests -> END` in `buildGraph`.

## 4 · Real Jira (optional)

Have a Jira? Fill `JIRA_URL` / `JIRA_USERNAME` / `JIRA_API_TOKEN` in `.env`,
remove `TICKET_FILE`, create a real ticket with acceptance criteria, and run
`npm run agent -- <YOUR-KEY>`. The default server is `mcp-atlassian` via
`uvx`.

## 5 · Stretch: self-healing in CI

`npm run heal` (phase 2 in `langgraph-agent/README.md`) finds failing specs
with the JSON reporter and repairs them through the `playwright-test` MCP,
reusing the healer agent definition from stage 04. Stretch exercise: wire it
into a GitHub Actions workflow that opens a `ci/heal-<run id>` PR on failure -
the README sketches the job layout and the loop guard.

## Done when

- The pipeline runs offline end to end and its specs pass under `npm test`.
- Your `verify_tests` node fails the process when you sabotage a generated
  spec.
- You can draw the whole course on one whiteboard: raw specs → MCP → skills →
  Test Agents → CLI → pipeline.

## Further reading

- Self-healing Playwright agent framework (Kailash Pathak) -
  https://kailash-pathak.medium.com/building-a-self-healing-playwright-agent-framework-with-integrating-angular-dashboard-566636d8c8ad
- Playwright agents field report (Chitra Malode) -
  https://www.linkedin.com/posts/chitra-malode-1150bb174_ive-been-using-playwright-for-years-last-share-7493656864451264512-e06h/
