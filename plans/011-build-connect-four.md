# Plan 011: Add a human-versus-AI Connect Four game

> **Executor instructions**: Read this plan completely before editing source.
> Follow each step in order and run every verification gate. Stop and report
> any material conflict instead of silently changing the product contract.
> Change this plan and its row in `plans/README.md` to `DONE` only after
> `pnpm check` succeeds.
>
> **Drift check (run first)**:
> `git diff --stat 04e2a91..HEAD -- src/app src/components/site src/games plans package.json`
> Compare any in-scope changes with the route, catalog, reducer, Worker, and CSS
> conventions below before implementation.

## Status

- **State**: DONE
- **Priority**: P2
- **Effort**: M (two to four focused days including AI and responsive tests)
- **Risk**: MED; tactical AI correctness, asynchronous cancellation, and drop
  animation state are the main risks
- **Depends on**: `plans/010-build-maze.md` (DONE)
- **Category**: direction / feature
- **Planned at**: commit `04e2a91`, 2026-08-08

## Goal and product contract

Add a short, deterministic human-versus-computer strategy game that complements
Othello without duplicating its capture rules.

- Route: `/games/connect-four`; menu title: `四子棋`; English title:
  `Connect Four`.
- Use the classic upright board: 7 columns × 6 rows. Players alternate dropping
  one disc into a non-full column; it occupies the lowest empty cell.
- Red moves first. Before a round, the player may choose `执红先手` or
  `执黄后手`. Changing side immediately starts a fresh round.
- A player wins when the latest move completes four or more consecutive discs
  horizontally, vertically, or diagonally. A full board without a winner is a
  draw. Stop accepting moves immediately after either result.
- Clicking or activating any cell in a playable column drops into that column.
  Full columns and input during AI thinking/animation are disabled.
- Provide `新对局`, `悔棋`, `声音`, and `玩法`. Undo rewinds the latest complete
  human-plus-AI exchange; when the player is second, it must preserve the AI's
  opening move. Disable undo while AI is thinking and before a complete exchange.
- Do not add timers, hints, scores, records, streaks, persistence, online play,
  local multiplayer, custom board sizes, power-ups, accounts, or dependencies.

## AI contract

Provide three distinct levels behind one pure search API:

- `简单`: choose a legal column using injected randomness, but take an immediate
  win and block an immediate human win first.
- `标准`: depth-5 negamax/minimax with alpha-beta pruning. Order center columns
  first and evaluate completed lines, open threes, open twos, and center control.
- `困难`: iterative deepening to depth 9 with alpha-beta pruning, transposition
  table, center-first ordering, and a 500 ms budget. Return only the result of
  the last fully completed depth.
- Prefer faster wins and slower losses. Equal evaluations use stable
  center-out order: `4, 3, 5, 2, 6, 1, 7` in one-based display coordinates.
- Search must never mutate caller-owned state or return a full/illegal column.
- Run standard and hard search in `src/games/connect-four/ai/worker.ts`. Every
  request and response carries `roundId` and `turnId`; stale replies after new
  game, side/difficulty change, undo, timeout, or unmount are ignored.
- Show AI thinking for at least 220 ms. On Worker failure or a 1.2-second
  timeout, select the first legal center-out move and keep the round playable.

## Architecture and interaction

- Keep board rules in pure `domain/` modules with an immutable flat 42-cell
  representation. Export column capacity, legal moves, drop, winner, draw, and
  line-detection helpers; React must not duplicate these rules.
- Model explicit reducer phases: `human-turn`, `dropping-human`, `ai-thinking`,
  `dropping-ai`, and `finished`. Keep the previous stable exchange for undo and
  reject animation/Worker actions with stale IDs.
- Render a DOM grid, not Canvas. Use seven column buttons layered over 42 visual
  cells so keyboard and screen-reader users make one decision per column rather
  than tabbing through every cell.
- Arrow Left/Right moves the active column; Enter/Space drops. Pointer and touch
  select the same column action. Announce column, landing row, current turn,
  AI fallback, win, loss, and draw in a polite live region.
- Show a restrained landing preview for the selected legal column. The disc
  drop animation uses `transform`; honor `prefers-reduced-motion` with an
  immediate placement and opacity change.
- Use a route-scoped `.connect-four-game` / `.connect-four-portal` visual system.
  Keep the board dominant, fit 320 px width and short landscape viewports
  without document scrolling, and avoid global palette selectors.
