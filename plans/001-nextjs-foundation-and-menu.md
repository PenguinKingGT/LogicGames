# Plan 001: Establish the Next.js application and tested game menu

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If a STOP condition occurs, stop and report instead of
> improvising. When done, update this plan's row in `plans/README.md`.
>
> **Drift check (run first)**:
> `find . -maxdepth 2 -type f -not -path './.git/*' -print | sort`
> Expected: only files under `plans/`. If application source or a package
> manifest now exists, compare it with this plan and STOP on an architectural
> conflict.

## Status

- **Priority**: P1
- **Effort**: M (about one focused day including tests and responsive polish)
- **Risk**: LOW; this creates the shell but does not migrate game behavior
- **Depends on**: none
- **Category**: migration / dx / direction
- **Planned at**: no target commit; repository empty on 2026-08-01

## Why this matters

The target repository has no application or verification baseline. This plan
creates a conventional Next.js App Router project whose home page is a small,
static menu and whose route structure can accept each game without turning the
entire site into one Client Component. It also establishes one command set for
all later migration work.

## Current state and design contract

- `/Users/huangxiaoxiong/Code/LogicGames` contains no app files and is not a
  Git repository.
- The two source projects require Node `>=22.12.0`; PolyMine records
  `packageManager: pnpm@11.8.0`. Adopt both constraints.
- Next.js official guidance supports App Router, `src/`, TypeScript, Tailwind,
  and pnpm. Its Vitest guide uses `vitest`, `@vitejs/plugin-react`, `jsdom`,
  Testing Library, and `vite-tsconfig-paths`.
- The home page must be a synchronous Server Component. Vitest does not support
  async Server Components, and this page needs no asynchronous work.
- Use these stable slugs and routes everywhere:

  | slug | Chinese title | route | description |
  |------|---------------|-------|-------------|
  | `mastermind` | 彩码谜局 | `/games/mastermind` | 用颜色与位置反馈破解四位密码 |
  | `polymine` | PolyMine 多边形扫雷 | `/games/polymine` | 在正方形、三角形和六边形棋盘上推理排雷 |

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `pnpm install` | exit 0 and one `pnpm-lock.yaml` |
| Develop | `pnpm dev` | Next.js dev server starts |
| Lint | `pnpm lint` | exit 0, no ESLint errors |
| Typecheck | `pnpm typecheck` | exit 0, no TypeScript errors |
| Tests | `pnpm test --run` | exit 0, all tests pass |
| Coverage | `pnpm test:coverage` | exit 0 and thresholds pass |
| Build | `pnpm build` | exit 0 and `/` is generated |

## Suggested executor toolkit

- Apply `vercel-react-best-practices` if available. In particular, preserve
  Server Component route boundaries and do not import either game from the
  menu module.
- Reference the official Next.js Vitest guide and App Router documentation if
  generated configuration differs from current framework conventions.

## Scope

**In scope**:

- Root manifests and tooling: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`,
  `next-env.d.ts`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`,
  `vitest.config.mts`, `.gitignore`, `.editorconfig`.
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`,
  `src/app/not-found.tsx`.
- `src/components/site/**`, `src/games/catalog.ts`, `src/test/setup.ts` and
  colocated tests for catalog/menu behavior.
- Empty placeholder route pages under `src/app/games/{mastermind,polymine}` if
  useful to prove routing; they must clearly say the migration is pending and
  will be replaced by plans 002/003.

**Out of scope**:

- Any edit to `../PolyMine` or `../MasterMind`.
- Copying game source, styles, images, `dist/`, or `coverage/`.
- A backend, API routes, authentication, database, analytics, PWA/service
  worker, or deployment-specific static export.
- A runtime plugin loader or shared game-state store.

## Git workflow

- Initialize Git only if the operator wants this repository versioned now.
  Never alter either sibling repository.
- Use Conventional Commits, matching PolyMine; suggested commit:
  `feat: scaffold logic games menu`.
- Do not push or open a PR unless instructed.

## Steps

### Step 1: Create the package and framework baseline

Create the Next.js app manually in the existing directory because `plans/`
already makes it unsuitable for blindly running `create-next-app .`.

- Set `name` to `logic-games`, `private` to `true`, `packageManager` to
  `pnpm@11.8.0`, and `engines.node` to `>=22.12.0`.
- Runtime dependencies: `next`, `react`, `react-dom`.
- Development dependencies: TypeScript and React/Node types, Tailwind CSS 4
  plus `@tailwindcss/postcss`, ESLint plus Next's ESLint configuration, Vitest,
  V8 coverage, `@vitejs/plugin-react`, `vite-tsconfig-paths`, jsdom,
  `@testing-library/react`, `@testing-library/dom`,
  `@testing-library/jest-dom`, and `@testing-library/user-event`.
- Scripts must be exactly usable as: `dev`, `build`, `start`, `lint`,
  `typecheck` (`tsc --noEmit`), `test` (`vitest`), `test:watch` (`vitest`), and
  `test:coverage` (`vitest run --coverage`).
- Configure the `@/* -> ./src/*` alias and strict TypeScript. Do not carry Vite
  application config into the Next app.

**Verify**: `pnpm install && pnpm typecheck` -> exit 0 and only
`pnpm-lock.yaml` is created as a lockfile.

### Step 2: Configure Vitest once for the whole collection

Create `vitest.config.mts` using `@vitejs/plugin-react` and
`vite-tsconfig-paths`. Use `jsdom`, load `src/test/setup.ts`, enable CSS, and
configure V8 text/html coverage. Start with thresholds of 80% for lines and
statements and 75% for branches and functions. Exclude framework declarations,
test setup, generated output, and presentational UI primitives; do not exclude
game engines in later plans.

The setup file must import `@testing-library/jest-dom/vitest` and run Testing
Library cleanup after every test. It may clear localStorage after each test but
must guard browser-only objects so config loading remains safe.

**Verify**: `pnpm test --run --passWithNoTests` -> exit 0.

### Step 3: Define the static game catalog

Create `src/games/catalog.ts` as server-safe data only. Export a readonly list
with `slug`, `title`, `shortDescription`, `href`, `status`, and a small visual
token such as `accent` or `symbol`. Do not import React, game modules, icons
from either game's library, or browser APIs. Derive menu cards from this list;
do not duplicate route strings in JSX.

Add tests proving there are exactly two unique slugs, every href matches
`/games/<slug>`, and both required routes are present.

**Verify**: `pnpm test --run src/games` -> all catalog tests pass.

### Step 4: Build the server-rendered menu and shared document shell

- `layout.tsx` owns Chinese document metadata, viewport behavior, a locally
  available/system font stack or `next/font`, and the shared global stylesheet.
- `/` presents the collection name, one concise introduction, and two clear
  `<Link>` cards generated from the catalog. Each card needs a heading,
  description, visible affordance, and an accessible name.
- Use an editorial, playful puzzle-library direction rather than reproducing
  either game's full-screen background. Keep the page useful at 320px and
  avoid fixed viewport heights that clip cards.
- Keep menu JSX static and server-rendered. There should be no `'use client'`
  in `page.tsx`, catalog code, or menu-card components.
- Add a shared `GamePageHeader` or `BackToMenuLink` that later routes can reuse,
  but do not force game pages into a card-within-card layout.
- Provide `not-found.tsx` with a link back to `/`.

Add a Testing Library test that renders the synchronous home page and asserts
the heading plus both links and their exact href values.

**Verify**: `pnpm test --run` -> all tests pass.

### Step 5: Add route placeholders and verify production output

Create static placeholder pages at both final route paths only if they were not
already added. They should reuse the back link, have distinct metadata, and
not import any source-project code. These placeholders are temporary and are
explicitly replaced in plans 002/003.

**Verify**:

- `pnpm lint && pnpm typecheck && pnpm test --run && pnpm build` -> all exit 0.
- Build output lists `/`, `/games/mastermind`, and `/games/polymine` without a
  dynamic-server marker caused by request-time APIs.

## Test plan

- `src/games/catalog.test.ts`: two unique games and correct slug/href mapping.
- `src/app/page.test.tsx`: collection heading and accessible links to both
  routes.
- If a reusable site header/back link has conditional behavior, add one focused
  component test; avoid snapshots.

## Done criteria

- [ ] `pnpm lint` exits 0.
- [ ] `pnpm typecheck` exits 0.
- [ ] `pnpm test --run` exits 0 with meaningful catalog and menu assertions.
- [ ] `pnpm test:coverage` exits 0 at the configured thresholds.
- [ ] `pnpm build` exits 0 and produces all three routes.
- [ ] `rg -n "use client" src/app/page.tsx src/games/catalog.ts` finds no match.
- [ ] `find . -maxdepth 2 -name '*lock*'` finds `pnpm-lock.yaml` and no npm/yarn
  lockfile.
- [ ] No files under either sibling source repository changed.
- [ ] `plans/README.md` marks plan 001 `DONE`.

## STOP conditions

- The target directory contains an existing app or package choices that
  conflict with this plan.
- Current Next.js requires a materially different React, TypeScript, Tailwind,
  or ESLint setup than the compatible versions selected by pnpm.
- A package requires Node newer than the agreed `>=22.12.0` baseline.
- Building the static menu unexpectedly requires request-time server APIs.
- A step appears to require editing either source repository.

## Maintenance notes

- Add future games by adding catalog metadata and a real route; do not make the
  catalog import runtime game components.
- Reviewers should check that the home route's client JavaScript remains near
  zero and that game dependencies are absent from its import graph.
- If deployment later requires purely static hosting, evaluate Next.js static
  export only after all route and asset behavior is known.

