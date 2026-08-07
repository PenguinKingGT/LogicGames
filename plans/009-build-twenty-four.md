# Plan 009: Add a complete 24 Point arithmetic game

> **Executor instructions**: Follow this plan in order. Keep arithmetic and
> puzzle validation in pure domain modules, run every verification gate, and
> update this plan's row in `plans/README.md` when work starts and finishes.
>
> **Drift check (run first)**:
> `git status --short && git diff --stat && pnpm check`
> The baseline at planning commit `b13b638` contains six playable routes. If
> the catalog, route pattern, or verification baseline has materially changed,
> reconcile this plan before implementation rather than duplicating new code.

## Status

- **Priority**: P2
- **Effort**: M (one to two focused days including tests and responsive polish)
- **Risk**: MED; exact fractional arithmetic, puzzle classification, and
  expression-state correctness are the primary risks
- **Depends on**: `plans/008-build-othello.md`
- **Category**: feature / game
- **Planned at**: commit `b13b638` on 2026-08-07

## Why this matters

24 Point adds a short-session arithmetic game to the collection. Unlike the
existing spatial and adversarial games, it tests number sense and expression
construction. A card-combination interaction keeps the rules understandable
on touch screens while an exact rational engine prevents incorrect judgments
caused by floating-point arithmetic.

## Product and rules contract

- Route: `/games/twenty-four`; menu title: `24 点`; English title: `24 Point`.
- Each puzzle contains exactly four integers in the inclusive range `1–13`.
- Every source number must be used exactly once. The allowed binary operations
  are addition, subtraction, multiplication, and division; grouping is
  represented by the order in which cards are combined.
- Intermediate negative values and fractions are valid. Division by zero is
  invalid. The final result must equal exactly 24.
- Use normalized rational numbers (`numerator`/`denominator` plus greatest
  common divisor reduction), never an epsilon comparison over `number`.
- Every presented puzzle must have at least one verified solution. Puzzle
  selection accepts injected randomness so tests are deterministic.
- A round ends only when one card remains and its value is exactly 24. A
  one-card non-24 expression remains editable through undo or reset.
- Viewing a hint only reveals one solution and does not create a score,
  completion category, streak, or other record.
- The first release is single-player and local-only. Free-form text parsing,
  online leaderboards, accounts, daily server challenges, and user-authored
  puzzles are out of scope.

## Interaction contract

Use staged card combination rather than a free-form expression input:

1. Select the first number or intermediate-expression card.
2. Select an operator.
3. Select the second card.
4. Replace both operands with one result card displaying its value and compact
   expression.

The order of operands matters for subtraction and division. Keep the first
selection visually and textually identifiable. Provide `撤销`, `换一题`,
`提示`, `查看答案`, `下一题`, `玩法`, and a sound toggle. Disable actions that
are not valid for the current phase rather than accepting silent no-ops.

Keyboard users must be able to tab between cards/operators and activate them
with Enter or Space. Status changes and invalid division should be announced
through one polite live region. Controls should meet a 44 px touch target, fit
at 320 px without horizontal scrolling, and respect `prefers-reduced-motion`.

## Puzzle strategy

Enumerate all 1,820 sorted four-number multisets from `1–13`, including
repeated values, and retain every combination the exact solver can resolve.
Generate this complete bank once at module initialization; never search again
during React rendering. There are no difficulty labels or filters: every
solvable combination participates in one random pool.

The solver should enumerate unordered operand pairs, both operand orders where
needed, and all legal operations. Deduplicate equivalent rational states and
canonicalize commutative expressions to control search size.

## Architecture and files

```text
src/games/twenty-four/
├── domain/
│   ├── types.ts
│   ├── rational.ts
│   ├── solver.ts
│   ├── puzzles.ts
│   └── *.test.ts
├── app/
│   ├── game-reducer.ts
│   ├── game-reducer.test.ts
│   ├── App.tsx
│   └── App.test.tsx
├── components/
├── persistence/
├── audio/
└── styles/twenty-four.css
src/app/games/twenty-four/page.tsx
```

Keep the route page server-rendered with metadata and one Client Component
game entry. Scope all styles and palette variables beneath
`.twenty-four-game` and `.twenty-four-portal`. Do not add a state-management,
math, parser, or animation dependency.

