<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# client

## Purpose
CRUD for the landing page's client entries. Follows the standard console shape: a datatable listing plus add/edit/detail routes that all render `ClientForm`.

## Key Files

| File | Description |
|------|-------------|
| `index.vue` | `/console/secret/landing-page/client` (123 lines) — listing via `useClientService`, columns from `components/datatables/clientColumns.ts`. |
| `add.vue` | Create route (12 lines) — `AppTableHeader` with a literal `page-title` plus `ClientForm`. These pages hard-code the title string rather than using a `computed`, unlike the products and portfolio trees. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `[id]/` | Edit and detail routes (see `[id]/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- The add/edit/detail trio all render the same form component. The form decides create-vs-update from the route via `getPathWithoutIdInForm()` / `getIdFromPath()` in `utils/global.utils.ts`, so renaming a segment here silently changes form behaviour without any type error.
- Content saved here is live on the public landing page the moment it is written.
- These three directories (`benefit`, `client`, `testimonial`) are copies of one another. A fix in one almost certainly applies to the other two.

### Testing Requirements
- Create and edit an entry, then reload `/` to confirm it renders.

## Dependencies

### Internal
- `components/forms/ClientForm.vue`
- `components/datatables/clientColumns.ts`
- `services/client.service.ts`
- `types/client.type.ts`
- `pages/index.vue`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
