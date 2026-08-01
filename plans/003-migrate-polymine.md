# Plan 003: Migrate PolyMine with a client-only Phaser boundary

> **Executor instructions**: Complete plan 001 first. Follow every verification
> gate. Preserve the source architecture: `GameSession` is the single rules
> state source and `GameController` is the React/Phaser bridge. Stop rather than
> moving rules into React or Phaser. Update `plans/README.md` when done.
>
> **Drift check (run first)**:
> `git -C ../PolyMine diff --stat f93e13a -- src package.json`
> Expected: no output. Then run the source baseline below. STOP on source drift
> or a failed baseline.

## Status

- **Priority**: P1
- **Effort**: L (two to four focused days)
- **Risk**: MED-HIGH; Phaser's browser dependency, controller lifecycle,
  high-DPI resizing, theme scoping, and global input cleanup are the main risks
- **Depends on**: `plans/001-nextjs-foundation-and-menu.md`
- **Category**: migration / performance
- **Planned at**: target had no commit on 2026-08-01; source is clean commit
  `f93e13a`, `src/` aggregate SHA-256
  `791b130d70bb0c550af21af12857d7746e86e403b6340627ac48b6b19db5611f`

## Why this matters

PolyMine is the heavier game and its Phaser chunk is approximately 1.38 MB
minified (about 360 KB gzip) in the verified Vite build. It must not enter the
menu or MasterMind bundles. The migration should retain the tested pure domain
engine and Canvas renderer while creating an explicit browser-only loading and
cleanup boundary for Next.js route navigation.

## Current state

- Source root: `/Users/huangxiaoxiong/Code/PolyMine`, clean commit `f93e13a`.
- Baseline passes `pnpm lint`, `pnpm typecheck`, `pnpm test --run` (6 files, 23
  tests), and `pnpm build`.
- `src/domain/**` is pure TypeScript and must not import React, Phaser, DOM,
  localStorage, or browser APIs.
- `src/app/GameController.ts:27-38` reads storage, creates a session, calls
  `makeSeed()`, and starts `window.setInterval()` in its constructor. It exposes
  `destroy()` at lines 104-109. Next route mounting must construct it in the
  browser and always destroy it on unmount.
- `src/ui/PhaserBoard.tsx:22-40` already dynamically imports the Phaser creation
  module and cleans ResizeObserver, resize listener, animation frame, and game.
- `src/game/create-game.ts` and `BoardScene.ts` import Phaser at module scope and
  read `window`/`document`; those modules cannot be evaluated by SSR.
- `src/persistence/local-storage.ts` uses the versioned key `polymine:v1` but
  directly references `localStorage`; it is safe only behind the client
  constructor unless explicitly guarded.
- `src/styles/globals.css` is 1,333 lines and assigns theme tokens on `:root`
  and `:root[data-theme="dark"]`; it must be scoped before joining the site.
- The source's `AGENTS.md` requires pnpm, Conventional Commits, pure domain
  code, one controller bridge, rules state only in `GameSession`, and the full
  lint/typecheck/test/build quality gate. Preserve those rules in the target.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Source baseline | `pnpm --dir ../PolyMine lint && pnpm --dir ../PolyMine typecheck && pnpm --dir ../PolyMine test --run` | 23 tests pass |
| Target tests | `pnpm test --run polymine` | all PolyMine tests pass |
| Full tests | `pnpm test --run` | no regressions |
| Quality gate | `pnpm lint && pnpm typecheck && pnpm build` | all exit 0 |

## Suggested executor toolkit

- Use `vercel-react-best-practices` if available, especially dynamic imports
  and conditional loading for Phaser.
- Follow `../PolyMine/AGENTS.md` architectural constraints even though code is
  copied into a new repository.

## Scope

**In scope**:

- `src/app/games/polymine/page.tsx` and optional route metadata/loading files.
- `src/games/polymine/**`: app/controller, domain, game/Phaser adapter,
  persistence, UI, styles, utilities, and all tests.
- Root dependencies and Vitest coverage configuration.
- The home catalog's PolyMine status if plan 001 used a placeholder.

**Out of scope**:

- Editing `../PolyMine` or changing its Git history.
- Vite entry/config, `dist`, `coverage`, favicon unless intentionally adopted
  as this route's artwork, or old plan files.
- Rewriting topologies, mine placement, first-click safety, chord behavior,
  timing, scoring, keyboard controls, or Phaser rendering.
- Replacing Phaser, merging it into the shared shell, or eagerly importing it.
- Sharing UI primitives with MasterMind during migration.

## Steps

### Step 1: Reconfirm the clean source baseline

Run the drift and baseline commands. Confirm commit `f93e13a`, 23 passing
tests, and no source modifications caused by the migration.

**Verify**: source baseline -> lint/typecheck exit 0 and 23 tests pass.

### Step 2: Copy the layered modules into a namespace

Create this target shape while retaining internal separation:

```text
src/games/polymine/
  PolyMineGame.tsx
  app/GameController.ts
  domain/**
  game/**
  persistence/**
  ui/**
  styles/polymine.css
  test/**
```

Copy all relevant source/tests, but omit `main.tsx`, Vite declarations/config,
build output, coverage, and source plan docs. Rewrite relative imports as
needed without creating a barrel that pulls Phaser into domain/UI consumers.
Install runtime dependencies: Phaser, Lucide React, Radix Dialog/Slot, CVA,
clsx, and tailwind-merge. Use pinned compatible versions in the lockfile rather
than retaining manifest entries with the literal string `latest`.

Keep `domain/**` byte-for-byte or behaviorally equivalent except import-path
relocation. Do not add `'use client'` to domain files.

**Verify**:

- `rg -n 'react|phaser|window|document|localStorage' src/games/polymine/domain`
  returns no imports or runtime references.
- `pnpm typecheck` reports no unresolved Vite entry or sibling-repo imports.

### Step 3: Build an explicit client lifecycle boundary

Keep `src/app/games/polymine/page.tsx` as a synchronous Server Component with
metadata, a back-to-menu affordance, and a small Client Component entry.

The Client Component must:

1. Construct exactly one `GameController` lazily in the browser (for example
   with a stable ref/lazy state inside the Client Component, not at module
   scope).
2. Render the migrated app with that controller.
3. Call `controller.destroy()` in effect cleanup so client navigation to `/`
   or MasterMind stops the 250ms timer and releases subscriptions.
4. Behave correctly under React Strict Mode development remounts.

Add a focused lifecycle test using a controller factory or spy: one controller
per active mount, `destroy()` exactly once for each constructed instance on
unmount. Do not expose a global singleton.

Optionally make `loadData()` explicitly return defaults when `window` is
undefined, matching MasterMind's defensive adapter, but do not use that guard
as permission to construct the controller during SSR.

**Verify**: lifecycle test passes, and `pnpm build` prerenders the route without
`window`/`localStorage` failures or a live interval keeping tests open.

### Step 4: Keep Phaser outside server and unrelated route bundles

Create a PolyMine-only Client Component that uses `next/dynamic` with
`ssr: false` for the Canvas board, or preserve the board's internal dynamic
`import()` while ensuring no parent module statically imports `create-game`,
`BoardScene`, or runtime Phaser. A simple accessible loading state should hold
the board area while the chunk arrives.

Requirements:

- Only modules under `src/games/polymine/game/**` and the browser-only board
  boundary may runtime-import Phaser.
- Type-only imports must remain `import type`.
- Preserve cleanup for Phaser Game, scene subscriptions, ResizeObserver,
  resize listener, and animation frame.
- Preserve high-DPI sizing with the existing device-pixel-ratio cap.
- A failed dynamic import must produce a recoverable visible error rather than
  an unhandled promise rejection.

The source build proves Phaser is the dominant chunk; do not weaken this
boundary for convenience.

**Verify**:

- `rg -n 'phaser' src/app src/components src/games/mastermind`
  returns no match.
- Unit test mocks still avoid constructing a real WebGL/Canvas game.
- `pnpm build` succeeds.

### Step 5: Scope PolyMine theme, CSS, keyboard, and portals

