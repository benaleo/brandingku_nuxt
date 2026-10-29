<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# example

## Purpose
A worked example of the console page pattern, kept as an in-repo reference for building new admin screens.

## Key Files

| File | Description |
|------|-------------|
| `index.vue` | `/console/secret/example` (66 lines) — a complete listing page: layout, head, table header and a datatable. |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- This exists to be copied. Keep it working and current; a stale example is worse than none.
- It is a live route in production. It should hold no real data and no real service calls.

### Testing Requirements
- Load the route and confirm it still renders after changes to the shared console components.

## Dependencies

### Internal
- `components/elements/AppTableHeader.vue`, `AppFilterTable.vue`
- `components/datatables/`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
