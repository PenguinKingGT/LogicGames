# Plan 006: Add 圈小猫 as the fourth standalone game

> **Executor instructions**: Read this plan completely before editing source.
> Follow the steps in order and run every verification gate. If a STOP
> condition occurs, report the conflict instead of silently changing the
> product contract. When implementation is complete, change this plan's row in
> `plans/README.md` from `TODO` to `DONE`.
>
> **Drift check (run first)**:
> `git diff --stat 71d1d6d7a972..HEAD -- package.json src/app/globals.css src/app/page.test.tsx src/components/site/GameCard.tsx src/games/catalog.ts src/games/catalog.test.ts src/app/games/circle-cat src/games/circle-cat public/games/circle-cat README.md`
> Expected before implementation: no output. If existing catalog, menu, route,
> or CSS conventions changed, reconcile them with the current code and STOP if
> they conflict with the route isolation or product rules below.

## Status

- **Priority**: P1
- **Effort**: L (three to five focused days including engine tests, sprite
  preparation, responsive polish, and browser verification)
- **Risk**: MED; fair path selection, deterministic random setup, turn/animation
  synchronization, and a usable 11×11 touch board are the main risks
- **Depends on**: `plans/005-build-nonogram.md` (DONE)
- **Category**: direction
- **Planned at**: commit `71d1d6d7a972`, 2026-08-01

## Why this matters

The collection currently offers deduction games with mostly static boards.
圈小猫 adds a short, replayable pursuit puzzle with an animated opponent: the
player blocks one circle each turn while the cat takes one step toward an edge.
It broadens the collection without introducing Phaser or another renderer and
proves that the static catalog can grow past three entries cleanly.

This must be a complete game rather than a visual prototype. It needs a fair
and testable pathfinding model, replayable seeded openings, explicit win/loss
feedback, local records, keyboard and touch input, synthesized sound effects,
and a licensed cat movement animation. Only the cat animation is sourced from
the network; every other visual and every sound is project-owned code.

## Product and rules contract

Use these decisions unless the operator explicitly revises the plan:

- Route: `/games/circle-cat`.
- Menu title: `圈小猫`; English title: `Circle the Cat`.
- Board: 11 rows × 11 columns displayed as an offset circle/hex-neighbor grid.
  The cat starts at row 5, column 5 (zero-based).
- A turn begins when the player selects an open circle that is not occupied by
  the cat. That circle becomes permanently blocked, then the cat moves exactly
  one adjacent step.
- Adjacency has six neighbors. Odd and even rows use the appropriate half-cell
  horizontal offset; coordinate math belongs in a pure domain module, not CSS
  or React event handlers.
- After the new block is placed, compute the shortest reachable path from the
  cat to any edge. If no edge is reachable, the player wins before a cat move.
  Otherwise the cat moves to a neighbor on a shortest path. Equal shortest
  choices are selected from a stable ordering with one injected random value,
  so rounds vary while tests remain deterministic.
- The player loses as soon as the cat's move lands on row 0, row 10, column 0,
  or column 10. There is no extra “escape” turn.
- Difficulty changes only the number of initial blockers: `轻松` = 15,
  `标准` = 10, `挑战` = 6. More blockers make containment easier. Initial
  generation must never block the cat, begin already won, or produce a board
  with no reachable edge. Require at least three open cat neighbors and retry a
  bounded number of times before using a tested fallback layout.
- A valid player block increments the move counter once. Clicks during cat
  movement, on the cat, outside the board, or on an existing blocker are no-ops
  and produce no move count or duplicate sound.
- During the cat's move, board input is disabled. The run animation and
  position transition complete before a losing dialog appears. A trapped win
  may appear after a short celebratory beat because no cat movement occurs.
- Win copy: `圈住啦！`; loss copy: `小猫跑掉了`; both show the move count and
  offer `再来一局`. Do not depict or describe harm to the cat.
- Restart creates a new opening at the current difficulty. Difficulty changes
  immediately create a new round. Undo, hints, timers, lives, accounts,
  leaderboards, sharing, and mid-round session restoration are out of scope.
- Persist sound preference, last difficulty, completed-game count, wins, and
  lowest winning move count per difficulty in `circle-cat:v1`. Do not persist
  the active board or random seed.