Refactor the copied stylesheet so it cannot change the home or MasterMind:

- Replace `:root`/dark-root tokens with `.polymine-game` token declarations and
  a `data-theme` on the PolyMine root.
- Change `applyTheme()` so it updates component-owned state/attributes, not
  `document.documentElement.dataset.theme`.
- Scope reset, background, buttons, layout, and all semantic selectors below
  `.polymine-game`. Ensure Radix portal content receives a
  `.polymine-portal`/theme class or renders into a container that inherits the
  game tokens.
- Do not assign `body` overscroll/background or generic button styles.
- Preserve light/dark/system modes, reduced motion, setup/game responsive
  layouts, safe-area behavior, and focus-visible styles.
- Keep global `R`/`M` shortcuts active only while this route is mounted and
  preserve their existing cleanup.

**Verify**:

- `rg -n '^(:root|html|body|#root|button\\s*\\{)' src/games/polymine --glob '*.css'`
  returns no unscoped selectors.
- Existing App tests for setup flow/help still pass.
- New theme test proves changing PolyMine theme does not write a theme
  attribute to `document.documentElement`.

### Step 6: Port all domain, scene, persistence, and app tests

Preserve the 23 source tests for deterministic RNG, topology invariants,
first-click safety, state transitions, chord behavior, invalid/terminal
actions, persistence, Phaser scene cleanup, and app entry flow. Adjust import
paths and root setup only. Do not drop the mocked Phaser lifecycle test.

Add Next-specific tests for controller unmount cleanup, client-only Canvas
fallback/error behavior where feasible, and route-level back link.

**Verify**: `pnpm test --run polymine` -> at least 23 migrated tests plus new
lifecycle/integration tests pass with no open-handle warning.

### Step 7: Finish the route and menu handoff

Remove the placeholder route, mark the catalog entry playable if needed, and
ensure `/games/polymine` is a full game page rather than embedded in the menu
layout. Keep a visible accessible link back to `/` outside the Canvas.

**Verify**: `pnpm lint && pnpm typecheck && pnpm test --run && pnpm build` -> all
exit 0.

## Test plan

- Preserve all source test cases in `domain`, topology, RNG, persistence,
  `BoardScene`, and app flow.
- Add controller mount/unmount cleanup and locally scoped theme tests.
- Mock the Canvas boundary in DOM integration tests; keep the existing scene
  lifecycle unit test for Phaser subscription cleanup.
- Include pure domain files in coverage. Phaser rendering and copied UI
  primitives may be excluded only with a documented reason in Vitest config.

## Done criteria

- [ ] All 23 source tests migrated without weaker assertions and pass.
- [ ] New controller cleanup and scoped-theme tests pass.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test --run`, `pnpm test:coverage`, and
  `pnpm build` all exit 0.
- [ ] `/games/polymine` is a direct page and `/` links to it.
- [ ] Phaser is dynamically/browser-only loaded and absent from home and
  MasterMind source module graphs.
- [ ] Controller and Phaser resources are released on route unmount.
- [ ] `domain/**` remains platform-independent.
- [ ] Storage key remains `polymine:v1`; failures remain non-fatal.
- [ ] No PolyMine palette/theme/reset is assigned globally.
- [ ] No files in `../PolyMine` changed.
- [ ] `plans/README.md` marks plan 003 `DONE`.

## STOP conditions

- `../PolyMine` is not clean at `f93e13a` or no longer passes 23 tests.
- A migration step requires domain code to import React, Phaser, or browser
  APIs.
- Phaser evaluates during Next.js server build/prerender.
- Controller lifecycle cannot be made Strict-Mode-safe without changing its
  public contract beyond construction/disposal.
- A rule or topology test must be deleted/weakened to proceed.
- Theme scoping would require changing the collection's global document theme.

## Maintenance notes

- Review bundle boundaries whenever importing a game module into shared code;
  an innocent barrel export can pull Phaser into unrelated routes.
- Every future timer, event listener, observer, audio subscription, or Phaser
  scene hook needs symmetric teardown because App Router navigation does not
  reload the document.
- Preserve the controller/session division when adding stats or daily puzzles.
