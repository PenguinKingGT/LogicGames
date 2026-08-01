# Plan 005: Add a complete Nonogram game as the third standalone route

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report instead of improvising. When done, update this plan's row in
> `plans/README.md` unless a reviewer explicitly owns the index update.
>
> **Drift check (run first)**:
> `git diff --stat 2f74837..HEAD -- README.md vitest.config.mts src/games/catalog.ts src/games/catalog.test.ts src/components/site/GameCard.tsx src/app/page.test.tsx src/app/globals.css src/app/games/nonogram src/games/nonogram`
> Expected before implementation: no output. If any listed existing file has
> changed, compare it with the excerpts below and STOP on an architectural or
> product-contract conflict.

## Status

- **Priority**: P1
- **Effort**: L (three to five focused days including puzzle validation,
  responsive input, and tests)
- **Risk**: MED; unique-puzzle validation, drag painting, undo grouping, and a
  readable 15×15 mobile board are the main risks
- **Depends on**: `plans/004-combined-site-verification.md` (DONE)
- **Category**: direction
- **Planned at**: commit `2f74837`, 2026-08-01

## Why this matters

The collection currently contains deduction through code breaking and spatial
mine inference. Nonogram adds a different, complementary logic loop: infer
filled runs from row and column clues to reveal a picture. It also exercises
the collection's intended third-game extension path without adding another
renderer or large dependency. The result must be a real standalone game, not a
demo grid: it needs uniquely solvable puzzles, three board sizes, mouse/touch/
keyboard input, undo, timing, local completion records, and a clear result
flow.

## Product and rules contract

Use these decisions unless the operator explicitly revises the plan:

- Route: `/games/nonogram`.
- Menu title: `数织`; English title: `Nonogram`.
- Difficulty/size mapping: `轻松` = 5×5, `标准` = 10×10, `挑战` = 15×15.
- Cell states: `unknown`, `filled`, and `crossed` (known empty).
- Row and column clues are ordered lengths of contiguous filled runs. An empty
  line is represented internally as `[]` and displayed as `0`.
- A puzzle is won when and only when the set of `filled` cells exactly matches
  the solution. Crosses are optional and never required for victory.
- Wrong fills do not consume lives and are not highlighted immediately. There
  is no loss state. This preserves deduction instead of turning the board into
  trial-and-error checking.
- Primary click/tap uses the selected tool. Right click always crosses. A drag
  applies one consistent state to every newly entered cell and is one undo
  operation. Clicking a cell already in the selected state erases it; the
  entire drag then erases consistently.
- Timer starts on the first board edit and stops on victory. Opening help does
  not reset the board. Restart clears the current puzzle after confirmation if
  progress exists.
- Completion opens a visible modal with elapsed time and actions for `下一题`
  and `重玩本题`.
- MVP uses a curated, version-controlled puzzle pack. Do not ship arbitrary
  random bitmap generation: derived clues alone do not guarantee a unique
  solution.

## Current state

- `README.md` documents a Next.js App Router collection with game-owned code
  under `src/games/<slug>/`, one real route per game, local-only data, pnpm,
  Vitest, and scoped game CSS.
- `src/games/catalog.ts:1-14` is static, server-safe menu data with two entries:

  ```ts
  export const games = [
    { slug: "mastermind", title: "彩码谜局", englishTitle: "MasterMind", href: "/games/mastermind" },
    { slug: "polymine", title: "多边形扫雷", englishTitle: "PolyMine", href: "/games/polymine" },
  ] as const;
  ```

- `src/components/site/GameCard.tsx:5-38` assumes exactly two art variants via
  `isMasterMind ? ... : ...`; a third slug would incorrectly receive PolyMine
  artwork. Replace this binary fallback with an exhaustive, server-safe art
  renderer.
- `src/app/globals.css:89-104` already provides a three-column desktop menu and
  equal card sizes. The third game must fill the existing third column rather
  than changing the menu layout.