The rule and pathfinding references are the Racket Games Chat Noir
documentation (`https://docs.racket-lang.org/games/chat-noir.html`), which
defines block-then-move, edge escape, trap victory, graph conversion, and BFS.
Use it to validate behavior; implement original TypeScript and do not copy its
Racket source.

## Visual, interaction, and audio direction

“微信休闲游戏风格” means a friendly mobile mini-game, not a copy of WeChat
branding:

- Use a portrait-first stage centered on desktop: warm cream play surface,
  fresh green primary color, sunny yellow blockers, coral result accent, dark
  blue-green text, generous rounded corners, and shallow soft shadows.
- Keep the game route independent and full-screen. Do not add the collection's
  home header. Inside the game, use one compact top bar for `圈小猫`, move/best
  counters, difficulty, help, and sound; the board remains the primary visual.
- Render the board with DOM buttons in offset rows and put the cat on one
  absolute animation layer. Open circles, blocked circles, the focused cell,
  and the cat cell must be distinguishable by more than color.
- Use a short placement squash (about 140 ms), cat movement (about 280 ms), and
  a restrained result bounce. Disable frame cycling and nonessential movement
  under `prefers-reduced-motion` while preserving state feedback.
- Minimum ordinary control target is 44×44 CSS pixels. The dense board may use
  smaller visual circles, but each cell's button fills its entire grid pitch
  and must not overlap its neighbor. Validate actual touch behavior at 320 px.
- The help dialog explains the one-line loop: `点一个圆点封路，小猫随后走一格；
  把它困住就赢，走到边缘就会跑掉。`

Audio is generated with the Web Audio API; do not download audio files:

- `place`: a soft short pop when a valid circle is blocked.
- `step`: a quiet two-note paw-step synchronized with movement start.
- `win`: a bright ascending four-note cue.
- `lose`: a gentle descending two-note cue, not a harsh failure buzzer.
- `button`: a light tick for difficulty, restart, and help controls where useful.
- Create/resume `AudioContext` only after a user gesture, catch all audio
  failures, and never let sound block a turn. The sound toggle persists and is
  accessible by text/label, not icon state alone.

## External cat animation contract

Only the cat movement/idle animation may come from a network source. Use the
CC0 **Tiny Kitten Game Sprite** by Segel:

- Source page: `https://opengameart.org/content/tiny-kitten-game-sprite`
- Download: `https://opengameart.org/sites/default/files/tiny_cat_sprite.zip`
- License: CC0 1.0 (`https://creativecommons.org/publicdomain/zero/1.0/`)
- Available source sequences include Idle and Run, which are sufficient for
  this game. Hurt/Dead frames must not be used.

During implementation:

1. Download the archive from the source page and inspect it before copying.
2. Retain only a small idle subset and a run subset needed for the shipped
   animation; do not commit the archive or unused animation folders.
3. Crop/resize/optimize the transparent PNG frames, or combine them into one
   sprite sheet using a one-time local image tool. Do not add a runtime image
   processing dependency. Target no more than 350 KB total for shipped cat
   files unless visual inspection proves that limit visibly damages them.
4. Put final files under `public/games/circle-cat/cat/`. Filenames must be
   stable and lowercase.
5. Add `public/games/circle-cat/ASSET_LICENSES.md` with title, author, source
   page, direct download URL, CC0 URL, download date, selected original
   filenames, and every crop/resize/sprite-sheet transformation.
6. Preload only the frames required for the first idle/run animation. If using
   separate images, ensure all run frames are decoded before accepting the
   first board turn so movement never flashes blank.

The home-menu cat artwork, board circles, decorative marks, focus rings,
buttons, dialogs, confetti, and all audio must be CSS, SVG/icon-library, or Web
Audio output created in this repository. Do not source those from OpenGameArt,
CodePen, GitHub, or other asset packs.

## Current state

- `src/games/catalog.ts:1-23` contains three server-safe entries and an `art`
  discriminant. Add a fourth `cat` variant rather than coupling card rendering
  to the game runtime.
