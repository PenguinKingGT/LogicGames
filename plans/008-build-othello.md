# Plan 008: Add a complete human-versus-AI Othello game

> **Executor instructions**: Read this plan completely before editing source.
> Follow every step in order and run each verification gate. If a STOP
> condition occurs, report it instead of changing the product contract. When
> implementation is complete, change this plan's row in `plans/README.md`
> from `TODO` to `DONE`.
>
> **Drift check (run first)**:
> `git diff --stat 566eed8..HEAD -- README.md src/games/catalog.ts src/games/catalog.test.ts src/components/site/GameCard.tsx src/app/globals.css src/app/page.test.tsx src/app/games/othello src/games/othello plans/README.md`
> If the catalog, route, reducer, worker, CSS-isolation, or test conventions
> have changed, compare the live code with this plan and STOP if they conflict.

## Status

- **Priority**: P1
- **Effort**: L (four to six focused days including engine, worker AI,
  accessibility, responsive polish, persistence, and browser acceptance)
- **Risk**: MED-HIGH; multi-direction flips, forced passes, asynchronous AI
  cancellation, and predictable difficulty boundaries are the main risks
- **Depends on**: `plans/007-build-2048.md` (DONE)
- **Category**: direction
- **Planned at**: commit `566eed8`, 2026-08-07

## Why this matters

PUZZLE HOUSE currently contains five solo logic games but no traditional
two-sided strategy game. Othello adds a recognizable human-versus-computer
experience with short matches, visible tactical consequences, and meaningful
replayability. The existing pure-engine/reducer architecture makes the board
rules inexpensive to test, while a dedicated Web Worker keeps deeper AI
search from blocking animation, input, or route navigation.

This is a local single-player game, not an online multiplayer system. It must
ship with complete Othello rules, three genuinely distinct AI levels,
deterministic test seams, stale-result protection, accessible board input,
local preferences/statistics, synthesized sound, and no new dependency.

## Product and rules contract

Use these decisions unless the operator explicitly changes them:

- Route: `/games/othello`.
- Menu title: `黑白棋`; English title: `Othello`.
- Standard 8×8 board. Initial discs are white at D4/E5 and black at E4/D5
  using one-based display coordinates; black moves first.
- Human always plays black in the first release; AI plays white. Color choice,
  local two-player, online play, matchmaking, spectator mode, and clocks are
  out of scope.
- A legal move places one disc on an empty square and must bracket at least one
  contiguous line of opposing discs between the new disc and an existing disc
  of the mover's color. Resolve and flip every bracketed line among all eight
  directions in one atomic move.
- An illegal square is a no-op: no turn change, sound, animation, worker
  request, history entry, or storage write.
- If the next player has no legal move but the opponent does, that player must
  automatically pass. Show a brief status message (`白方无棋可下，黑方继续`
  or its inverse), then continue without requiring a pass button.
- The game ends when neither side has a legal move, including before the board
  is full. Count discs; more discs wins, equal counts draw. Result copy is
  `黑方获胜`, `白方获胜`, or `平局`, followed by `黑 {n} · 白 {n}`.
- Provide `重新开局`. Confirm before abandoning only after the human has made
  a valid move. Changing difficulty during an active match also requires the
  same confirmation, then starts a fresh standard opening.
- Provide one `悔棋` action that rewinds to the position immediately before
  the human's latest move, thereby undoing the complete human-plus-AI exchange
  and any forced pass. It is disabled before the first completed AI response,
  while AI is thinking, and after use until another completed exchange.
- The AI must never read hidden/random information because Othello is a
  perfect-information game. Equal-scoring choices use a stable row-major
  ordering in standard/hard modes; easy mode accepts an injected random value.
- Persist difficulty, sound preference, completed games, wins, losses, draws,
  and best winning margin per difficulty under `othello:v1`. Do not restore an
  unfinished board after refresh; start a new match with saved preferences.