- `src/app/games/mastermind/page.tsx:1-16` is the relevant DOM-only route
  exemplar: a synchronous Server Component owns metadata, imports one
  game-scoped stylesheet, and renders a game Client Component inside
  `.game-route-shell`.
- `src/games/mastermind/game/reducer.ts:5-57` demonstrates pure, immutable game
  transitions separated from React and browser APIs. Follow this boundary for
  the Nonogram reducer.
- `src/games/mastermind/lib/storage.ts:1-51` demonstrates a namespaced,
  versioned, exception-safe storage adapter with an injectable `Storage`
  subset. Use the same defensive shape with a distinct key.
- `src/games/mastermind/app/App.test.tsx:22-116` demonstrates Testing Library
  interaction tests using `userEvent`, explicit accessible names, result flow,
  replay, and injected dependencies where browser behavior needs isolation.
- Game CSS is namespaced with `@scope`, for example
  `src/games/mastermind/index.css:1-34`. Scope-root selectors must use
  `:scope.<class>`; previous integration defects showed that plain selectors
  do not style the scope root or a portal root reliably.
- Root verification currently uses `pnpm check`, which runs lint, TypeScript,
  67 Vitest tests, and the Next.js production build. The build emits `/`,
  `/games/mastermind`, and `/games/polymine` as static routes.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Focused domain tests | `pnpm test --run src/games/nonogram/domain` | all Nonogram domain tests pass |
| Focused component tests | `pnpm test --run src/games/nonogram/app` | all Nonogram interaction tests pass |
| Menu tests | `pnpm test --run src/games/catalog.test.ts src/app/page.test.tsx` | three game entries and links pass |
| Lint | `pnpm lint` | exit 0, no ESLint errors |
| Types | `pnpm typecheck` | exit 0, no TypeScript errors |
| Full tests | `pnpm test --run` | all existing 67 tests plus new tests pass |
| Coverage | `pnpm test:coverage` | configured thresholds pass |
| Release gate | `pnpm check` | lint, typecheck, tests, and build all exit 0; build lists four routes |

No new runtime dependency is required. Use React, CSS, Phosphor icons, and the
already installed Radix Dialog/Slot packages. Do not install a canvas library,
state library, gesture library, or puzzle-generation package.

## Suggested executor toolkit

- Use `vercel-react-best-practices` when implementing the Client Component,
  timer subscription, and event listeners. Keep transient pointer state in
  refs and domain state in the reducer.
- Use `design-taste-frontend` or `redesign-existing-projects` for the visual
  pass, while honoring the concrete visual contract in Step 6.
- Use browser device emulation for the manual viewport matrix; a cropped
  `--window-size` screenshot is not a valid mobile overflow check.

## Scope

**In scope** (the only source files that may be created or modified):

- `src/games/nonogram/**` — domain, puzzle data, app/components, persistence,
  scoped styles, and tests.
- `src/app/games/nonogram/page.tsx` and optional route-local `loading.tsx` or
  `error.tsx` only if they provide a tested, useful state.
- `src/games/catalog.ts`, `src/games/catalog.test.ts`.
- `src/components/site/GameCard.tsx`.
- `src/app/page.test.tsx`, `src/app/globals.css` for the third menu card.
- `vitest.config.mts` to include the new pure domain and persistence code in
  coverage.
- `README.md` and `plans/README.md` for route/architecture/status updates.

**Out of scope** (do not touch even if related):

- Rules, UI, storage, audio, or styles under `src/games/mastermind/**` and
  `src/games/polymine/**`.
- Phaser, Canvas, WebGL, server APIs, accounts, cloud saves, leaderboards,
  daily challenges, sharing, PWA/service workers, analytics, or deployment.
- Runtime procedural puzzle generation or an editor. The solver validates the
  curated pack; it is not a hint engine in this plan.
- Immediate mistake revelation, lives, paid hints, auto-solving, or automatic
  crossing of a completed line.
