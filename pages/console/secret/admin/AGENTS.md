<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# admin

## Purpose
Admin user management. Currently a stub — the page renders its header and nothing else.

## Key Files

| File | Description |
|------|-------------|
| `index.vue` | `/console/secret/admin` (16 lines). Sets `useHead` and `layout: 'console-secret'`; the template is empty. No datatable, no service call yet. |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- This is a placeholder, not a working screen. Build it out following `../example/index.vue` or `../products/index.vue`, not by copying the current file.
- User records are seeded by `config.seedAdminUser` on the Go side. Any CRUD added here must respect the backend's `RequireAdminOrSuperAdmin` check — the frontend cannot be the only guard.

### Testing Requirements
- Manual, once implemented.

## Dependencies

### Internal
- `../example/` for the intended shape
- Backend: user resolvers in `graph/schema.resolvers.go`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