- `src/components/site/GameCard.tsx:34-62` exhaustively switches among `code`,
  `geometry`, and `pixel`. Add a code-native cat/grid composition to this
  switch; do not load the external gameplay sprite on the home page.
- `src/app/globals.css:91-106` uses a three-column grid, and
  `src/app/globals.css:405-460` reduces it to two and one columns. Four entries
  would leave an orphan card on wide desktop. Use four equal columns at the
  widest breakpoint, two columns at tablet widths, and one column on phones.
- `src/app/page.test.tsx:5-23` asserts every standalone link opens in a new tab.
  Extend it with `在新标签页打开圈小猫` and `/games/circle-cat`.
- `src/games/catalog.test.ts:4-19` currently hard-codes three unique routes.
  Update the count, uniqueness assertion, and route order.
- `src/app/games/nonogram/page.tsx:1-16` is the route pattern: a Server
  Component exports metadata, imports one game-owned stylesheet, and renders a
  Client Component in `.game-route-shell`.
- `src/games/nonogram/app/game-reducer.ts:21-117` demonstrates a pure reducer
  and immutable transitions. Circle Cat adds an explicit `moving` phase so UI
  animation cannot race another turn.
- `src/games/nonogram/audio/audio-manager.ts:7-59` demonstrates lazy,
  exception-safe Web Audio. Create a game-local manager and cue set; do not
  make Circle Cat depend on Nonogram internals.
- `src/games/nonogram/persistence/storage.ts:4-64` demonstrates a versioned,
  namespaced, SSR-safe storage adapter with injectable storage for tests.
- Current baseline at commit `71d1d6d7a972`: `pnpm test --run` passes all 405
  tests in 21 files.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Domain tests | `pnpm test --run src/games/circle-cat/domain` | coordinate, BFS, setup, and turn tests pass |
| App tests | `pnpm test --run src/games/circle-cat/app` | complete interaction and phase tests pass |
| Audio/storage tests | `pnpm test --run src/games/circle-cat/audio src/games/circle-cat/persistence` | Web Audio and local-data contracts pass |
| Menu tests | `pnpm test --run src/games/catalog.test.ts src/app/page.test.tsx` | four routes and new-tab links pass |
| Lint | `pnpm lint` | exit 0 with no ESLint errors |
| Types | `pnpm typecheck` | exit 0 with no TypeScript errors |
| Full tests | `pnpm test --run` | all 405 existing tests plus new tests pass |
| Coverage | `pnpm test:coverage` | configured thresholds pass |
| Release gate | `pnpm check` | lint, typecheck, tests, and build exit 0; build lists `/games/circle-cat` |

No runtime dependency is required. Use React, CSS, the existing icon library,
Radix Dialog if useful, and browser Web Audio. Do not install a pathfinding,
randomness, animation, canvas, state-management, or audio library.

## Suggested executor toolkit

- Use `vercel-react-best-practices` for the Client Component, animation timeout
  cleanup, stable callbacks, and keeping the game engine outside React.
- Use `design-taste-frontend` for the final casual-game visual pass while
  honoring the exact rules, palette direction, motion limits, and asset scope
  in this plan.
- Use real browser device emulation for the viewport matrix. A resized desktop
  screenshot alone does not validate touch hit areas, safe areas, or overflow.

## Scope

**In scope** (the only source/content files that may be created or modified):

- `src/games/circle-cat/**` — domain, app/components, game-local audio,
  persistence, scoped styles, and tests.
- `src/app/games/circle-cat/page.tsx`.
- `public/games/circle-cat/cat/**` and
  `public/games/circle-cat/ASSET_LICENSES.md`.
- `src/games/catalog.ts`, `src/games/catalog.test.ts`.
- `src/components/site/GameCard.tsx`.
- `src/app/page.test.tsx`, `src/app/globals.css` for the fourth menu card and
  scalable grid.
- `vitest.config.mts` only if the new pure modules are missing from coverage.
- `README.md` and `plans/README.md` for route/architecture/status updates.

**Out of scope**:

- Rules, UI, storage, audio, or styles under `src/games/mastermind/**`,
  `src/games/polymine/**`, and `src/games/nonogram/**`.
- Downloaded UI, board, icon, decorative, result, or audio assets. Only the cat
  idle/run animation described above is approved external material.