## Persistence contract

Persist only the sound preference under `twenty-four:v1`. Do not store puzzle
state, completion counts, assisted counts, best times, streaks, or difficulty.

Do not restore an unfinished expression tree in the first release. Validate
the complete stored shape, tolerate unavailable or malformed local storage,
and fall back to defaults without breaking the game.

## Steps

### Step 1: Build exact arithmetic primitives

Define immutable rational values and pure `add`, `subtract`, `multiply`, and
`divide` operations. Normalize denominator signs, reduce all results, reject a
zero denominator, and format whole/fractional values consistently.

**Verify**: focused tests cover reduction, negative values, large common
factors, exact equality, all operations, and division by zero.

### Step 2: Implement and validate the solver

Create a pure recursive solver that returns structured expression trees rather
than executable strings. Add solution evaluation and source-number accounting
so a malformed expression cannot be accepted.

**Verify**: known solvable puzzles such as `3,3,8,8` resolve exactly; known
unsolvable tuples return no solution; repeated numbers retain multiplicity;
every returned expression evaluates to 24 and consumes all four inputs.

### Step 3: Create the puzzle bank

Enumerate all 1,820 sorted combinations and retain all 1,362 solvable ones.
Validate the entire bank in tests: unique sorted keys, valid range, four
operands, and at least one solution.

**Verify**: `pnpm test --run src/games/twenty-four/domain` passes without
random or time-dependent assertions.

### Step 4: Model the game as a reducer

Represent cards with stable IDs, exact values, expression trees, and source
IDs. Model first-card/operator/second-card selection, combination, undo stack,
completion, next puzzle, and round IDs as explicit actions.
Reject stale or invalid actions without mutating state.

**Verify**: reducer tests cover every operator, operand order, repeated
numbers, divide-by-zero rejection, multi-step undo, successful completion, and
next-round reset.

### Step 5: Build accessible components and visual system

Create a focused header, puzzle workspace, operand cards, operator dock,
expression/history area, help dialog, hint/solution dialog,
and completion dialog. Use code-native CSS/SVG artwork for the catalog card.
Keep motion limited to selection, combination, and successful completion so
the arithmetic remains readable.

**Verify**: Testing Library completes a deterministic puzzle using accessible
roles, exercises undo/reset, opens dialogs, and confirms focus restoration.

### Step 6: Add storage and optional audio

Implement defensive sound-preference storage and a route-owned Web Audio manager.
Use concise cues for selection, combination, invalid operation, success, and
button actions. Audio initializes only after user interaction and failures
must never block gameplay.

**Verify**: storage and audio tests cover unavailable browser APIs, malformed
payloads, and mute behavior. Confirm no gameplay record is persisted.

### Step 7: Integrate route and catalog

Add route metadata, game-owned stylesheet import, the catalog entry, matching
home-card artwork, and update catalog/home tests that currently encode route
count and order. Keep runtime game modules out of `src/games/catalog.ts`.

**Verify**: `/games/twenty-four` appears as a statically generated route and
the home link has the correct accessible name and href.

### Step 8: Final quality gate

Review touched files against `AGENTS.md`, remove duplicated rule logic, check
320 px and desktop layouts, and confirm reduced-motion behavior.

**Verify**: `pnpm check` passes lint, typecheck, the full Vitest suite, and the
production build.

## Done criteria

- [x] Rational arithmetic is exact and fully tested.
- [x] Every solvable combination is included and solver-verified.
- [x] Players can complete a round using pointer, touch, or keyboard.
- [x] Undo, hints, answers, completion, and next-puzzle flows work.
- [x] No completion, assistance, difficulty, time, or streak records exist.
- [x] The sound preference survives refresh safely.
- [x] The route and catalog entry remain server-safe and statically generated.
- [x] Game CSS and portal styles do not leak into other routes.
- [x] `pnpm check` exits successfully.
- [x] `plans/README.md` marks plan 009 `DONE`.

## STOP conditions

- The current catalog or route architecture conflicts with the paths above.
- A requested interaction requires arbitrary expression parsing or another
  scope expansion not covered by this plan.
- Implementing the game appears to require a new runtime dependency; report
  the need before adding it.
