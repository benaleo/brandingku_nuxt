<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# server

## Purpose
Nitro server-side code. Everything here runs on the server only and never ships to the browser, which is what makes it the right place to hold secrets and proxy upstream calls.

## Key Files

| File | Description |
|------|-------------|
| `tsconfig.json` | Server-side TypeScript config, separate from the app-level `tsconfig.json`. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `api/` | Server API routes (see `api/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Code here can read the full `runtimeConfig`, including `apiSecret`. Client code only sees `runtimeConfig.public` — keep that boundary intact.
- This directory has its own tsconfig; Nitro auto-imports differ from the app's, so app composables are not automatically available here.

### Testing Requirements
- `pnpm run build`.
- Call the routes directly with curl against `pnpm run dev`.

## Dependencies

### External
- Nitro (bundled with Nuxt), `h3`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
