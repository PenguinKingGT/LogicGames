# Plan 004: Verify the combined site and close migration gaps

> **Executor instructions**: Start only after plans 001-003 are marked DONE.
> This is an integration-hardening plan, not permission to redesign either
> game. Run all gates and make only evidence-driven fixes. Update
> `plans/README.md` when done.
>
> **Drift check (run first)**: `git status --short && git log -5 --oneline`
> Review all changes since plans 002/003. STOP if either migration is partial or
> its source regression tests are absent.

## Status

- **Priority**: P1
- **Effort**: M (about one focused day)
- **Risk**: MED; integration fixes can accidentally cross game boundaries
- **Depends on**: `plans/002-migrate-mastermind.md`,
  `plans/003-migrate-polymine.md`
- **Category**: tests / performance / dx
- **Planned at**: no initial target commit; 2026-08-01

## Why this matters

Passing each game in isolation does not prove that App Router navigation cleans
up timers, keyboard listeners, audio, Canvas state, portals, and styles. This
plan validates the site as one product, locks the migration baseline into a
single quality command, and documents the few manual checks that jsdom cannot
reliably model.

## Current state expected before starting

- `/`, `/games/mastermind`, and `/games/polymine` exist.
- The home is server-rendered from a static catalog.
- MasterMind has at least its original 39 tests.
- PolyMine has at least its original 23 tests and client cleanup coverage.
- Game-specific CSS tokens/resets are namespaced.
- Phaser is only dynamically reachable from the PolyMine route.
- Plans 001-003 individually pass lint, typecheck, coverage, and build.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Lint | `pnpm lint` | exit 0 |
| Types | `pnpm typecheck` | exit 0 |
| Tests | `pnpm test --run` | all tests pass, no open handles |
| Coverage | `pnpm test:coverage` | thresholds pass |
| Build | `pnpm build` | all three routes build |
| Dev review | `pnpm dev` | routes load and navigate client-side |

## Scope

**In scope**:

- Cross-route tests and small fixes within `src/app`, `src/components/site`,
  `src/games/catalog.ts`, and either game's entry/lifecycle/style boundary.
- `README.md` and root scripts/configuration.

**Out of scope**:

- New game rules, features, renderers, shared state, backend, accounts,
  deployment provider config, analytics, or a visual redesign.
- Refactoring pure engines that already pass their migrated tests.
- Editing source sibling repositories.
- Introducing a third game merely to prove extensibility.

## Steps

### Step 1: Audit the final import and route graph

Confirm shared/menu modules import only catalog/site code, not runtime game
modules. Confirm each route imports only its own subtree. Avoid a barrel such as
`src/games/index.ts` that re-exports both runtime games.

**Verify**:

- `rg -n 'games/(polymine|mastermind)' src/app/page.tsx src/components/site src/games/catalog.ts`
  finds no runtime imports (plain href/catalog metadata is fine).
- `rg -n 'phaser' src/app src/components/site src/games/mastermind` finds no
  runtime import.
- `pnpm build` succeeds and reports all three routes.

### Step 2: Add cross-route contract tests

Add tests that assert:

- the catalog and filesystem route slugs remain aligned;
- the home page contains exactly one accessible link for each game;
- each game route exposes a link back to `/`;
- mounting/unmounting each game entry releases its owned resources;
- storage keys are distinct and unchanged;
- importing pure rule modules does not require DOM globals.

Do not fake a full Next router in jsdom. Test route components and client
entries at their explicit boundaries.

**Verify**: `pnpm test --run` -> all original 62 source tests plus new shell and
integration tests pass, with no unhandled rejection or open-handle warning.

### Step 3: Inspect CSS and portal isolation

Search for remaining global game selectors and duplicated generic class names.
Fix leaks at each game root or portal boundary; do not solve them by making one
game's palette the global site palette.

Check in a browser, in this navigation order without a hard reload:

1. `/` -> MasterMind -> `/`.
2. `/` -> PolyMine, toggle dark theme -> `/`.
3. MasterMind -> `/` -> PolyMine -> `/` -> MasterMind.

At each step, verify background, font/color tokens, dialog theme, focus ring,
scroll/overscroll, and body/document attributes return to the correct route.

**Verify**:

- `rg -n '^(:root|html|body|#root)' src/games --glob '*.css'` finds no game
  palette/reset leaks.
- Route navigation leaves no game-specific `data-*` attribute on `html` or
  `body` unless the shared shell explicitly owns and clears it.

### Step 4: Perform responsive, keyboard, and lifecycle acceptance

Use browser responsive tools at 320x568, 768x1024, and 1440x900:

- Home: both games are visible/reachable with no horizontal overflow.
- MasterMind: a full round can be completed; dialogs trap/restore focus; all
  color choices retain text/number alternatives.
- PolyMine: setup, reveal, flag, restart, help, and back navigation work;
  Canvas is crisp at device-pixel ratio 1 and 2; keyboard focus and shortcuts
  work only while the route is active.
- Reduced-motion preference suppresses nonessential motion in both games.
- Returning to a game creates one clean session rather than reviving timers or
  Canvas from the prior mount.

Record this matrix in `README.md` or a concise `docs/verification.md`; do not
claim automated coverage for manual browser observations.

**Verify**: all matrix rows are recorded PASS, or STOP with the exact viewport,
route, and reproduction steps.

### Step 5: Document operation and run the release gate

Create/update root `README.md` with:

- project purpose and the three routes;
- Node/pnpm requirements;
- `pnpm install`, `pnpm dev`, and the quality commands;
- target directory architecture and how to add a future game;
- note that migrated source is owned here and sibling repos are not runtime
  dependencies;
- current limitation: local-only games, no accounts/backend.

Add a single `check` script that runs lint, typecheck, Vitest in run mode, and
build in a clear fail-fast order. Keep coverage as an explicit separate command
unless CI time is known to be acceptable.

**Verify**: `pnpm check && pnpm test:coverage` -> all steps exit 0.

## Test plan

- Retain all 62 source regression tests as the minimum migration baseline.
- Add catalog/route alignment, back-link, resource teardown, storage namespace,
  and pure-module import tests.
- Do not use snapshots as a substitute for interaction assertions.
- Manual browser verification covers real Canvas/WebGL, route navigation,
  visual CSS isolation, responsive layout, and focus behavior that jsdom cannot
  prove.

## Done criteria

- [ ] `pnpm check` exits 0.
- [ ] `pnpm test:coverage` exits 0 at root thresholds.
- [ ] At least the 62 migrated source tests remain present and passing.
- [ ] All three routes build and navigate without full reload requirements.
- [ ] Home/shared code does not runtime-import either game or Phaser.
- [ ] Cross-route navigation leaves no timers, listeners, Phaser instance,
  audio behavior, portal style, or document theme from the previous route.
- [ ] 320x568, 768x1024, and 1440x900 acceptance is recorded.
- [ ] README describes setup, architecture, verification, and future-game
  addition.
- [ ] Neither sibling source repository changed.
- [ ] `plans/README.md` marks plan 004 `DONE`.

## STOP conditions

- Either game is missing original regression coverage.
- Fixing integration requires changing pure game rules or renderer choice.
- Phaser appears in the home or MasterMind runtime graph.
- A CSS leak cannot be resolved within the owning game's root/portal boundary.
- A browser-only defect cannot be reproduced consistently enough to specify a
  test or exact manual acceptance step.

## Maintenance notes

- A future third game should copy the route + namespaced subtree pattern and add
  metadata to the static catalog; it should not cause a generic runtime loader.
- Add Playwright when CI/deployment/browser targets are selected. Its first
  scenarios should be menu-to-game navigation and PolyMine teardown/re-entry.
- Watch route imports and CSS globals in review: they are the two easiest ways
  for a new game to increase home payload or leak design state.