- Phaser, Canvas, WebGL, a generic shared game framework, global game state,
  server APIs, accounts, cloud saves, online leaderboards, daily challenges,
  sharing, PWA/service workers, analytics, or deployment configuration.
- Minimax, machine-learned behavior, adjustable board size, undo, hints, lives,
  monetization, or a level editor.

## Git workflow

- Branch: `advisor/006-add-circle-cat` if a separate branch is requested.
- Suggested Conventional Commit message: `feat: add circle the cat game`.
- Commit by logical unit (engine, game UI/assets, collection integration) only
  if commits are requested. Do not push or open a PR without explicit approval.

## Target architecture

```text
src/app/games/circle-cat/page.tsx      server route + metadata + CSS import
src/games/circle-cat/
  app/
    App.tsx                            client composition and round lifecycle
    App.test.tsx                      full interaction/result flow
    game-reducer.ts                   pure turn and animation state machine
    game-reducer.test.ts
  components/
    GameHeader.tsx                    title, counters, difficulty, sound/help
    CatBoard.tsx                      offset DOM grid + absolute cat layer
    HelpDialog.tsx
    ResultDialog.tsx
  domain/
    types.ts                          coordinates, cells, phases, difficulty
    grid.ts                           bounds, edge check, six neighbors
    grid.test.ts
    pathfinding.ts                    BFS distances and fair next-step choice
    pathfinding.test.ts
    setup.ts                          seeded initial blocker generation
    setup.test.ts
    game.ts                           block validation and turn resolution
    game.test.ts
  audio/
    audio-manager.ts                  lazy game-local Web Audio manager
    audio-manager.test.ts
    sounds.ts                         synthesized cue definitions
  persistence/
    storage.ts                        circle-cat:v1 settings and records
    storage.test.ts
  styles/circle-cat.css               scoped route, board, sprite, responsive UI
public/games/circle-cat/
  ASSET_LICENSES.md
  cat/                                optimized CC0 idle/run frames or sheet
```

Small file-count reductions are acceptable, but do not merge pathfinding,
random setup, or persistence into React components.

## Steps

### Step 1: Acquire and document only the cat animation

Download Tiny Kitten Game Sprite from the approved OpenGameArt page. Verify the
archive contains transparent Idle and Run PNG sequences and that the page still
states CC0. Select the minimum frames that preserve a readable idle and running
cycle at roughly 48–72 CSS pixels.

Prepare optimized files and the complete `ASSET_LICENSES.md` record described
above. Never use Hurt or Dead frames. Keep the cat facing toward its horizontal
movement direction with CSS `scaleX(-1)` when needed; vertical moves may retain
the last horizontal facing direction. The cat's semantic position is always
the board coordinate, not a pixel value encoded in the frame.

**Verify**:

- `find public/games/circle-cat -type f -print` lists only the
  license notice and selected optimized cat files.
- `du -sk public/games/circle-cat/cat` is at or below 350 KB, or a reviewer has
  recorded why a slightly higher size is visually necessary.
- All images have transparent backgrounds, consistent canvas dimensions, and
  no blank frame when cycled in a browser.
- `rg -n 'Segel|opengameart.org/content/tiny-kitten|CC0' public/games/circle-cat/ASSET_LICENSES.md`
  finds the author, source, and license.

### Step 2: Implement offset-grid geometry and BFS pathfinding

Create readonly coordinate/cell types and pure helpers for:

- stable cell IDs such as `r5-c5`;
- bounds and edge detection on the 11×11 board;
- the exact six valid neighbors for both odd and even rows;
- filtering blocked cells and the cat's current cell;
- BFS distance from every reachable open cell to the nearest edge.

Implement next-step selection by reading the current cat distance, selecting
open neighbors whose distance is exactly one lower, preserving a stable
row/column ordering, then using a clamped injected random unit value only among
equal candidates. Return `null` when no edge path exists. Do not use DOM order,
CSS transforms, object-key enumeration, or `Math.random()` inside pathfinding.

Tests must cover corner/edge/center neighbor sets, odd/even row differences,
blocked-cell exclusion, shortest path through a forced corridor, no reachable
edge, multiple equal exits at random values 0 and near 1, and proof that the
chosen step is adjacent and reduces shortest distance by one.