- Cross-game shared UI/state abstractions. Three visually distinct games do
  not justify coupling their runtime components.

## Git workflow

- Branch: `advisor/005-build-nonogram` if a separate branch is requested.
- Use Conventional Commit style, matching the current `refactor:` history;
  suggested final message: `feat: add nonogram game`.
- Commit by logical unit (domain, app UI, collection integration) if commits
  are requested. Do not push or open a PR without explicit instruction.

## Target architecture

```text
src/app/games/nonogram/page.tsx       server route + metadata + CSS import
src/games/nonogram/
  app/
    App.tsx                           client composition and timer/result flow
    App.test.tsx                     complete interaction flow
    game-reducer.ts                  pure immutable session state
    game-reducer.test.ts
  components/
    GameHeader.tsx
    PuzzleBoard.tsx                  clues, cells, pointer + keyboard input
    ToolDock.tsx                     fill/cross/erase/undo/restart
    HelpDialog.tsx
    ResultDialog.tsx
  domain/
    types.ts
    clues.ts                         derive and compare run clues
    clues.test.ts
    solver.ts                        uniqueness validator, not imported by App
    solver.test.ts
    puzzles.ts                       curated solutions + metadata
    puzzles.test.ts                  schema and unique-solution gate
  persistence/
    storage.ts                       nonogram:v1 settings and records
    storage.test.ts
  styles/nonogram.css                .nonogram-game/.nonogram-portal scope
```

Small deviations are acceptable when they reduce files without merging domain
rules into React. Do not create a barrel that makes the route import the test-
only solver.

## Steps

### Step 1: Define pure puzzle types and clue derivation

Create `src/games/nonogram/domain/types.ts` with explicit readonly types:

- `Difficulty = "easy" | "normal" | "hard"`.
- `CellMark = "unknown" | "filled" | "crossed"`.
- `GamePhase = "ready" | "playing" | "won"`.
- `PuzzleDefinition` containing stable `id`, Chinese `name`, `difficulty`,
  `width`, `height`, and `solution` as readonly strings using only `#` and `.`.
- `PuzzleClues` with readonly row and column run arrays.

Create `clues.ts` with pure functions to derive one line's runs and all row/
column clues. Keep `[]` as the semantic empty-line clue; formatting `0` belongs
in the clue component. Add helpers to turn a solution into a boolean/filled
index lookup and to compare player marks with the solution.

Tests in `clues.test.ts` must cover: one run, separated runs, leading/trailing
empties, an empty line, row/column orientation on a rectangular fixture, and
exact solution matching that ignores crosses but rejects missing/extra fills.

**Verify**: `pnpm test --run src/games/nonogram/domain/clues.test.ts` → all new
tests pass; `rg -n 'react|window|document|localStorage' src/games/nonogram/domain`
returns no matches.

### Step 2: Build the uniqueness validator and curated puzzle pack

Create a pure solver that counts solutions up to a caller-supplied cap, with a
default cap of 2. It exists to reject ambiguous or impossible puzzle data, not
to produce player hints.

Required solver shape:

1. Generate every valid bit pattern for a line length and clue sequence by
   recursively placing runs with at least one empty cell between runs.
2. Maintain row and column candidate sets compatible with known cell values.
3. Repeatedly propagate cells for which all remaining candidates agree.
4. When propagation stalls, branch on the most constrained unresolved line or
   cell, recurse, and stop as soon as the cap is reached.
5. Return `0`, `1`, or `cap`; never enumerate every solution after ambiguity is
   proven.

`solver.test.ts` must include a known unique fixture, a known ambiguous fixture,
an impossible clue set, an empty-line case, and a rectangular case. Do not test
private recursion details.

Create `puzzles.ts` with at least 18 fixed puzzles: at least six each for 5×5,
10×10, and 15×15. Store solutions, not handwritten clues; derive clues through
`clues.ts`. IDs must be stable and names must not reveal the picture before it
is solved. Keep each size square in this MVP even though clue derivation and
solver tests support rectangles.