- Build all artwork and audio cues in CSS/code. Do not copy Nintendo branding,
  presentation, assets, sounds, or source code; only implement the traditional
  public game rules.

## Implementation steps

### Step 1: Build and verify the rules engine

Create `src/games/connect-four/domain/{types,engine}.ts` and colocated tests.
Implement immutable board creation, legal-column enumeration, gravity-aware
drop placement, winner detection through the latest move, and draw detection.

Test all four winning directions, both players, edge/corner lines, five-disc
lines, full columns, invalid columns, immutability, and a full-board draw.

**Verify**: `pnpm test --run src/games/connect-four/domain`

### Step 2: Implement deterministic AI search

Create pure AI selection/evaluation modules, then a narrow typed Worker adapter.
Keep time injectable for deterministic timeout tests. Verify immediate wins and
blocks, legal output across representative boards, stable tie-breaking, level
differences, terminal scoring, pruning, and hard-mode timeout behavior.

**Verify**: `pnpm test --run src/games/connect-four/ai`

### Step 3: Implement the reducer lifecycle

Create `app/game-reducer.ts` with explicit actions for human drop, animation
completion, AI request/result/fallback, undo, new round, side selection, and
difficulty selection. When the player chooses yellow, schedule one AI opening
through the same Worker path used later in the round.

Test legal and rejected input, alternating turns, both starting sides, wins,
draws, stale results, fallback, undo boundaries, and reset behavior.

**Verify**: `pnpm test --run src/games/connect-four/app/game-reducer.test.ts`

### Step 4: Build the accessible board and application shell

Create focused header, board, match-status, dialog, and audio components. The
Client Component owns Worker/timer cleanup and dispatches domain-level actions;
components only render state and user intent. Use existing Phosphor icons and
the route-local audio-manager pattern without adding packages.

Component tests must cover mouse and keyboard drops, full-column disabling,
thinking-state input lock, side/difficulty changes, undo, help focus restoration,
result dialog behavior, and reduced-motion completion.

**Verify**: `pnpm test --run src/games/connect-four`

### Step 5: Add scoped responsive presentation

Create `styles/connect-four.css`. Use a technical tabletop direction distinct
from Othello: matte navy frame, warm neutral field, red/yellow discs, and crisp
column targeting. Preserve adequate contrast without relying on color alone;
label players and results in text.

Manually inspect 320×568, 768×1024, 1440×900, and a short landscape viewport.
Confirm the board, essential controls, and status remain visible without page
scrolling or layout shifts during disc drops.

### Step 6: Register the route and catalog card

Create `src/app/games/connect-four/page.tsx` as a Server Component that imports
only the game stylesheet and Client entry. Add server-safe catalog metadata and
code-native card art; update catalog and home-page accessible-link tests. Do not
export runtime modules through `src/games/catalog.ts`.

**Verify**: catalog/home tests pass and `pnpm build` statically generates
`/games/connect-four`.

### Step 7: Run the release gate and close tracking

Review the diff for readable functions, immutable transitions, cleanup, scoped
CSS, and excluded features. Run `pnpm lint`, `pnpm typecheck`, focused tests,
then `pnpm check`. Mark plan 011 `DONE` only after the complete gate succeeds.

## Done criteria

- [x] Rules tests cover gravity, invalid moves, draws, and every win direction.
- [x] All three AI levels return legal moves and satisfy their tactical/search
  contracts under deterministic tests.
- [x] First/second side choice, AI opening, stale replies, fallback, undo, and
  round completion are regression tested.
- [x] Board works with pointer, touch, and keyboard and has concise accessible
  announcements.
- [x] Drop motion does not change cell geometry and reduced motion is supported.
- [x] Route CSS is isolated and the page fits supported viewports without
  document scrolling.
- [x] No records, streaks, persistence, timers, hints, online features, copied
  Nintendo assets, or new runtime dependencies are present.
- [x] Catalog/home integration passes and `/games/connect-four` builds statically.
- [x] `pnpm check` passes and `plans/README.md` marks plan 011 `DONE`.

## STOP conditions

- Current architecture materially conflicts with route-local Worker or scoped
  game CSS conventions.
- Product requirements expand to online/local multiplayer, variable boards,
  account state, records, or timed competition without revising this plan.
- Search cannot remain responsive within the stated Worker budget.
- Implementation would require copied proprietary presentation/assets, a new
  dependency, or document-global input suppression.
