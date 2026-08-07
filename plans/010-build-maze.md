# Plan 010: Add a complete random maze navigation game

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If a STOP condition occurs, stop and report instead of
> improvising. When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat d7873f0..HEAD -- src/app src/components/site src/games package.json`
> If any in-scope path changed, compare the current route, catalog, and game
> architecture with this plan before editing. Stop on a material conflict.

## Status

- **Priority**: P2
- **Effort**: M (one to two focused days including input and responsive tests)
- **Risk**: MED; random-generation correctness, touch input, and small-screen
  readability are the main risks
- **Depends on**: `plans/009-build-twenty-four.md`
- **Category**: direction / feature
- **Planned at**: commit `d7873f0`, 2026-08-07

## Why this matters

Maze navigation adds a spatial exploration game without overlapping the
collection's arithmetic, deduction, tile-merging, or adversarial rules. A
perfect-maze generator provides effectively unlimited replayability from a
small pure engine, while keyboard and swipe input make the same route usable
on desktop and touch devices.

## Product contract

- Route: `/games/maze`; menu title: `迷宫`; English title: `Maze`.
- Provide `标准` (`15 × 15`) and `复杂` (`25 × 25`) logical cell grids. Changing
  the mode immediately generates a fresh maze at the selected size.
- Generate a new random perfect maze for each round: every walkable cell is
  connected and there is exactly one simple path between any two cells.
- Place the player at the top-left logical cell. Choose the exit as the cell
  with the greatest BFS distance from the start, using stable row-major order
  to break ties. This guarantees a meaningful route without a retry loop.
- Movement is orthogonal and advances exactly one cell through an open wall.
  Walking into a wall or outside the maze is a no-op.
- The complete maze remains visible. Visited cells may use a restrained trail
  so players can read where they have been, but the solution path must never be
  revealed before completion.
- Reaching the exit ends the round and opens a concise completion dialog with
  `再来一局`. The header also provides `新迷宫`, `重新开始`, and `玩法`.
- `新迷宫` generates a different maze. `重新开始` returns the player to the
  current maze's start without regenerating it.
- Do not implement warfare/fog-of-war, move limits, countdowns, timers, daily
  seeds, hints, scores, achievements, records, streaks,
  persistence, online features, or leaderboards.
- Do not add runtime dependencies or external image/audio assets. The maze,
  player, exit, and catalog illustration must be code-native.

## Interaction and accessibility contract

- Desktop input: Arrow keys and WASD move the player while the board has
  focus. Prevent page scrolling only for handled movement keys and only while
  focus is within the game board.
- Touch input: swipe one cell direction on the board. Use a minimum movement
  threshold so taps and minor scroll jitter do not move the player. Set
  `touch-action` only on the board, not globally.
- Keep the board visually dominant and omit a separate direction pad. The help
  dialog documents keyboard and swipe input without adding redundant controls.
- The board is one focusable application surface with an accessible name and
  keyboard instructions. Individual maze cells are visual elements, not 225
  tab stops. Announce successful moves sparingly and announce completion in a
  polite live region/dialog.
- Keep start, player, visited trail, and exit distinguishable without relying
  on color alone. Use shape/icons and sufficient contrast.
- Support 320 px width without horizontal scrolling, safe-area insets,
  landscape viewports, and `prefers-reduced-motion`.

## Visual direction

Use a “survey map / plotted route” direction: a quiet graphite background,
warm drafting-paper maze, dark ink walls, and one vermilion route accent. The
maze is the dominant square; controls remain secondary and compact. Use Geist
Sans for labels and Geist Mono for coordinates or technical microcopy. Keep
corners mostly square to match a plotted grid and avoid gradients, decorative
cards, or a statistics sidebar.

Scope every token and selector beneath `.maze-game` and `.maze-portal`. The
route must not style `:root`, `html`, or `body`. Use Phosphor icons already in
the dependency graph; do not draw custom SVG paths or add another icon family.

## Current state and conventions

- `src/games/catalog.ts` contains seven server-safe metadata entries. Add one
  `maze` entry and a new `art` discriminant without importing game runtime
  modules.
- `src/components/site/GameCard.tsx` exhaustively renders catalog artwork.
  Add a CSS grid maze miniature for the new discriminant.
- `src/app/games/twenty-four/page.tsx` is the current route pattern: a Server
  Component exports metadata, imports one game-owned stylesheet, and renders
  the Client Component inside `.game-route-shell`.
- `src/games/2048/domain/engine.ts` demonstrates pure deterministic domain
  logic with injected randomness and no browser APIs. Follow this boundary for
  generation and movement.
- `src/games/circle-cat/domain/pathfinding.ts` demonstrates queue-based BFS
  over typed coordinates. Reuse the approach, not the game's hex-grid types.
- `src/games/circle-cat/domain/setup.ts` demonstrates seeded, injectable random
  generation and validation. Maze generation must accept `() => number`
  directly and never call `Math.random` inside domain code.
- Tests use Vitest and Testing Library beside the modules. UI assertions use
  accessible roles and injected randomness rather than snapshots.
- Code must follow `AGENTS.md`: focused functions, immutable state, descriptive
  names, no compressed JSX/CSS, no nested ternaries, and no non-null
  assertions.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Domain tests | `pnpm test --run src/games/maze/domain` | generator, reachability, and movement tests pass |
| App tests | `pnpm test --run src/games/maze/app` | input, restart, new-maze, and completion tests pass |
| Lint | `pnpm lint` | exit 0 with no ESLint errors |
| Typecheck | `pnpm typecheck` | exit 0 with no TypeScript errors |
| Full gate | `pnpm check` | all tests and production build pass |

## Suggested executor toolkit

- Use `vercel-react-best-practices` when implementing the Client Component;
  derive presentation values during render and keep event-driven transitions
  out of effects.
- Use `design-taste-frontend` for the visual implementation, applying it as a
  game interface rather than a marketing page.

## Scope

**In scope**:

- `src/games/maze/domain/{types,generator,movement}.ts` and colocated tests.
- `src/games/maze/app/{game-reducer,App}.tsx` and colocated tests.
- `src/games/maze/components/**` for the board, header, controls, and dialogs.
- `src/games/maze/styles/maze.css`.
- `src/app/games/maze/page.tsx`.
- `src/games/catalog.ts`, `src/games/catalog.test.ts`.
- `src/components/site/GameCard.tsx`, `src/app/globals.css`.
- `src/app/page.test.tsx`.
- `plans/010-build-maze.md` and `plans/README.md` status updates.

**Out of scope**:

- Changes to existing game behavior, shared global state, or other game styles.
- Persistence or storage migrations.
- Audio, downloaded assets, Canvas, Phaser, Web Workers, or new dependencies.
- Fog, limited moves, timers, daily seeds, additional size settings, hints,
  scoring, achievements, records, streaks, multiplayer, or a level editor.

## Git workflow

- Keep the change focused on plan 010 and preserve unrelated working-tree
  changes.
- Follow Conventional Commits; suggested message:
  `feat(maze): add random maze navigation game`.
- Do not push or open a pull request unless explicitly requested.

## Steps

### Step 1: Define the maze representation

Create `domain/types.ts` with `Coordinate`, `Direction`, `Cell`, and `Maze`
types. Represent each logical cell with an immutable bit mask or readonly set
of open directions; keep the public API explicit enough that movement does not
inspect UI classes. Export constants for width and height rather than using
unexplained `15` literals throughout the code.

Create helpers for coordinate IDs, bounds checks, neighbor lookup, and
opposite directions. Keep rendering coordinates separate from domain IDs.

**Verify**: `pnpm typecheck` → exit 0; helper tests cover all four directions,
edges, opposite-direction symmetry, and unique coordinate IDs.

### Step 2: Implement deterministic perfect-maze generation

Create `domain/generator.ts` using iterative randomized depth-first search
(recursive backtracker):

1. Start at `(0, 0)` and track visited logical cells.
2. Randomly choose one unvisited orthogonal neighbor using the injected RNG.
3. Open the wall in both cells, push the neighbor, and continue.
4. Backtrack when the current cell has no unvisited neighbors.
5. After all cells are visited, run BFS from the start and select the farthest
   cell as the exit.

Clamp or normalize injected random values so `0`, values near `1`, non-finite
values, and test doubles cannot produce an invalid index. Do not retry until a
maze “looks good”; the algorithm must always produce a valid maze in bounded
time.

Expose validation helpers used by tests to verify reciprocal openings,
connectivity, edge count, and the chosen exit. A perfect maze must contain
exactly `size² - 1` undirected passages: 224 for standard and 624 for complex.

**Verify**: `pnpm test --run src/games/maze/domain/generator.test.ts` → tests
pass for constant-zero RNG, constant-near-one RNG, a repeatable sequence, many
seeded sequences, 225/625 reachable cells, 224/624 passages, reciprocal walls, no
out-of-bounds openings, deterministic output for the same sequence, and a
farthest reachable exit.

### Step 3: Implement movement and reducer state

Create `domain/movement.ts` with a pure `movePlayer(maze, position, direction)`
that returns the original coordinate for blocked/out-of-bounds moves and the
adjacent coordinate for open passages.

Create `app/game-reducer.ts` with explicit actions:

- `move`: apply one direction, append a newly reached cell to the visited set,
  and transition to `completed` when position equals exit;
- `restart`: restore start position and initial visited set on the same maze;
- `new-maze`: replace the maze, reset position/visited/status, and increment a
  round ID so stale gesture callbacks cannot affect a replaced round.

Do not track move counts, elapsed time, score, hints, or records. Block moves
after completion until the player starts another maze.

**Verify**: `pnpm test --run src/games/maze/app/game-reducer.test.ts` → tests
cover legal/blocked movement, visited-cell uniqueness, restart preserving maze,
new-maze replacement, completion, and post-completion no-ops.

### Step 4: Build the accessible board and controls

Create `components/MazeBoard.tsx` as a focusable board surface. Render every
cell in one CSS Grid and express walls through cell data attributes/classes.
Use separate code-native elements/icons for player, start, and exit. Do not
make every cell a button.

Create a small input helper or hook that maps Arrow/WASD keys and pointer swipe
vectors to `Direction`. Pointer handling must capture the starting coordinate,
ignore movement below a named threshold, choose the dominant axis, dispatch at
most one move per gesture, and release/cancel cleanly.

**Verify**: component tests focus the board and exercise Arrow/WASD movement,
confirm unrelated keys are ignored, verify a swipe produces one move, and a
short gesture produces none.

### Step 5: Compose the round lifecycle

Create `app/App.tsx` as the sole Client Component entry. Generate the initial
maze after mount using a test-injectable random source to keep server/client
markup stable. The `新迷宫` handler must generate a fresh maze in the event
handler, not in an effect. Ensure it cannot return an identical maze during
one session: retry a bounded number of times against a stable maze signature,
then use a deterministic fallback sequence if the injected RNG is constant.

Compose a focused `GameHeader`, mode selector, board, polite live region, help
dialog, and completion dialog. `重新开始` dispatches only `restart`; `新迷宫`
dispatches only `new-maze`; `再来一局` shares the new-maze handler.

**Verify**: `pnpm test --run src/games/maze/app/App.test.tsx` → tests prove
initial rendering, new maze differs, restart preserves walls and returns the
player to start, completion opens the dialog, `再来一局` replaces the maze,
and help opens/closes with focus restoration.

### Step 6: Apply the scoped responsive visual system

Create `styles/maze.css` with `.maze-game` and `.maze-portal` scopes. Draw
walls with borders or pseudo-elements in a way that does not double wall
thickness. Size the board with `width: min(...)` and `aspect-ratio: 1`; avoid
fixed pixel dimensions. Keep the player transition on `transform`/opacity and
disable it under reduced motion.

At 320 px, keep every column visible and preserve crisp wall contrast. Fit the
complete route inside the viewport without document scrolling. On wider
screens, leave sufficient space for the maze rather than introducing a
sidebar. Test short landscape layouts without forcing document-wide overflow.

**Verify**:

- `rg -n '^(:root|html|body|#root)' src/games/maze --glob '*.css'` → no match.
- Manual inspection at 320 × 568, 768 × 1024, and 1440 × 900 → maze and all
  controls visible without horizontal scrolling; walls/player/exit readable.

### Step 7: Add the route and menu integration

Create `src/app/games/maze/page.tsx` as a Server Component with Chinese title
and description metadata, one game-owned CSS import, and the Client Component
inside `.game-route-shell`.

Append the catalog entry, extend the `Game["art"]` switch with a CSS-built
miniature maze, and update catalog/home tests for eight unique routes and the
accessible link name `在新标签页打开迷宫`. Do not import the generator or any
maze runtime code from the catalog or menu card.

**Verify**: catalog and home tests pass; `pnpm build` lists `/games/maze` as a
static route.

### Step 8: Run the quality gate and close the plan

Review the diff against `AGENTS.md`, remove debug output/dead code, and confirm
that no excluded feature or storage key was added. Update plan 010 to `DONE`
only after the complete gate succeeds.

**Verify**: `pnpm check` → lint, typecheck, all tests, and production build exit
0; build output includes `/games/maze`.

## Test plan

- `domain/types.test.ts`: coordinate helpers, bounds, direction opposites.
- `domain/generator.test.ts`: determinism, all cells reachable, exactly `N-1`
  passages, reciprocal walls, bounded generation, farthest exit.
- `domain/movement.test.ts`: each legal direction plus walls and boundaries.
- `app/game-reducer.test.ts`: movement lifecycle, restart, replacement,
  visited trail, completion guards.
- `components/MazeBoard.test.tsx` or app integration tests: keyboard, WASD,
  pointer threshold/dominant axis, both board sizes, and no direction pad.
- `app/App.test.tsx`: hydration-safe initial maze, distinct new maze, restart,
  help focus, completion, and next round.
- Extend `src/games/catalog.test.ts` and `src/app/page.test.tsx`; do not use
  snapshots or assert CSS implementation details.

## Done criteria

- [x] Generator tests prove standard and complex cells are connected by
  exactly `size² - 1` reciprocal passages across deterministic RNG inputs.
- [x] Exit selection is verified as farthest from the start.
- [x] Arrow, WASD, and swipe input move by the same pure domain rule.
- [x] `新迷宫` produces a different maze; `重新开始` preserves the current maze.
- [x] Reaching the exit opens completion and `再来一局` starts a fresh maze.
- [x] No fog, limits, timer, daily seed, difficulty, hint, score, record,
  streak, persistence, online feature, or new dependency exists.
- [x] Maze CSS is route-scoped and keeps the route within the viewport without
  document scroll.
- [x] Catalog and home tests contain eight unique routes including `/games/maze`.
- [x] `pnpm check` exits 0 and the build statically generates `/games/maze`.
- [x] `plans/README.md` marks plan 010 `DONE`.

## STOP conditions

- The route/catalog architecture has materially changed since `d7873f0`.
- Product requirements now call for more modes, fog, limits, timers, daily
  content, persistence, or scoring; revise this plan before implementation.
- The chosen representation cannot prove reciprocal passages and `N-1` edges
  without reading DOM state.
- Touch handling would require document-level scroll suppression instead of a
  board-scoped gesture boundary.
- A new dependency, external asset, Canvas, Phaser, or worker appears necessary.
- A verification command fails twice after a reasonable correction attempt.

## Maintenance notes

- Keep generation/movement independent of React so alternative renderers or
  sizes can be considered later without replacing the engine.
- Reviewers should scrutinize wall reciprocity, the distinct-maze fallback for
  constant RNG tests, pointer cleanup, and keyboard scroll containment.
- Generated braids/loops, hints, records, and daily challenges are intentionally
  deferred; adding any requires a new tracked requirement.
