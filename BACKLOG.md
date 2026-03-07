# Backlog

## Done

- [x] Project scaffolding (monorepo, workspaces, Husky, engines)
- [x] Shared zod schemas for API types
- [x] Express server with scan + global-config endpoints
- [x] Filesystem scanner service (1-level deep project discovery)
- [x] React client with scan form, stats bar, project list, expandable detail
- [x] Vite proxy to backend
- [x] ts-pattern for exhaustive state matching in UI
- [x] Filter/search within scan results (clickable stat cards + badge chips toggle AND filters)
- [x] Permission frequency analysis: show which permissions are most commonly allowed/denied across projects

## In Progress

## Upcoming

- [ ] "Lift up" feature: promote repeated project-level settings to user-level config
- [ ] Diff view: compare project CLAUDE.md against global CLAUDE.md
- [ ] Deep scan mode: recurse beyond 1 level for nested project structures
- [ ] Export scan results as JSON
- [ ] Session metadata display: show last-used dates from session .jsonl files
- [ ] Bulk operations: apply a settings change across multiple projects at once
