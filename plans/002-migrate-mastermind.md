# Plan 002: Migrate MasterMind into its own Next.js route

> **Executor instructions**: Complete plan 001 first. Follow each step and run
> every verification. Stop on a STOP condition; do not simplify or rewrite game
> rules to make migration errors disappear. Update `plans/README.md` when done.
>
> **Drift check (run first)**:
> `git diff --stat -- src package.json vitest.config.mts 2>/dev/null || true`
> Then run the source baseline in `../MasterMind` shown below. If plan 001 is
> incomplete or source behavior differs, STOP.

## Status

- **Priority**: P1
- **Effort**: M (one to two focused days)
- **Risk**: MED; CSS scoping, portals, storage hydration, and audio are the main
  integration risks
- **Depends on**: `plans/001-nextjs-foundation-and-menu.md`
- **Category**: migration
- **Planned at**: target had no commit on 2026-08-01; source repository had no
  commits and `src/` aggregate SHA-256
  `7e2d86981c0a57a7cb406202b44556f5294fb192f727432e081727af0b7d832a`

## Why this matters

MasterMind already has a tested pure engine, reducer, accessible React UI,
storage adapter, and optional Web Audio. The correct migration preserves those
assets and changes only entry-point, import, styling, and client-boundary
concerns needed by Next.js. It must remain a complete, independent page at
`/games/mastermind`.

## Current state

- Source root: `/Users/huangxiaoxiong/Code/MasterMind`.
- Baseline passes `pnpm lint`, `pnpm typecheck`, `pnpm test` (5 files, 39
  tests), and `pnpm build`.
- `src/game/**` is platform-independent game logic. `src/hooks/use-game.ts`
  wraps its reducer. Preserve all tests and behavior, including duplicate
  colors, ten attempts, exact/misplaced scoring, win-before-final-loss, and
  terminal-state guards.
- `src/lib/storage.ts` already guards SSR with `typeof window` and uses the
  versioned key `mastermind:settings:v1`.
- `src/audio/audio-manager.ts` lazily creates `AudioContext`, tolerates missing
  browser audio, and must never interrupt a move.
- `src/app/App.tsx` is interactive and therefore must become a Client
  Component. `src/main.tsx` and Vite's HTML entry are not migrated.
- `src/index.css` currently sets palette on `:root` and page background on
  `body`; those selectors cannot be copied globally into a multi-game site.
- Radix dialogs portal outside the game subtree. Any CSS variables needed by
  portal content must also be applied to a namespaced portal surface.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Source baseline | `pnpm --dir ../MasterMind lint && pnpm --dir ../MasterMind typecheck && pnpm --dir ../MasterMind test` | 39 tests pass |
| Target tests | `pnpm test --run mastermind` | all MasterMind tests pass |
| Full tests | `pnpm test --run` | no regressions |
| Quality gate | `pnpm lint && pnpm typecheck && pnpm build` | all exit 0 |

## Suggested executor toolkit

- Use `vercel-react-best-practices` if available. Keep the route page server
  rendered and place `'use client'` only at the interactive game entry.

## Scope

**In scope**:

- `src/app/games/mastermind/page.tsx` and optional route metadata/layout files.
- `src/games/mastermind/**` containing migrated app, audio, components, engine,
  hooks, storage, UI primitives, styles, and tests.
- Root dependency manifest and Vitest coverage include/exclude patterns.
- The home catalog's MasterMind status text if plan 001 used a placeholder
  status.

**Out of scope**:

- Editing `../MasterMind`.
- `../MasterMind/src/main.tsx`, `index.html`, Vite config, built assets,
  coverage output, or old plan files.
- Changing rules, color palette, attempt count, scoring semantics, or stored
  setting schema.
- Sharing state or UI primitives with PolyMine during this migration.
- Adding Phaser, a backend, accounts, analytics, or new game modes.

## Steps

### Step 1: Reconfirm the source snapshot

Run the source baseline command and inspect source Git status. Record any drift
in the implementation notes. Because MasterMind has no commits, do not claim a
commit-based provenance. If behavior and test count still match, use the live
source snapshot as the migration source.

**Verify**: source baseline command -> 39 tests pass with lint/typecheck exit 0.

### Step 2: Copy and namespace the game modules

Create `src/games/mastermind/` with the same internal layers:

```text
audio/  components/game/  components/ui/  game/  hooks/  lib/  test/
MasterMindGame.tsx  mastermind.css
```

Copy source modules and colocated tests; rename the app entry to
`MasterMindGame.tsx`. Omit `main.tsx`, Vite environment declarations, and the
Vite-specific setup file if the root setup supersedes it. Rewrite `@/...`
imports to `@/games/mastermind/...` so no generic alias can accidentally bind
to another game. Add `'use client'` to the narrowest entry/modules required by
React hooks or browser libraries; pure `game/**` files must not be Client
Components.

Install the source runtime dependencies needed by this subtree:
`@phosphor-icons/react`, `@radix-ui/react-dialog`,
`@radix-ui/react-switch`, `class-variance-authority`, `clsx`, and
`tailwind-merge`. Reuse root React/Tailwind/Testing Library versions.

