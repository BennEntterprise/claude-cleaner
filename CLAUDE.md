# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (starts server on :3001 and client on :5173 concurrently)
npm run dev

# Build all workspaces in order (shared must build first)
npm run build

# Typecheck all workspaces (shared runs tsc -b, others run tsc --noEmit)
npm run typecheck

# Lint client and server
npm run lint

# Build just the shared package (required before first run or after schema changes)
npm run build -w shared

# Run a single workspace command
npm run dev -w server
npm run dev -w client
npm run typecheck -w client
npm run lint -w client
```

## Architecture

Monorepo with three npm workspaces: `shared/`, `server/`, `client/`.

**shared/** contains Zod schemas (`schemas.ts`) that define all API request/response types. Uses `composite: true` and emits `.d.ts` files — must be built (`tsc -b`) before dependent packages can typecheck.

**server/** is an Express 5 API on port 3001. Routes are registered directly on the app instance via `registerRoutes(app)` rather than using `Router()` objects (workaround for an Express 5 + tsx bug). The scanner service (`services/scanner.ts`) handles all filesystem operations: scanning directories for Claude Code configs, reading `~/.claude/` global settings, and loading session data.

**client/** is React 19 + Vite. The Vite dev server proxies `/api` to `localhost:3001`. State management uses custom hooks with discriminated union state machines (idle/scanning/results/error) and `ts-pattern` for exhaustive matching. Business logic lives in hooks (`useScan`, `useProjectFilter`, `useSessions`, `useDiffAnalysis`); components are presentational.

## API Endpoints

- `POST /api/scan` — Scan directories for projects with Claude Code configuration
- `GET /api/global-config` — Read global `~/.claude/` settings
- `POST /api/sessions` — Load session metadata for given project paths

## Key Constraints

- **Node 24.14.0 / npm 11.9.0** pinned via `.nvmrc` and `engines` (enforced by `engine-strict=true` in `.npmrc`)
- **Pre-commit hook** runs `npm run typecheck` via Husky — all three workspaces must pass before commits
- **Shared must build before dependents**: run `npm run build -w shared` after changing `shared/schemas.ts`, or use `npm run typecheck` which handles ordering
- **No test framework** is configured; there are no tests
- **TypeScript strict mode** is enabled across all workspaces