`puzzles.test.ts` must assert for every puzzle:

- unique ID;
- dimension matches its difficulty and every row has the declared width;
- only `#` and `.` are used;
- at least one filled and one empty cell exist;
- derived row/column counts match height/width;
- `countSolutions(derivedClues, 2) === 1`.

If producing 18 unique puzzles makes the full domain test exceed 5 seconds on
the target machine, optimize candidate pruning first. Do not weaken the unique-
solution assertion or silently reduce the pack below 18.

**Verify**: `pnpm test --run src/games/nonogram/domain` → all domain tests pass
and the process exits without a timeout or open handle.

### Step 3: Implement the pure session reducer, strokes, undo, and timing model

Create a pure reducer in `app/game-reducer.ts`. It owns puzzle ID, flat row-
major marks, phase, active stroke, bounded undo history, and elapsed timing
fields. React owns only presentation state such as an open help dialog.

Required actions and behavior:

- `load-puzzle`: replace the board and reset timer/history.
- `begin-stroke`: choose an effective mark. If the first cell already has the
  requested mark, the effective mark is `unknown`; otherwise it is the
  requested mark. Push exactly one pre-stroke snapshot onto undo history.
- `paint-cell`: apply the active stroke mark once per visited index; ignore an
  out-of-range or repeated index.
- `end-stroke`: clear transient stroke state and enter `won` if filled cells
  exactly match the solution.
- `undo`: restore the most recent pre-stroke marks and return to `playing` or
  `ready` as appropriate. Cap history at 100 strokes.
- `restart`: clear marks, timer, stroke, and undo history for the same puzzle.
- Timer begins on the first effective edit, is derived from an injected/current
  timestamp, and freezes when the puzzle is won. Do not start an interval in a
  module or reducer.

Reducer tests must cover single-cell fill/toggle erase, cross marks, multi-cell
stroke as one undo, duplicate visited cells, out-of-range guards, history cap,
restart, load puzzle, no-op terminal edits, exact win detection, and timer
start/freeze. Use deterministic timestamps.

**Verify**: `pnpm test --run src/games/nonogram/app/game-reducer.test.ts` → all
state-transition tests pass; `pnpm typecheck` → exit 0.

### Step 4: Add versioned local records without persisting hidden solutions

Create `persistence/storage.ts` following
`src/games/mastermind/lib/storage.ts:1-51`:

- Key: `nonogram:v1`.
- Persist version `1`, last difficulty, completed puzzle IDs, and best elapsed
  milliseconds by puzzle ID.
- Do not persist puzzle solutions, solver candidate state, active undo history,
  or per-second timer ticks.
- Read through an injectable `Pick<Storage, "getItem">`, write through an
  injectable `Pick<Storage, "setItem">`, return defaults during SSR, and catch
  malformed JSON, unavailable storage, and quota errors.
- Validate every field. Drop unknown puzzle IDs when reconciling loaded data
  against the current puzzle pack, so renamed/removed fixtures cannot poison
  puzzle selection.

At victory, record the puzzle once and retain the lower best time. Puzzle
selection should prefer an unfinished puzzle in the selected difficulty and
cycle deterministically once all are complete; do not use a server-visible or
hydration-sensitive random value.

Tests must cover defaults, valid round-trip, malformed/wrong-version data,
unknown IDs, lower/higher best time behavior, namespace, SSR fallback, and
storage exceptions.

**Verify**: `pnpm test --run src/games/nonogram/persistence` → all persistence
tests pass and `rg -n 'mastermind:|polymine:' src/games/nonogram` returns no
matches.

### Step 5: Build the accessible DOM board and complete interaction flow

Create `app/App.tsx` as a Client Component and compose small components from
`components/`. Do not use Canvas or Phaser.

The game screen must contain:

- Header: `NONOGRAM`/`数织`, current size/difficulty, elapsed time, help, and a
  compact new-puzzle affordance.
- Board: top column clues, left row clues, and one button per cell. Draw a
  stronger divider after every fifth row/column on 10×10 and 15×15 boards.
- Tool dock: fill, cross, erase, undo, and restart. Make the selected tool
  explicit with text and `aria-pressed`, not color alone.
- Help dialog: concise rules, meaning of clues, and input instructions.
- Result dialog: solved picture name, elapsed time, `下一题`, and `重玩本题`.

Pointer input requirements:

- Prevent the native context menu only inside the board.
- Left pointer uses the selected tool; right pointer requests `crossed`.
- Use pointer events and pointer capture. Keep pointer ID and transient cell
  lookup in refs. On move, use coordinates plus `elementFromPoint(...).closest`
  or an equivalent board-local lookup so touch dragging paints cells beneath
  the pointer even while capture is active.
- Register any window-level `pointerup`/`pointercancel` listener in an effect
  and always remove it. End a stroke on cancel as well as release.
- Do not dispatch again for a cell already visited in the active stroke.

Keyboard/accessibility requirements:

- Use roving `tabIndex`: one gridcell button is in the tab order.
- Arrow keys move by row/column and call `scrollIntoView({ block: "nearest",
  inline: "nearest" })` when necessary.
- Space/Enter applies the selected tool; `F`, `X`, and `E` select fill, cross,
  and erase; `Ctrl/Cmd+Z` triggers undo while the route is mounted.
- Each cell's accessible name includes one-based row, column, and current state;
  associate it with its row/column clues via IDs or an equivalent concise
  description.
- Add an `aria-live="polite"` status for tool changes, completed lines, and the
  win result. Do not announce every cell during a drag.
- All toolbar buttons meet normal touch target sizing even if dense 15×15 grid
  cells are smaller.

Use a timer effect only while phase is `playing`; a 250–1000ms UI refresh is
sufficient. Clean it on phase change/unmount. Keep the reducer snapshot stable
and avoid global singletons.

`App.test.tsx` must use `userEvent`/`fireEvent` as appropriate and cover:

- 5×5 puzzle renders correct row/column clues and cell count;
- fill, cross, erase, right click, and drag stroke;
- one undo reverses an entire drag;
- keyboard navigation and shortcuts;
- restart preserves the puzzle but clears progress;
- completing a deterministic fixture opens the result dialog, records the
  best time once, and `下一题` loads a different same-difficulty puzzle;
- result replay closes the dialog and clears the board;
- help opens/closes and restores focus;
- timer interval and global listeners are cleaned on unmount.

**Verify**: `pnpm test --run src/games/nonogram/app` → all interaction and
lifecycle tests pass with no `act(...)` warning or open handle.

### Step 6: Give Nonogram a distinct, scoped, responsive visual system

Create `styles/nonogram.css` and import it only from the Nonogram route. Use a
quiet print/puzzle-book direction distinct from both green games:

- warm paper background (`#f2eee4` family), warm-white board, charcoal ink,
  muted gray crosses, and one restrained vermilion/coral accent;
- no gradients on buttons, no generic blue/purple, and no dependence on the
  site's global accent variables;
- compact editorial header, strong clue typography with tabular figures, crisp
  square cells, and tinted shadows consistent with the warm background;
- filled cells must read as solid ink, crossed cells as a clear drawn `×`, and
  unknown cells as paper. State must remain distinguishable without color.

Namespace tokens and selectors under `.nonogram-game` and portal content under
`.nonogram-portal`. If using `@scope (.nonogram-game, .nonogram-portal)`, style
the root with `:scope.nonogram-stage` and portal roots with
`:scope.nonogram-portal`; do not repeat the previously fixed root-selector bug.
Never assign game palette/reset styles to `:root`, `html`, `body`, or an
unscoped `button`.

Responsive behavior:

