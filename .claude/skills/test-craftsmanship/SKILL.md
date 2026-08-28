---
name: test-craftsmanship
description: SOLID, DRY, clean code, the Dependency Rule, code smells, and design-pattern discipline (Uncle Bob's canon) applied to test automation for UI and API. Use when writing, refactoring, or reviewing test code, or deciding how much structure a suite needs. Explains why lightweight functional helpers beat the Page Object Model.
---

# Test craftsmanship

Test code is production code. It is read far more than it is written, it outlives the
features it covers, and a flaky or unreadable suite erodes trust faster than no suite
at all. So hold it to the same bar as the app.

This skill aggregates Robert C. Martin's craft - Clean Code, Clean Architecture, The
Clean Coder, Clean Agile, and design-pattern discipline - and applies it to tests. It
is about **structure and design, not syntax**: naming style, line length, and
formatting stay the job of the linter/formatter, not this skill.

The principles are application-agnostic. Where an example names a flow (sign-in,
form submission), that is illustration only - apply the same move to whatever flows
the suite in front of you actually repeats.

## Clean code, applied to tests

- **Names reveal intent.** A test title states a behaviour ("rejects an expired
  card"), not a mechanic ("test1"). A helper is a business verb from the app's own
  domain (`signIn`, `submitOrder`, `archiveReport`), never `doStuff`.
- **Small things that do one thing.** If you can extract another meaningful step from a
  function, it was doing two. Extract until you can't.
- **Few arguments.** 0-2 is comfortable, 3 is a smell, more wants an object. Never a
  boolean flag argument - `submit(true)` should be two named functions.
- **Command-Query Separation.** A function either *does* something (returns void) or
  *answers* something (returns a value/Locator) - never both. Actions command; query
  helpers answer.
- **DRY, but the right abstraction.** A duplicated flow collapses into one function; a
  duplicated locator lives in one place. But a little duplication beats the wrong
  abstraction - don't unify two things that merely look alike today.
- **Fail loudly.** Prefer an exception with a clear message over a silent fallback.
- **No comments that apologise for the code.** Make the code say it; keep comments for
  the "why", not the "what".
- **Assertions are web-first.** `await expect(locator).toX()`, never
  `expect(await locator.textContent())`. Let Playwright wait ([[playwright-locators]]).

## SOLID, in context

| Principle | In test automation |
|---|---|
| **SRP** - one reason to change | One helper owns one flow or one endpoint. When that screen or endpoint changes, exactly one file changes. |
| **OCP** - open to extension | Add a new action/query as a new function; you stop editing an ever-growing god-object. |
| **LSP** - substitutability | Any implementation of a helper interface works wherever the interface is expected - including an authenticated variant. |
| **ISP** - small interfaces | API helpers take the narrow `APIRequestContext`, not a whole app facade. Depend on exactly what you use. |
| **DIP** - depend on abstractions | Specs depend on intent-named helpers; the concrete `page`/`request` are injected through fixtures, not imported globals. |

## The Dependency Rule (Clean Architecture)

Dependencies point **inward**. Business intent (the sign-in action, an API client)
is the center; the Playwright driver is a detail at the edge, hidden behind the
helper layer. Specs never reach past that layer to poke `page` plumbing directly,
so swapping how you reach the browser or API changes one seam, not the suite.

## Code smells (name them in review)

| Smell | Meaning |
|---|---|
| Rigidity | A small change forces many edits. |
| Fragility | A change breaks unrelated areas. |
| Immobility | Hard to reuse a piece in another context. |
| Viscosity | Easy to hack, hard to do the right thing. |
| Needless complexity | Speculative or unused abstraction. |
| Needless repetition | DRY violated; the same idea in several places. |
| Opacity | Code is hard to understand. |

In a review, **name the smell with its file/function and propose one or two concrete
refactors** ("SRP: this parses and asserts - split it", "invert this so the spec
depends on the helper, not `page`"). "Violates SOLID" with no location or fix is not
a review.

## Design patterns: use vs misuse

- Introduce a pattern when a **real** design need appears - roughly the *third
  duplication* or the *second reason to change* - and name it so intent is clear.
- **Avoid cargo cult.** Don't add a Factory/Strategy/Screenplay layer because a suite
  "should" have one. Signs of misuse: a pattern name in every file, layers that only
  delegate without logic, abstraction that makes simple code harder to follow (the
  *needless complexity* smell).
- **Plain functions first.** For a small suite, a handful of intent-named functions
  reads clearly and is enough. A facade comes when helpers start needing shared
  state; the **Screenplay pattern** (Actors/Abilities/Tasks/Questions) is the
  principled step after *that*, if a second axis of change appears - many reused
  flows across a broad UI **and** API surface. Never build either speculatively;
  that would be the smell, not the cure.

## Why NOT the Page Object Model

The POM is the industry default, and it fights the principles above:

- **It violates SRP.** A page object accretes locators + actions + often assertions for
  a whole page - many reasons to change, and it grows into a god-object.
- **It thinks in UI, not user.** Methods describe *how* you click, not *what* the user
  achieves, so tests read as mechanics.
- **It doesn't cross interfaces.** A page object is welded to the screen, so you can't
  reuse a flow via the API. When the UI is the only abstraction, everything gets tested
  through it - slow and brittle.
- **It leans on inheritance** (a `BasePage`) where composition is looser and cleaner.

## One model, UI or API

The same intent helpers drive the browser or call HTTP directly via `request`. A hybrid test
seeds state through the API (fast, reliable) and asserts through the UI. The principles
don't change between UI and API - only the collaborator does ([[playwright-api-testing]],
[[playwright-fixtures-auth]]).

## Shape of a lean suite

```
tests/support/       intent-named helpers; one thing each, reused (DRY)
tests/fixtures.ts    extends test with cross-cutting fixtures (the DI seam)
tests/**/*.spec.ts   read as intent; web-first assertions live here, in the open
```

Grow structure only as duplication justifies it: a support function first; a facade
only if helpers start needing shared state.

## Refactoring workflow

The common failure when refactoring a suite is stopping after the first obvious
extraction. The inventory step is what makes the refactor complete:

1. **Inventory the whole suite first.** Before touching code, read every spec and
   list all duplication: repeated flows (sign-in, navigation, data setup,
   multi-step form submissions), repeated locators, repeated magic values.
2. **Extract every repeated flow** into an intent-named helper - not just the first
   one you notice. Each item on the inventory either becomes a helper or gets a
   reason to stay inline.
3. **Replace brittle locators** per the priority in [[playwright-locators]].
4. **Keep assertions in the specs**, web-first, never hidden inside a helper.
5. **Re-run the type check and the tests** after each extraction, not only at the end.

## Craft checklist (before you push a test)

- Does the spec read as intent, with no raw locators or `page.` plumbing?
- Is each new function one responsibility, one reason to change?
- Did *every* duplicated flow become a shared function, not just the first?
- Are all assertions web-first, and none hiding inside an action?
- Would this still work if you swapped the UI for the API surface?
- Did you add structure only where duplication/variation justified it (no cargo cult)?
- Linter and formatter run separately and green (craft is not style).