The rules should be checked against the [Japanese Othello Association rules
summary](https://www.othello.org/lesson/lesson/rule.html), which confirms the
crossed four-disc opening, black first, mandatory pass when no legal move
exists, and game end when both players cannot move. Implement original
TypeScript; do not copy source code from external game implementations.

## AI contract

Keep AI search separate from React and from rule mutation:

- `简单`: uniformly choose among legal moves with an injected random value,
  except take an available corner 70% of the time. This should be beatable and
  variable, not intentionally illegal or self-sabotaging.
- `标准`: negamax/minimax with alpha-beta pruning to fixed depth 4. Evaluate
  corners, corner-adjacent danger, current mobility, frontier discs, positional
  weights, and disc difference with phase-sensitive weights.
- `困难`: iterative-deepening negamax with alpha-beta pruning, stable move
  ordering (corners, mobility reduction, positional weight), a transposition
  table scoped to one request, target depth 7, and a 650 ms time budget. Return
  the best move from the last fully completed depth; never return a partial
  root result.
- Terminal positions use exact final disc difference with a magnitude greater
  than any heuristic evaluation. Pass nodes switch player without decrementing
  the board state incorrectly; two consecutive no-move sides are terminal.
- Put standard and hard search in `src/games/othello/ai/worker.ts`, instantiated
  from the Client Component with `new Worker(new URL("../ai/worker.ts",
  import.meta.url), { type: "module" })` or the current Next.js-compatible
  equivalent. Easy selection may use the same worker for lifecycle consistency.
- Every request and response includes `roundId` and `turnId`. The reducer/UI
  must reject responses from a prior round, difficulty change, undo, timeout,
  or unmounted screen. Terminate the worker on unmount and when replacing it
  after an error.
- Expose pure `chooseMove`/search functions separately from the worker message
  adapter so Vitest can test positions synchronously without creating a real
  browser worker.
- “AI thinking” should remain visible for at least 280 ms so turn ownership is
  understandable, but the artificial delay and computation run concurrently;
  never add the delay after a slow search.
- If the worker errors or exceeds 1.5 seconds, choose the first legal move via
  the pure engine, keep the match playable, and expose a non-alarming live
  message (`电脑已改用快速落子`). Do not retry indefinitely.

Alpha-beta search is an established fit for Othello-family game trees; the
plan deliberately avoids neural networks, remote inference, opening books,
and heavyweight game-AI packages. Those would increase bundle/data complexity
without improving the first-release product contract.

## Visual, interaction, and audio direction

Use a “lacquer strategy table at dusk” direction rather than a generic green
casino board or a literal skeuomorphic wooden board. The audience is casual
strategy players; the page's single job is to make turn ownership, legal moves,
and flips instantly readable.

- Palette: `night #131C22`, `lacquer #1F5B4B`, `grid #7EA091`,
  `ivory #F2F0E8`, `disc-black #15191C`, `signal #E58B4A`. Dark mode deepens
  the surrounding night but preserves board/disc contrast.
- Typography: Geist Sans for headings and actions; Geist Mono for coordinates,
  counts, AI status, and move metadata. Do not add fonts or dependencies.
- Layout: desktop uses a quiet two-column composition with the board dominant
  and a narrow match ledger; mobile stacks the ledger above the board:

  ```text
  ┌ 黑白棋 / OTHELLO ───────── [难度] [悔棋] [声音] [玩法] ┐
  │                                                        │
  │  A B C D E F G H        当前回合  ● 你 / 黑             │
  │  ┌────────────────┐      黑  18   白  14                │
  │  │  8 × 8 BOARD   │      ─────────────────             │
  │  │  · ● ○ · · ·  │      电脑正在思考…                 │
  │  └────────────────┘      [重新开局]                    │
  │  可落子位置以细环标记                                   │
  └────────────────────────────────────────────────────────┘
  ```
- Signature element: a legal move produces one controlled “ink ripple” from
  the placed square; bracketed discs flip outward in increasing distance order
  with a two-face 3D rotation. This single causal animation explains the rule.
- The board is DOM, not Canvas. Render 64 square buttons using `role="grid"`,
  rows, and gridcells. Use roving `tabIndex`; arrow keys move focus, Enter/Space
  place a disc, and legal cells are announced without making all 64 cells tab
  stops. Coordinates appear visually on board edges and in accessible labels.
- Legal human moves display a small ivory/orange ring and remain distinguishable
  without color. Hover/focus may preview the number of discs flipped, but must
  not mutate the board. During AI thinking and flip animation, board input is
  disabled.
- Turn identity appears in text and icon/disc shape, never color alone. A polite
  live region announces human move, AI move, forced pass, fallback, and result;
  avoid announcing each individual flipped disc.
- Target ordinary controls at 44×44 CSS px. The 8×8 board must fit at 320 px
  without horizontal scrolling; each gridcell button fills its pitch. Support
  short landscape viewports, safe-area insets, light/dark modes, and
  `prefers-reduced-motion` (replace 3D flips with an immediate face change and
  one opacity pulse).
- Keep the route full-screen and independent. Scope every rule and variable
  under `.othello-game` and `.othello-portal`. Do not modify global `:root`,
  `html`, or `body` palette tokens.
- Generate Web Audio cues in code: `place` (firm lacquer tap), `flip` (short
  rising tick, batched rather than 20 overlapping oscillators), `thinking`
  (optional single quiet cue), `win`, `lose`, `draw`, and `button`. Audio is
  optional, created/resumed only after user interaction, and cannot block a
  move or worker response.

The aesthetic risk is the nearly monochrome lacquer board. The orange signal
is therefore reserved exclusively for actionable legal moves and current-turn
status; adding decorative orange elsewhere would weaken the game information.

## Current state and conventions

- `src/games/catalog.ts:1-37` contains five server-safe game entries and an
  `art` discriminant. Add one `othello`/`disc` entry without importing game
  runtime code into the catalog.
- `src/components/site/GameCard.tsx:27-82` exhaustively renders code-native card
  art by discriminant. Add a CSS-built miniature board/disc composition; do not
  load route CSS, AI, or external assets on the home page.
- `src/games/catalog.test.ts:4-21` hard-codes five routes and route order.
  Extend it to six entries ending in `/games/othello`.
- `src/app/page.test.tsx:5-31` checks accessible new-tab links for every game.
  Add `在新标签页打开黑白棋` and its route.
- `src/app/games/2048/page.tsx:1-11` is the current route pattern: a Server
  Component exports metadata, imports one game-owned stylesheet, and renders a
  Client Component inside `.game-route-shell`.
- `src/games/2048/domain/engine.ts:1-112` is the pure deterministic engine
  exemplar. Othello board legality, flips, counting, pass, and terminal
  functions must remain free of DOM, React, storage, audio, and worker APIs.
- `src/games/2048/app/game-reducer.ts:4-102` demonstrates immutable explicit
  phases, atomic moves, round/move IDs, and stale animation rejection. Othello
  needs distinct `human-turn`, `animating-human`, `ai-thinking`,
  `animating-ai`, and `finished` phases so asynchronous results cannot race.
- `src/games/2048/app/App.tsx:31-61` demonstrates post-mount hydration, timer
  cleanup, and phase-owned effects. Othello must additionally own and terminate
  its Worker, race minimum-thinking delay with search, and reject late replies.
- `src/games/2048/persistence/storage.ts:38-76` demonstrates versioned,
  namespaced, SSR-safe, defensively parsed local storage. Othello persists
  preferences/statistics only, not the active board.
- `src/games/2048/styles/2048.css:1-16` demonstrates route/portal-scoped tokens;
  preserve isolation and avoid selectors that can leak into other games.
- Current verification baseline at commit `566eed8`: `pnpm check` passes all
  447 tests in 33 files and statically generates all five game routes.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Rules | `pnpm test --run src/games/othello/domain` | legality, flips, pass, terminal, and count tests pass |
| AI | `pnpm test --run src/games/othello/ai` | legal choices, deterministic levels, pruning, timeout, and pass-node tests pass |
| Reducer/app | `pnpm test --run src/games/othello/app` | phase, stale worker, undo, fallback, dialog, and input tests pass |
| Storage/audio | `pnpm test --run src/games/othello/persistence src/games/othello/audio` | defensive data and optional audio tests pass |
| Menu | `pnpm test --run src/games/catalog.test.ts src/app/page.test.tsx` | six unique routes and Othello link pass |
| Lint | `pnpm lint` | exit 0 with no errors or warnings |
| Types | `pnpm typecheck` | exit 0 with no TypeScript errors |
| Full tests | `pnpm test --run` | all existing and new tests pass |
| Build | `pnpm build` | exit 0 and route table includes `/games/othello` |
| Complete gate | `pnpm check` | lint, typecheck, full tests, and build all exit 0 |

## Suggested executor toolkit

- Use `frontend-design` when implementing and visually critiquing the lacquer
  strategy-table direction.
- Use `vercel-react-best-practices` for Worker lifecycle, event handlers,
  reducer effects, and bundle isolation. Do not import AI modules into the home
  route and do not memoize the fixed 64-cell board without measured need.

## Scope

**In scope**:

- `src/games/othello/domain/**` (create types, engine, and tests)
- `src/games/othello/ai/**` (create evaluation, search, worker adapter, tests)
- `src/games/othello/app/**` (create reducer, Client App, tests)
- `src/games/othello/components/**` (create board, header, ledger, dialogs)
- `src/games/othello/persistence/**` (create storage and tests)
- `src/games/othello/audio/**` (create synthesized cues, manager, tests)
- `src/games/othello/styles/othello.css` (create)
- `src/app/games/othello/page.tsx` (create)
- `src/games/catalog.ts`
- `src/games/catalog.test.ts`
- `src/components/site/GameCard.tsx`
- `src/app/globals.css` (only Othello card art and menu-grid adjustments)
- `src/app/page.test.tsx`
- `README.md` (game list and structure only)
- `plans/README.md` (status only after implementation)

**Out of scope**:

- Changes to existing game behavior or game-owned CSS
- Shared engine/state/audio abstractions, a global Worker pool, new packages,
  downloaded images/audio/fonts, Canvas, WebGL, Phaser, or server APIs
- Player color selection, local two-player, online multiplayer, accounts,
  leaderboards, clocks, opening books, move hints, match replay/export, neural
  models, remote AI, or adaptive difficulty

## Git workflow

- Suggested branch: `advisor/008-build-othello`.
- Commit by logical unit using Conventional Commits, for example
  `feat(othello): add deterministic rules engine and AI search`.
- Do not push or open a PR unless the operator requests it.

## Steps

### Step 1: Implement and exhaustively test the pure Othello rules

Create `src/games/othello/domain/types.ts`, `board.ts`, and corresponding tests.
Represent board cells as a readonly fixed-length 64-element array containing
`"black" | "white" | null`; expose `Player`, `Coordinate`, `Move`, and move
result types. Prefer clear array/index math over bitboards for the first release
unless benchmarks prove the hard AI cannot meet its budget.

Implement `createInitialBoard`, coordinate/index helpers, `opponent`,
`getFlips(board, player, index)`, `getLegalMoves`, `applyMove`, `countDiscs`,
`resolveTurn`, and `getResult`. Scan all eight directions; stop at bounds,
empty cells, or own-color closure. `applyMove` must reject illegal moves without
mutation and return exact flipped indices for animation. `resolveTurn` returns
normal next turn, forced pass, or terminal result without relying on board-full
alone.

Tests must cover the four standard opening moves for black; horizontal,
vertical, diagonal, edge, corner, and simultaneous multi-direction flips;
open-ended lines that must not flip; occupied/zero-flip illegal moves;
immutability; one forced pass; consecutive no-move termination with empty
squares; full-board termination; black/white wins; and draw.

**Verify**: `pnpm test --run src/games/othello/domain` → all domain tests pass.

### Step 2: Build three deterministic, bounded AI levels

Create `evaluation.ts`, `search.ts`, and tests under `src/games/othello/ai/`.
Keep rules imported from `domain`, never duplicate move generation. Implement
easy selection and an alpha-beta negamax/minimax search with explicit pass
nodes, deterministic tie-breaking, node counting, optional deadline checks,
and a request-scoped transposition table keyed by board/current player/depth.

Evaluation must document and test each component: corner ownership, X/C-square
corner danger while corner is empty, legal-move mobility, frontier exposure,
positional table, disc difference, and terminal exact score. Shift weighting
toward disc parity only in the endgame (for example at 48+ occupied squares).
Return diagnostics (`depthCompleted`, `nodes`, `timedOut`) for tests and optional
development inspection; do not render raw evaluation scores in the product UI.

Use an injected monotonic `now()` function and optional node budget in tests so
timeouts are deterministic. Prove every returned move is legal, corners are
preferred in a controlled position, pass nodes are searched correctly,
terminal wins outrank heuristics, standard completes depth 4, hard preserves
the last complete iteration on timeout, and alpha-beta expands fewer nodes than
an unpruned reference on a fixed midgame fixture.

**Verify**: `pnpm test --run src/games/othello/ai` → all AI tests pass and no
fixture exceeds the Vitest timeout.

### Step 3: Add the Worker protocol and stale-result-safe reducer

Create `worker-protocol.ts`, `worker.ts`, `worker-client.ts`, and tests. Messages
must be structured-clone-safe and include board, difficulty, AI color,
`roundId`, and `turnId`; responses include the chosen legal index or typed
error plus diagnostics. Keep `self.onmessage` as a thin adapter over pure
search. Do not import the worker adapter from server components or the catalog.

Create `src/games/othello/app/game-reducer.ts` with phases `human-turn`,
`animating-human`, `ai-thinking`, `animating-ai`, and `finished`. State includes
board, current player, counts derived or updated atomically, difficulty,
round/turn IDs, latest move/flipped indices, forced-pass notice, result, and one
exchange-level undo snapshot. Actions cover new match, human move, finish human
animation, AI result, AI fallback, finish AI animation, undo, and difficulty.

The reducer validates the AI index with the pure engine before applying it and
rejects mismatched IDs/phases. After every animation, use `resolveTurn` to
either pass, request AI, return control to the human, or finish. Never allow a
React effect or worker response to manually flip discs outside the reducer.

**Verify**: `pnpm test --run src/games/othello/ai src/games/othello/app/game-reducer.test.ts`
→ protocol, stale response, invalid response, pass, terminal, and undo tests pass.

### Step 4: Add defensive preferences/statistics and optional audio

Create `src/games/othello/persistence/storage.ts` with versioned key
`othello:v1`. Persist `difficulty`, `soundEnabled`, and per-difficulty games,
wins, losses, draws, and `bestMargin`. Parse unknown JSON field by field;
clamp internally inconsistent counts, reject unsupported versions, and return
defaults on SSR, malformed JSON, quota/security errors, or unavailable storage.
Record a result once per `roundId`; use an App ref or recorded-round identity so
React rerenders/dialog reopening cannot double-count.

Create game-local `audio/sounds.ts`, `audio-manager.ts`, and tests following
the existing lazy AudioContext convention. Batch a multi-disc flip into one
short cue parameterized or selected by flip-count band; do not create one
oscillator sequence per disc. No audio file, remote URL, or cross-game import.

Tests cover valid round-trip, each malformed field, wrong version, count/margin
updates, one-result recording, storage exceptions, disabled/unsupported audio,
suspended resume, cleanup, and cue definitions.

**Verify**: `pnpm test --run src/games/othello/persistence src/games/othello/audio`
→ all persistence/audio tests pass.

### Step 5: Build the complete Client App and accessible board

Create `App.tsx`, `OthelloBoard.tsx`, `GameHeader.tsx`, `MatchLedger.tsx`, and
Radix-based help/result/abandon dialogs under the Othello namespace. Initialize
the deterministic opening for SSR, then hydrate preferences after mount; do
not call random APIs during initial server/client render.

The App owns one Worker client in a ref/effect, one 1.5-second fallback timer,
and one minimum-thinking-delay promise/timer. Effects react to explicit reducer
phases and primitive IDs, post one request per AI turn, clean timers on round
change/unmount, and terminate the worker. Inject a worker factory, timeouts, and
AI chooser in tests. On unsupported Worker or typed worker error, select the
first legal move after the minimum delay and continue.

The board renders 64 gridcells with roving focus, coordinate labels, legal-move
rings, flip-count previews, current/last-move markers, and locked input during
AI/animation. Arrow keys move focus; Home/End may move within a row; Enter/Space
places only a legal human move. Clicking a disc or illegal empty square is a
no-op. Keep focus on the placed coordinate after animation where possible.

Component tests cover opening counts/four legal cells, click and keyboard move,
multi-flip UI update, AI thinking lock, one worker request, minimum delay,
worker response, worker fallback, stale response after restart, human forced
pass, AI forced pass, terminal dialog, draw, undo exchange, difficulty/restart
confirmation, help, sound, statistics, live-region copy, and unmount cleanup.

**Verify**: `pnpm test --run src/games/othello/app` → all reducer and complete
interaction tests pass without real timers or real Worker dependency.

### Step 6: Apply the lacquer strategy-table visual system

Create `src/games/othello/styles/othello.css` from the defined tokens and
layout. Build the board grid, coordinate gutters, double-faced discs, legal
move rings, latest-move mark, ledger, thinking indicator, dialogs, and result
state. Use CSS custom properties for board pitch so discs, rings, and flip
animation share one geometry source.

Animate the placed-disc ripple once, then flip discs in distance-based groups
using a bounded CSS delay variable. Use transform/opacity only where possible.
Do not let CSS timing determine turn state; reducer animation completion uses
one documented maximum duration. Under reduced motion, set that duration to at
most one animation frame through a JS media query or a test-injectable prop,
while CSS removes rotation.

Verify visual and semantic contrast for black disc vs board, white disc vs
board, legal ring, focus ring, and disabled state. At 320 px, the board and
coordinate gutters must fit without page-level horizontal scrolling.

**Verify**: `pnpm lint && pnpm typecheck` → both exit 0.

### Step 7: Integrate the route, menu card, and documentation

Create `src/app/games/othello/page.tsx` with Chinese metadata, the scoped CSS
import, and the Othello Client App inside `.game-route-shell`. Add the catalog
entry last. Extend `GameCard` with a server-safe `disc` art discriminant and a
CSS-only miniature lacquer board containing black/white discs and one legal
move ring. Update only the necessary global card-art CSS and responsive menu
layout, plus catalog/menu tests and README game/structure lists.

Do not import `src/games/othello/ai`, the worker, application components, or
route CSS into the catalog/home module graph.

**Verify**: `pnpm test --run src/games/catalog.test.ts src/app/page.test.tsx` →
six unique routes, route order, href/slug alignment, and the accessible Othello
new-tab link pass.

### Step 8: Run full automation and browser acceptance

Run `pnpm check`. Then inspect `/`, `/games/othello`, and one existing DOM game
at desktop 1440×900, mobile 390×844, minimum 320 px, and a short landscape
viewport. Test one complete match or use controlled fixtures in development to
reach human pass, AI pass, human win, AI win, and draw.

Verify mouse, touch, and keyboard-only play; focus restoration; legal-move
visibility; flip order; minimum AI thinking feedback; difficulty distinction;
undo; restart/difficulty confirmation; worker error fallback; navigation away
during search; dark mode; reduced motion; sound toggle; statistics after refresh;
and no cross-route CSS, Worker, timer, or audio leakage.

Profile one representative midgame in a production build: standard must return
well below 300 ms on a typical development laptop; hard must respect the 650 ms
search budget and UI input/animation must remain responsive because search is
off-main-thread. Record measured values in the PR/handoff, not a new repo file.

**Verify**: `pnpm check` → exit 0; production route table lists
`/games/othello`; `git status --short` shows only in-scope files and the plan
status update.

## Test plan

- Domain: exact legality/flips in all directions, edge/corner behavior,
  immutability, forced passes, terminal detection, result counts, and draw.
- AI: legality, deterministic tie order, easy randomness, corner/danger/mobility
  evaluation, pass nodes, terminal dominance, alpha-beta pruning, iterative
  deepening, and deterministic timeout preservation.
- Worker/reducer: structured messages, round/turn identity, one request per
  turn, stale/invalid replies, fallback, animation phases, forced passes,
  terminal result, and exchange-level undo.
- Persistence/audio: defensive parsing, consistent statistics, one result per
  round, storage failure, lazy/resumed/disabled Web Audio, and batched flips.
- UI: pointer/keyboard parity, roving focus, accessible labels/live regions,
  input locks, AI status, dialogs, settings, timers, worker termination, and
  reduced-motion behavior.
- Integration: catalog order, route build, worker chunk isolation, home-card
  art, responsive browser acceptance, and cross-route lifecycle isolation.
- Use `src/games/2048/domain/engine.test.ts`,
  `src/games/2048/app/game-reducer.test.ts`, and
  `src/games/2048/app/App.test.tsx` as structural test exemplars.

## Done criteria

- [ ] Initial board has two black/two white discs and exactly four black moves.
- [ ] All eight-direction flips, illegal moves, forced pass, consecutive-pass
  termination, win/loss/draw, and disc counts are deterministic and tested.
- [ ] Easy, standard, and hard AI always return legal moves; standard searches
  depth 4; hard respects its budget and preserves the last completed depth.
- [ ] AI work runs off the main thread; stale, invalid, failed, and timed-out
  results cannot corrupt or stall a match.
- [ ] Mouse/touch and keyboard play, roving focus, legal-move semantics, live
  announcements, 320 px, dark mode, and reduced motion pass acceptance.
- [ ] One exchange-level undo works and cannot race active AI computation.
- [ ] Preferences/statistics survive refresh; active matches intentionally do
  not; malformed storage recovers safely.
- [ ] `pnpm check` exits 0 and build output lists `/games/othello`.
- [ ] `rg -n 'Math\.random|Worker|AudioContext|localStorage' src/games/othello/domain`
  returns no matches.
- [ ] `rg -n 'src/games/othello/(ai|app)|othello\.css' src/app/page.tsx src/components/site src/games/catalog.ts`
  returns no matches.
- [ ] `git status --short` contains no change outside Scope.
- [ ] Plan 008 is marked `DONE` in `plans/README.md`.

## STOP conditions

Stop and report instead of improvising if:

- Current route/catalog/reducer/CSS isolation conventions conflict with this
  plan or changed after commit `566eed8`.
- Correctness appears to require mutating the board in React, CSS, or the Worker
  adapter instead of the pure domain engine/reducer.
- Next.js cannot bundle the module Worker using a statically analyzable URL
  without a custom bundler change; report the exact build error before choosing
  an inline Blob worker or main-thread search.
- Fixed depth 4 cannot satisfy standard response targets or iterative depth 7
  cannot respect the hard budget after move ordering; report benchmark fixtures
  and propose depth/budget adjustments rather than hiding the miss.
- AI search needs bitboards to meet the budget. Treat that as a scoped design
  revision requiring equivalent array-engine reference tests, not an ad hoc
  rewrite during UI work.
- Worker fallback can produce an illegal move or a late response survives new
  round, difficulty change, undo, or unmount.
- A step's verification still fails after two reasonable correction attempts.
- Implementation requires a new package, remote asset/API, global style change,
  server endpoint, or other out-of-scope file.

## Maintenance notes

- Review pass-node handling and terminal scores before heuristic tuning; a
  stronger-looking AI with incorrect pass semantics is still a rules bug.
- Keep difficulty contracts measurable. Future tuning should update fixed
  fixtures and performance expectations, not only weights.
- Worker messages form an internal protocol. Any future replay, color choice,
  or adaptive difficulty feature must retain round/turn identity and structured
  clone compatibility.
- The positional evaluator is intentionally explainable. Opening books, exact
  endgame solvers, bitboards, and adaptive AI are follow-ups only if profiling
  or player feedback justifies the added complexity.
