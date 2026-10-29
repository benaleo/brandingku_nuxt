<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# plugins

## Purpose
Nuxt plugins. All of them are `.client.ts`, so they run only in the browser and are excluded from the server bundle.

## Key Files

| File | Description |
|------|-------------|
| `apollo-dev-messages.client.ts` | Enables Apollo Client's verbose development error messages. |

## For AI Agents

### Working In This Directory
- The `.client` suffix is load-bearing. Dropping it makes these run during SSR.
- Plugins run once per app instance before the first route renders — keep the work here to registration, not data fetching.

### Testing Requirements
- `pnpm run build` then `pnpm run preview` — an SSR-unsafe plugin fails at render, not at build.

## Dependencies

### Internal

### External
- `@apollo/client`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