**Verify**: `pnpm test --run src/games/circle-cat/domain/grid.test.ts src/games/circle-cat/domain/pathfinding.test.ts`
passes; `rg -n 'window|document|localStorage|react|Math\.random' src/games/circle-cat/domain`
returns no matches.

### Step 3: Add seeded setup and the complete turn state machine

Implement a small deterministic PRNG or seed-to-unit helper in the setup
module. `createOpening(difficulty, seed)` samples unique initial blockers, then
validates the product contract: center open, at least three open neighbors, and
at least one reachable edge. Retry with deterministic derived seeds up to a
fixed limit; use one checked fallback pattern per difficulty if retries are
exhausted. Never use unbounded retry loops.

Implement the game reducer with explicit phases `ready`, `playing`, `moving`,
`won`, and `lost`. A block action receives a coordinate and one injected random
unit value. On a valid turn it adds the blocker, increments moves, and either:

- enters `won` if BFS reports no edge path; or
- updates the cat destination, records whether it is an edge, and enters
  `moving`.

A separate `finish-move` action changes `moving` to `lost` for an edge
destination or `playing` otherwise. `new-round` accepts an already generated
opening. Ignore all block actions outside playable phases. This boundary lets
React schedule exactly one 280 ms animation timeout without putting timers in
the reducer.

Tests must cover blocker counts and invariants for many fixed seeds; bounded
fallback; invalid block no-ops; one block/one move; trap-before-move victory;
edge landing loss only after `finish-move`; input lock during movement; move
count; restart/new difficulty; stable tie-breaking; and no mutation of earlier
states or Sets.

**Verify**: `pnpm test --run src/games/circle-cat/domain src/games/circle-cat/app/game-reducer.test.ts`
passes quickly and produces the same result on repeated runs.

### Step 4: Add local records and synthesized sound effects

Create an exception-safe storage adapter modeled on the existing game-local
adapters:

- key `circle-cat:v1`, schema version `1`;
- last difficulty and sound-enabled setting;
- games completed, wins, and best winning move count by difficulty;
- SSR defaults and injectable `getItem`/`setItem` subsets;
- strict validation, safe defaults for partial/malformed data, and caught quota
  errors.

Record a result exactly once when entering `won` or `lost`. A loss increments
games completed but not wins or best moves. A win keeps the lower positive best
move count. Never write on every animation frame.

Create a Circle Cat-specific AudioManager and oscillator/gain cue definitions.
It must lazily construct/resume AudioContext, honor the persisted toggle, clean
up/disconnect nodes after cues, and swallow unsupported/suspended errors. There
must be no imported `.wav`, `.mp3`, `.ogg`, or remote audio URL.

Tests must cover valid round-trip, wrong version, malformed values, stats
updates, best-score minimum, one-result recording, SSR/storage failures, lazy
AudioContext creation, suspended resume, disabled/unsupported behavior, and
the expected number/order of tone steps for win and lose.

**Verify**: `pnpm test --run src/games/circle-cat/audio src/games/circle-cat/persistence`
passes; `rg -n '\.(wav|mp3|ogg)|https?://' src/games/circle-cat/audio public/games/circle-cat`
finds no audio file or remote audio reference (the license Markdown URLs are
the only allowed URL matches under `public`).

### Step 5: Build the accessible board, animation, and complete result flow

Create `App.tsx` as a Client Component. Generate the initial round in a
post-mount frame or from a client-only seed so server rendering does not depend
on randomness. Keep a stable random source in a ref and allow tests to inject a
seed/random function and movement duration.

`CatBoard` must render 11 offset rows of button cells with a `role="grid"`, row
grouping, and meaningful labels. Use roving `tabIndex`: arrow keys move focus
to the nearest valid coordinate, Enter/Space blocks the focused cell, and
blocked/cat cells cannot trigger turns. Expose phase/move updates through a
polite live region. Do not make 121 cells simultaneous tab stops.