- At 1440×900, the full 15×15 board, clues, header, and tool dock fit without
  document horizontal scrolling.
- At 768×1024, all three sizes fit within the game stage.
- At 320×568 and 390×844, 5×5 and 10×10 fit directly. A 15×15 board may use a
  clearly bounded two-axis scroll frame, but the document itself must not
  scroll horizontally and row/column clue association must remain visible.
- Preserve safe-area padding and `prefers-reduced-motion`.
- Add visible hover, active, and focus-visible states. Avoid motion on every
  cell during drag; only the final win state may use a restrained reveal.

Run browser checks in both normal and 200% zoom. The puzzle must remain usable
when clue groups wrap to multiple numbers.

**Verify**:

- `rg -n '^(:root|html|body|#root|button\\s*\\{)' src/games/nonogram --glob '*.css'`
  returns no unscoped global selectors.
- Browser device emulation reports `document.documentElement.scrollWidth ===
  window.innerWidth` for the route at 320, 390, 768, and 1440 CSS-pixel widths.

### Step 7: Add the route and make menu art exhaustive for three games

Create `src/app/games/nonogram/page.tsx` following the MasterMind route:

- synchronous Server Component;
- metadata title `数织` and a concise description;
- route-local import of `styles/nonogram.css`;
- render the Nonogram Client Component inside `.game-route-shell`.

Extend `src/games/catalog.ts` with the new entry and an explicit visual key (or
equivalent discriminant) for every game. Refactor `GameCard.tsx` to render
MasterMind, PolyMine, and Nonogram artwork exhaustively. Do not leave a default
branch that turns an unknown future slug into one existing game's art.

Nonogram menu art should be code-native: a small monochrome pixel grid with a
few filled cells and one coral mark. Do not add raster assets or import the
Nonogram runtime into the home page. Add `.game-card-nonogram` styles while
preserving equal card dimensions and the existing 3/2/1-column responsive
menu.

Update tests:

- catalog length is 3, slugs/hrefs are unique and aligned;
- exact href order includes `/games/nonogram`;
- home exposes a new-tab link named `在新标签页打开数织`;
- existing two links remain unchanged.

Update `vitest.config.mts` coverage includes for Nonogram domain and persistence
without excluding rule code. Update `README.md` route list and project tree.

**Verify**:

- `pnpm test --run src/games/catalog.test.ts src/app/page.test.tsx` → all menu
  tests pass.
- `rg -n 'games/nonogram' src/app/page.tsx src/components/site src/games/catalog.ts`
  finds no runtime game-component import; route metadata/href text is allowed.
- `pnpm build` lists `/games/nonogram` as a static route.

### Step 8: Run regression and browser acceptance

Run the complete automated gate, then manually complete at least one puzzle in
each size using the specified input methods.

Manual matrix:

| Viewport | Puzzle | Input | Required result |
|----------|--------|-------|-----------------|
| 320×568 | 5×5 | touch emulation | paint, cross, undo, win; no document overflow |
| 390×844 | 15×15 | touch drag + bounded board scroll | clues remain usable; no stuck pointer state |
| 768×1024 | 10×10 | keyboard only | complete without mouse; focus stays visible |
| 1440×900 | all sizes | mouse + right click | correct strokes, restart, next puzzle, result flow |

Also navigate `/` → Nonogram → close the new tab or return manually → each
existing game. Confirm no Nonogram interval, listener, dialog portal, CSS
variable, or document attribute leaks into another route.

**Verify**: `pnpm check && pnpm test:coverage` → all commands exit 0, existing
67 tests still pass, new tests pass, coverage thresholds pass, and build lists
`/`, `/games/mastermind`, `/games/polymine`, and `/games/nonogram`.

## Test plan

New automated coverage must include:

- `domain/clues.test.ts`: run derivation and exact-solution matching boundaries.
- `domain/solver.test.ts`: unique, ambiguous, impossible, empty, rectangular.
- `domain/puzzles.test.ts`: schema and one-solution validation for all ≥18
  curated puzzles.
