# Claude Cleaner

A local web app for scanning, visualizing, and managing [Claude Code](https://docs.anthropic.com/en/docs/claude-code) configurations across all your projects.

<!-- Replace with a screen recording / gif of the app in action -->
![Claude Cleaner Demo](claude-cleaner.gif)

## What It Does

Claude Code stores per-project settings (`.claude/`, `CLAUDE.md`, `settings.local.json`) and session transcripts across your filesystem. As you use Claude Code in more projects, this configuration sprawl becomes hard to track. Claude Cleaner gives you a single dashboard to:

- **Scan** one or more parent directories to discover projects with Claude Code configuration
- **View global config** (`~/.claude/CLAUDE.md`, `settings.json`, `settings.local.json`)
- **Inspect per-project config** including `CLAUDE.md` content and permission allow/deny lists
- **Filter** projects by presence of `.claude/` dirs, `CLAUDE.md` files, custom permissions, or session history
- **See stats** at a glance: total projects scanned, how many have configs, permissions, and sessions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | npm workspaces (`shared/`, `server/`, `client/`) |
| Server | Express 5, tsx, zod |
| Client | React 19, Vite, ts-pattern |
| Shared | zod schemas for API types |
| Quality | TypeScript strict mode, Husky pre-commit (typecheck) |

## Prerequisites

- Node.js 24.14.0 (pinned via `.nvmrc`)
- npm 11.9.0 (enforced via `engine-strict=true` in `.npmrc`)

## Getting Started

```bash
# Use the correct Node version
nvm use

# Install dependencies
npm install

# Build the shared package (required before first run)
npm run build -w shared

# Start both server and client in dev mode
npm run dev
```

The server runs on `http://localhost:3001` and the client on `http://localhost:5173` (with API requests proxied to the server).

## Project Structure

```
claude-cleaner/
├── shared/           # Zod schemas shared between server and client
│   └── schemas.ts
├── server/           # Express 5 API server
│   └── src/
│       ├── index.ts
│       ├── routes/scan.ts
│       └── services/scanner.ts
├── client/           # React + Vite frontend
│   └── src/
│       ├── App.tsx
│       ├── components/
│       │   ├── ScanForm.tsx
│       │   ├── GlobalConfig.tsx
│       │   ├── StatsBar.tsx
│       │   ├── FilterBar.tsx
│       │   ├── ProjectList.tsx
│       │   └── ProjectDetail.tsx
│       ├── hooks/
│       │   ├── useScan.ts
│       │   └── useProjectFilter.ts
│       └── types/
│           └── filters.ts
├── .husky/pre-commit # Runs typecheck on commit
├── .nvmrc
├── .npmrc
└── package.json
```

## API

### `POST /api/scan`

Scans directories for projects with Claude Code configuration.

**Request:**
```json
{ "directories": ["/Users/you/code", "/Users/you/Desktop"] }
```

**Response:** `ScanResponse` containing an array of `ProjectInfo` objects and aggregate `Stats`.

### `GET /api/global-config`

Returns the global Claude Code configuration from `~/.claude/`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server and client concurrently |
| `npm run build` | Build shared, server, and client (in order) |
| `npm run typecheck` | Typecheck all workspaces |
| `npm run lint` | Lint client and server |