Render the cat in one absolute layer using coordinate-to-CSS-position helpers.
Switch to the run sequence and start the `step` cue when phase becomes
`moving`; dispatch `finish-move` after the motion duration and clean the timeout
on new round/unmount. Flip the sprite only for horizontal direction. Decode or
preload the selected frames before enabling the first turn and render a
code-native fallback cat silhouette if an image fails.

Compose the compact header, counters, difficulty selector, help dialog, restart
action, and result dialog. The result dialog opens once per terminal state,
plays its cue once, focuses its heading/action, and returns focus sensibly after
restart. Switching difficulty or restarting during/after a round must cancel
pending movement and prevent a stale `finish-move` from changing the new game.

Tests must exercise:

- exactly 121 cells, center cat, correct blocker count, and accessible names;
- valid block → placement sound → input lock → animated cat destination → step
  sound → unlocked next turn;
- invalid/repeated/cat clicks as true no-ops;
- deterministic forced win and forced loss with their distinct dialog copy and
  sounds;
- restart from playing, moving, won, and lost without stale timeout actions;
- difficulty/blocker count change and persistence;
- sound toggle persistence and no cue while disabled;
- help dialog and focus return;
- keyboard navigation/action and reduced-motion-compatible state behavior;
- timeout cleanup on unmount.

**Verify**: `pnpm test --run src/games/circle-cat/app` passes with fake timers
and no open handles; `pnpm typecheck` exits 0.

### Step 6: Apply scoped casual-game styling and responsive constraints

Import `styles/circle-cat.css` only from the route page. Namespace tokens and
rules below `.circle-cat-game` and `.circle-cat-portal`; do not assign palette
variables to `:root`, `html`, or `body`. Use `@scope` consistently with current
games, including `:scope.circle-cat-game` for the root.

Required viewport behavior:

- `1440×900`: portrait game surface is centered, all primary controls and the
  full board are visible without horizontal scrolling.
- `1024×768`: board remains primary; counters/controls compact without hiding
  difficulty, sound, help, or restart.
- `390×844`, `375×667`, and `320×568`: no horizontal overflow; safe-area
  padding is respected; the 11×11 board fits; dialogs fit and scroll internally
  if required; no essential action is clipped.
- At 200% zoom on a 1280 px viewport, game remains operable with document
  scrolling and no overlap that hides board cells.
- Dark system preference must not accidentally inherit unreadable collection
  colors. This game may intentionally declare `color-scheme: light` for its
  mini-game art direction, but controls still need sufficient contrast.
- Reduced motion removes sprite frame cycling, decorative bounce/confetti, and
  long transitions while terminal state and audio preference still work.

Use browser inspection to confirm the cat center stays aligned with its logical
button at every edge/corner position and across all widths.

### Step 7: Add the route and integrate the fourth menu card

Create `src/app/games/circle-cat/page.tsx` as a Server Component with metadata,
the scoped stylesheet import, and the game Client Component. Suggested
description: `封住小猫的去路，在它逃到边缘前把它圈住。`

Append the catalog entry with `art: "cat"`. Add a home-card illustration built
only from existing icon components/CSS circles and a dotted route motif. Give
the card its own light and dark colors and keep text contrast consistent with
the other three cards. Do not import public cat frames into GameCard.

Change the wide menu to four equal columns so the fourth card does not sit
alone on a second row. Retain two equal columns at tablet widths and one at
phone widths; every card keeps the same height. Do not introduce special
spans, featured-card sizing, or per-game widths—the layout must remain useful
when a fifth game is later appended.

Extend catalog and page tests with the exact route/link/target contracts. Update
README game count, route list, controls, local-data namespace, and external
asset notice. Update the target architecture and status row in
`plans/README.md` only after all gates pass.

**Verify**: `pnpm test --run src/games/catalog.test.ts src/app/page.test.tsx`
passes; `pnpm build` lists `/games/circle-cat` as a route; the home page shows
four equal cards with no orphan at the wide breakpoint.

### Step 8: Run full automated and manual release verification

