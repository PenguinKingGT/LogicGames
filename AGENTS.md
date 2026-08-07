# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js App Router collection of standalone logic games.

- `src/app/` contains routes, metadata, and global site styles.
- `src/games/<slug>/` owns each game’s domain logic, reducer/application state, components, persistence, audio, scoped CSS, and colocated tests.
- `src/components/site/` contains shared home-menu components.
- `src/games/catalog.ts` is server-safe menu metadata. Do not export runtime game modules through it.
- `src/test/setup.ts` configures the test environment.
- `public/games/<slug>/` contains licensed static assets; document third-party assets and transformations.
- `plans/` contains implementation plans and their status index.

Add a game at `src/games/<slug>/`, create `src/app/games/<slug>/page.tsx`, and register it in the catalog. Keep game styles and browser lifecycles isolated from other routes.

## Build, Test, and Development Commands

Use Node.js 22.12+ and pnpm 11.8.

- `pnpm dev` starts the local Next.js development server.
- `pnpm lint` runs ESLint across the repository.
- `pnpm typecheck` runs TypeScript without emitting files.
- `pnpm test --run` runs the Vitest suite once.
- `pnpm test --run src/games/othello` runs a focused game suite.
- `pnpm test:coverage` generates V8 coverage.
- `pnpm build` creates the production build.
- `pnpm check` runs lint, typecheck, tests, and build; use it before handoff.

## Coding Style & Naming Conventions

Use TypeScript, function components, two-space indentation, double quotes, and immutable state transitions. Name components and exported types in PascalCase, variables in camelCase, and route directories in kebab-case. Keep rules in pure domain modules; React must not duplicate game-engine behavior. Scope CSS beneath a game root and portal class—never assign game palettes globally.

## Code Quality Requirements

Readability is a release requirement, not optional polish.

- Do not compress JSX, CSS rules, object literals, or multiple statements onto one line. Prefer one prop, declaration, or statement per line when a construct no longer reads comfortably.
- Keep functions focused and use early returns. Extract named helpers when logic has multiple branches, repeated expressions, or mixed responsibilities.
- Split large React files into components and hooks by responsibility. Components should describe UI structure; reducers and domain modules own rules and transitions.
- Use descriptive domain names. Avoid vague identifiers such as `data`, `item`, `temp`, or `value` when a precise name is available.
- Avoid nested ternaries, non-null assertions, broad type casts, duplicated rules, and unexplained magic numbers. Promote meaningful constants and types.
- Comments should explain constraints or reasoning, not restate code. Remove dead code, debug output, and commented-out implementations.
- Match surrounding architecture without copying poor formatting. Improve touched code when necessary to keep the change understandable, but avoid unrelated rewrites.
- Before handoff, review the diff for clarity, then run `pnpm lint`, `pnpm typecheck`, relevant focused tests, and `pnpm check` for completed features.

## Testing Guidelines

Tests use Vitest, jsdom, and Testing Library. Name tests `*.test.ts` or `*.test.tsx` beside the implementation. Test engines with injected randomness/time, reducers as state machines, storage with injectable adapters, and UI through accessible roles. Add regression coverage for every bug fix.

## Commit & Pull Request Guidelines

Follow Conventional Commits used in history, for example `feat(othello): add deterministic AI search` or `fix(othello): prevent flip animation layout shift`. Keep commits focused. Pull requests should explain behavior and risk, list verification commands, link relevant issues/plans, and include screenshots or recordings for visual or motion changes. Do not commit build artifacts or unrelated working-tree changes.

## Security & Configuration

Browser data is local-only; validate versioned `localStorage` payloads and tolerate unavailable storage/audio APIs. Never commit secrets. Keep Phaser and Web Workers route-local so they do not enter the home-page bundle.