- `app/game-reducer.test.ts`: all state transitions, stroke grouping, undo,
  timer, win, restart/load, invalid/terminal guards.
- `persistence/storage.test.ts`: versioning, validation, records, exceptions,
  namespace, SSR fallback.
- `app/App.test.tsx`: rendered clues/cells, pointer and keyboard input, result,
  replay/next puzzle, storage call, timer/listener cleanup.
- Existing `catalog.test.ts` and `page.test.tsx`: third entry/link and preserved
  route contracts.

Avoid snapshots. Assert semantic state, accessible names, reducer output, and
cleanup behavior. Mock time and storage at explicit boundaries; do not mock the
clue engine or reducer in App integration tests.

## Done criteria

All conditions must hold:

- [ ] `/games/nonogram` is a static standalone route with metadata and no
  runtime import from the home page.
- [ ] The menu contains three equal cards and Nonogram has distinct exhaustive
  artwork rather than a PolyMine fallback.
- [ ] At least 18 curated puzzles exist: ≥6 each at 5×5, 10×10, and 15×15.
- [ ] Every shipped puzzle passes an automated exactly-one-solution check.
- [ ] Fill, cross, erase, right click, touch drag, keyboard, undo, restart,
  next puzzle, replay, timer, and result modal work as specified.
- [ ] `nonogram:v1` stores only validated settings/completion/best-time data and
  does not collide with existing game keys.
- [ ] `rg -n 'phaser|canvas|getContext' src/games/nonogram` returns no runtime
  rendering dependency (a textual test description is acceptable only if
  reviewed).
- [ ] CSS is scoped; no game palette is assigned globally; no document-level
  horizontal overflow occurs at tested widths.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test --run`,
  `pnpm test:coverage`, and `pnpm build` all exit 0.
- [ ] Existing 67 tests remain passing and all new tests pass without warnings
  or open handles.
- [ ] `README.md` lists the third route and `plans/README.md` marks plan 005
  `DONE`.
- [ ] `git status --short` shows only files listed under Scope.

## STOP conditions

Stop and report; do not improvise if:

- Any in-scope existing file drifted from commit `2f74837` in a way that
  conflicts with the static-catalog or game-owned-route architecture.
- The intended puzzle pack cannot reach 18 puzzles that the validator proves
  uniquely solvable without weakening the solver or test.
- Unique-solution validation for the curated pack cannot finish within roughly
  5 seconds on the target development machine after reasonable pruning.
- Correct touch drag requires a new gesture dependency or global listener that
  cannot be deterministically cleaned up and tested.
- A 15×15 board cannot remain operable at 320 CSS pixels without document-level
  horizontal overflow; report the measured geometry and proposed bounded-scroll
  adjustment instead of silently removing the difficulty.
- Implementing Nonogram appears to require changing either existing game's
  behavior, renderer, CSS namespace, or persistence key.
- A verification step fails twice after a reasonable correction, or an
  implementation step requires modifying a file listed as out of scope.

## Maintenance notes

- New puzzles must be added as solution data and must pass the schema plus
  exactly-one-solution test. Never hand-maintain clues separately from the
  solution.
- Stable puzzle IDs are persistence keys. Renaming an ID discards its local
  completion/best-time record unless a storage migration is added.
- Keep the solver out of the App import graph. If a future hint system needs
  solver logic at runtime, measure bundle and interaction cost before exposing
  it.
- If procedural generation is added later, generate offline or use the same
  uniqueness validator with a strict worker/time budget and curated fallback;
  clue derivation alone is not enough.
- Review pointer cancellation, interval cleanup, portal scoping, and 15×15
  mobile overflow carefully. These are the highest-regression surfaces.
- Daily puzzles, sharing, an editor, resumable in-progress state, sound, and
  auto-crossing are deliberately deferred until the core game has usage
  feedback.