Run in this order:

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test --run`
4. `pnpm test:coverage`
5. `pnpm build`
6. `pnpm check`

Then manually verify in current Chrome and one WebKit browser:

- complete one win and one loss at each difficulty;
- rapid clicking cannot place two blocks during cat movement;
- restart/difficulty change during a move does not produce a stale move or
  result dialog;
- every cat move lands on a legal adjacent open cell and edge arrival loses;
- toggle sound off, reload, confirm silence; toggle on and confirm all five
  cues are distinct and comfortable;
- reload after wins/losses and confirm totals and best moves are correct;
- mouse, touch, and keyboard can all complete a turn;
- sprite frame loading shows no white box, broken image, or layout shift;
- home card opens the standalone route in a new tab;
- direct navigation and reload on `/games/circle-cat` work;
- all viewport, zoom, dark preference, and reduced-motion checks from Step 6
  pass without regressions on the other three menu cards/routes.

Record the tested browser versions, viewports, six manual game outcomes, and
any approved asset-size exception in the implementation handoff.

## Acceptance criteria

- `/games/circle-cat` is a standalone, reload-safe fourth game route.
- The complete block → shortest-path cat move → trap/edge result loop matches
  the rules contract and is covered by deterministic unit tests.
- All three difficulties generate valid, playable openings with exactly
  15/10/6 unique blockers and bounded deterministic fallback.
- Cat input is locked during movement; stale animation completions cannot alter
  a restarted round.
- Win and loss both have visible, accessible feedback, replay, distinct sound,
  and correct local records.
- The shipped network material consists only of documented CC0 cat idle/run
  animation files. No downloaded UI or audio asset is added.
- Audio is synthesized, lazy, optional, persisted, and never blocks gameplay.
- The casual-game UI fits the stated desktop/mobile/zoom matrix, supports
  keyboard and touch, and respects reduced motion.
- The home page presents four equal cards in a scalable 4/2/1 grid and opens
  圈小猫 in a new tab.
- Existing 405 tests remain green, new coverage passes, and `pnpm check`
  completes successfully.

## STOP conditions

Stop and report rather than improvising if:

- the approved Tiny Kitten source page no longer states CC0, the downloaded
  archive does not match the advertised author/content, or usable Idle/Run
  frames are missing;
- preserving the sprite's readability requires exceeding 500 KB total after
  reasonable optimization;
- current code changed after `71d1d6d7a972` in a way that conflicts with one
  route per game, scoped game CSS, static catalog metadata, or new-tab links;
- a seeded opening can begin trapped/unreachable after the bounded validation,
  and the tested fallback layouts also fail their invariants;
- BFS/tie-break tests are nondeterministic across repeated runs;
- a stale `finish-move` can mutate a restarted round after attempted timeout
  cleanup/generation guards;
- the 11×11 board cannot be operated at 320 px without overlapping hit targets
  or horizontal scrolling after the specified compact layout is applied;
- any implementation requires a new runtime dependency, Canvas/Phaser, remote
  runtime asset fetch, or external audio file;
- an existing game or its tests fail for reasons unrelated to the authorized
  catalog/menu integration.

## Rejected alternatives

- Copy an existing browser game wholesale: rejected because available demos
  often lack an explicit license or bring unrelated rendering/UI code. The
  rules are small enough to implement and test locally; only the CC0 cat
  animation is reused.
- Download a full UI/audio pack: rejected by the clarified requirement. It
  increases payload and licensing surface without improving the core game.
- Use a cat meow sample from Freesound/OpenGameArt: rejected for this plan.
  Synthesized cues are dependency-free, consistent with current games, and
  keep the external-material boundary to cat movement only.
- Use random wandering or greedy Euclidean movement: rejected because it can
  walk away from a clear exit and makes difficulty feel arbitrary. BFS yields a
  explainable shortest escape strategy.
- Use minimax: deferred. It raises complexity and can feel punitive in a light
  casual game; blocker count plus shortest-path tie variation is sufficient.
- Render the board in Canvas/Phaser: rejected because DOM buttons provide
  better focus semantics, tests, scaling, and a smaller route bundle.
- Let every board cell be a tab stop: rejected because 121 stops make keyboard
  navigation impractical. Use a roving focus model.
- Reuse Nonogram's audio/storage modules directly: rejected because games own
  their browser lifecycles and schemas; similar small adapters are safer than
  cross-game coupling.
- Persist an unfinished board: out of scope. Rounds are short and restartable;
  settings and records provide the useful durable value.
