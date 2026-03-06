# Design Patterns

## Creational

### Singleton
- **`server/src/index.ts`** — Single Express app instance, configured once and shared across all route registrations.

## Structural

### Facade
- **`server/src/services/scanner.ts`** — `scanDirectories()` and `getGlobalConfig()` provide a simplified interface over multiple filesystem operations (reading dirs, parsing JSON, checking file existence, counting sessions).

### Proxy
- **`client/vite.config.ts`** — Vite dev server proxies `/api` requests to the Express backend, acting as a transparent intermediary between client and server.

## Behavioral

### Observer
- **`client/src/hooks/useScan.ts`** — React state hook uses a discriminated union (`idle | scanning | results | error`) as a state machine. Components observe state transitions and re-render accordingly.

### Strategy
- **`client/src/App.tsx`** — Uses `ts-pattern` for exhaustive pattern matching on the scan state, selecting different rendering strategies based on the current state variant.
- **`client/src/hooks/useProjectFilter.ts`** — `PREDICATES` record maps each `FilterKey` to a predicate function, enabling runtime strategy selection for filtering projects by different criteria.

### Template Method
- **`server/src/services/scanner.ts`** — `scanProject()` follows a fixed sequence of steps (check dir, check file, read settings, read content, count sessions) applied uniformly to every discovered project.
