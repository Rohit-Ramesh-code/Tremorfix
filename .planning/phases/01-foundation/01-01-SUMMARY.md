---
phase: 01-foundation
plan: 01
subsystem: database
tags: [vite, react, express, better-sqlite3, sqlite, react-router-dom, concurrently, synthetic-data]

# Dependency graph
requires: []
provides:
  - Monorepo scaffold (root, client/, server/) with all npm dependencies installed
  - React/Vite client with proxy forwarding /api to Express port 5000
  - Express server with cors, better-sqlite3, profiles route
  - SQLite schema: profiles and telemetry tables with composite index
  - Seeded database with 40,322 rows of synthetic tremor telemetry for 2 profiles
affects: [02-dashboard]

# Tech tracking
tech-stack:
  added: [vite@5, react@18, react-router-dom@6, express@4, better-sqlite3@12.8.0, cors, concurrently@8, nodemon@3]
  patterns: [monorepo-with-prefix-scripts, vite-proxy-for-cors, ema-smoothed-synthetic-data, idempotent-seed-script]

key-files:
  created:
    - package.json
    - client/package.json
    - client/vite.config.js
    - client/index.html
    - client/src/main.jsx
    - client/src/App.jsx
    - server/package.json
    - server/index.js
    - server/routes/profiles.js
    - server/db/schema.sql
    - server/scripts/seed.js
  modified: []

key-decisions:
  - "Used better-sqlite3@12.8.0 (not ^9.0.0) — latest version has prebuilt binaries for Node 25.x; v9 required native compilation that failed without Visual Studio Build Tools"
  - "Wrote client files directly instead of running npm create vite@latest — avoids interactive prompts in non-TTY shell"
  - "Added .gitignore at project root — not in original plan but essential to exclude node_modules and the generated .db file"

patterns-established:
  - "Monorepo scripts use --prefix flag: npm run dev --prefix server/client"
  - "Seed script idempotency: DELETE + reset sqlite_sequence before insert"
  - "EMA smoothing alpha=0.15 with circadian envelope for realistic tremor waveform data"

requirements-completed: [DATA-01, DATA-02]

# Metrics
duration: 3min
completed: 2026-03-29
---

# Phase 1 Plan 01: Monorepo Scaffold and Synthetic Data Summary

**React/Vite + Express monorepo with SQLite seeded with 40,322 rows of EMA-smoothed circadian tremor telemetry for two demo profiles**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-29T03:35:48Z
- **Completed:** 2026-03-29T03:39:00Z
- **Tasks:** 2
- **Files modified:** 11 created, 0 modified

## Accomplishments
- Full monorepo scaffold: root, client/ (Vite+React), server/ (Express) each with own package.json and all dependencies installed
- Vite proxy configured to forward /api to port 5000, eliminating CORS issues during development
- SQLite schema with profiles and telemetry tables, composite index on (profile_id, recorded_at)
- Idempotent seed script producing 20,161 rows per profile (40,322 total) with circadian amplitude variation and EMA temporal smoothing

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold monorepo with all dependencies** - `190a998` (feat)
2. **Task 2: Create SQLite schema and idempotent seed script** - `cd8c171` (feat)

**Plan metadata:** _(see final docs commit)_

## Files Created/Modified
- `package.json` - Root monorepo with concurrently dev script and seed script
- `client/package.json` - Vite+React+react-router-dom dependencies
- `client/vite.config.js` - Vite config with /api proxy to localhost:5000
- `client/index.html` - HTML entry point
- `client/src/main.jsx` - React root mount
- `client/src/App.jsx` - Placeholder App component
- `server/package.json` - Express+cors+better-sqlite3+nodemon
- `server/index.js` - Express entry point with schema load and profiles route
- `server/routes/profiles.js` - GET /api/profiles route returning all profiles
- `server/db/schema.sql` - profiles and telemetry tables with composite index
- `server/scripts/seed.js` - Idempotent seed generating ~40,320 rows with EMA+circadian envelope

## Decisions Made
- **better-sqlite3@12.8.0 over ^9.0.0**: The plan specified ^9.0.0 but Node 25.2.1 on this machine has no prebuilt binary for v9, which requires native compilation via node-gyp + Visual Studio Build Tools. Version 12.8.0 explicitly lists Node 25.x in its engines field and installed successfully via prebuilt binary.
- **Direct client file creation over npm create vite**: Avoids interactive prompts in non-TTY shell environments.
- **Added .gitignore**: Essential to prevent node_modules/ and tremorix.db from being committed; not in plan but falls under Rule 2 (missing critical functionality).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added .gitignore**
- **Found during:** Task 1 (initial git status before commit)
- **Issue:** No .gitignore existed; node_modules/ directories and the generated .db file would have been staged
- **Fix:** Created .gitignore excluding node_modules/, server/db/tremorix.db, dist/, .env, *.log
- **Files modified:** .gitignore (new)
- **Verification:** git status showed node_modules excluded after gitignore creation
- **Committed in:** 190a998 (Task 1 commit)

**2. [Rule 3 - Blocking] Upgraded better-sqlite3 to 12.8.0**
- **Found during:** Task 1 (npm install in server/)
- **Issue:** better-sqlite3@^9.0.0 requires native compilation; no prebuilt binary for Node 25.2.1, no Visual Studio Build Tools installed
- **Fix:** Installed better-sqlite3@12.8.0 which has prebuilt binaries for Node 25.x
- **Files modified:** server/package.json (version changed to 12.8.0)
- **Verification:** `node -e "require('better-sqlite3')"` succeeded, seed script ran successfully
- **Committed in:** 190a998 (Task 1 commit, package.json updated by npm)

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 blocking)
**Impact on plan:** Both auto-fixes necessary for correct operation. No scope creep. Core schema and seed logic unchanged from spec.

## Issues Encountered
- Node 25.2.1 has no prebuilt binaries for better-sqlite3 v9 — resolved by upgrading to v12.8.0 which explicitly supports Node 25.x (Rule 3 auto-fix)

## User Setup Required
None - no external service configuration required. Run `npm run seed` to regenerate data.

## Next Phase Readiness
- Database seeded and schema in place — Phase 2 dashboard work can proceed against real data
- Express server starts with `node server/index.js` and serves profiles at /api/profiles
- Dev environment starts with `npm run dev` at root (requires both client/ and server/ node_modules installed)
- No blockers

---
*Phase: 01-foundation*
*Completed: 2026-03-29*