**Verify**:

- `rg -n 'from "@/(app|audio|components|game|hooks|lib)' src/games/mastermind`
  returns no matches.
- `pnpm typecheck` reports no unresolved Vite entry or alias errors.

### Step 3: Adapt the Next.js route boundary

Keep `src/app/games/mastermind/page.tsx` a synchronous Server Component that
exports page metadata and renders the shared back-to-menu affordance plus
`MasterMindGame`. The game itself is the one main interface on the page; do not
place it inside a small menu-style card or a modal.

The Client Component must not generate a secret or read storage on the server
in a way that changes prerendered HTML. The current `readSettings()` SSR guard
is acceptable, but verify hydration with stored sound disabled. Preserve test
injection of `initialSecret` and `AudioPort`.

**Verify**: `pnpm build` -> `/games/mastermind` prerenders without `window`,
`localStorage`, or hydration build errors.

### Step 4: Isolate the visual system and Radix portals

Migrate the existing design without letting it style the collection globally:

- Replace `:root`, `html`, `body`, `#root`, and generic global selectors in the
  source stylesheet with a `.mastermind-game` namespace and an explicit
  `.mastermind-portal` namespace for portaled dialog content.
- Apply background, safe-area padding, min-size, overscroll, and palette to the
  game route root, not `body`.
- Keep Tailwind 4 utilities available through the root stylesheet/build, but
  keep semantic classes game-specific.
- Ensure every Radix overlay/content created by this game carries a unique
  MasterMind class. Duplicate the palette variable declarations on the portal
  surface or pass a portal container inside the game root; do not depend on
  global `:root` variables.
- Preserve `prefers-reduced-motion`, 44px targets, focus rings, Chinese labels,
  and 320px mobile layout.

Do not attempt to share the two games' button/dialog components in this plan;
their tokens and icon libraries differ.

**Verify**:

- `rg -n '^(:root|html|body|#root|button\\s*\\{)' src/games/mastermind --glob '*.css'`
  returns no unscoped selectors.
- Component tests that open Rules and Settings dialogs still pass and find
  accessible titles/buttons.

### Step 5: Preserve engine, storage, audio, and integration tests

Port all 39 source tests into the root Vitest environment. Adjust only import
paths and test setup. Do not reduce assertions or replace behavior tests with
snapshots.

Add/adjust a route integration test covering:

- six color choices and four empty slots;
- select/remove/submit flow;
- deterministic win and ten-miss loss via `initialSecret`;
- rules/settings dialogs and restored focus;
- persisted mute suppressing cues;
- game still works when Web Audio is unavailable.

**Verify**: `pnpm test --run mastermind` -> at least the 39 migrated tests plus
any new route/lifecycle test pass.

### Step 6: Finish the route and menu handoff

Remove the MasterMind placeholder, mark the catalog entry playable if needed,
and verify the page has a visible, keyboard-accessible path back to `/` that
does not reset or affect PolyMine storage.

**Verify**: `pnpm lint && pnpm typecheck && pnpm test --run && pnpm build` -> all
exit 0.

## Test plan

- Preserve `engine.test.ts`, `reducer.test.ts`, `storage.test.ts`,
  `audio-manager.test.ts`, and `App.test.tsx` as behavior tests.
- Add only Next-specific assertions needed for route shell and CSS/portal
  integration. Do not assert generated CSS hashes or screenshots in Vitest.
- Full coverage must continue meeting root thresholds; pure engine/reducer and
  storage/audio remain included.

## Done criteria

- [ ] All 39 source tests have migrated without weakened assertions and pass.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test --run`, `pnpm test:coverage`, and
  `pnpm build` all exit 0.
- [ ] `/games/mastermind` is a direct page and `/` links to it.
- [ ] No MasterMind code imports from the sibling repository at build/runtime.
- [ ] No Vite entry/config, `dist`, or `coverage` artifact was copied.
- [ ] MasterMind CSS does not assign global game tokens or body background.
- [ ] Storage remains `mastermind:settings:v1` and is guarded against SSR and
  storage exceptions.
- [ ] Enabling/disabling audio and terminal result dialogs work in tests.
- [ ] No files in `../MasterMind` changed.
- [ ] `plans/README.md` marks plan 002 `DONE`.

## STOP conditions

- The source no longer passes its 39-test baseline or its rule semantics have
  changed.
- Migration requires deleting or weakening a source regression test.
- A browser API executes during server module evaluation or route prerender.
- Style isolation appears to require global tokens shared with PolyMine.
- Fixing migration reveals an actual source-game bug rather than an integration
  issue; report it separately instead of silently changing behavior.

## Maintenance notes

- Keep the engine/reducer free of React and browser APIs. Future difficulty or
  palette features should enter through configuration and tested state
  transitions.
- Review the portal classes and CSS-variable inheritance carefully; dialogs are
  the easiest place for a scoped theme to regress.
- Icon-library consolidation is intentionally deferred until both migrated
  routes are stable and bundle evidence justifies it.

