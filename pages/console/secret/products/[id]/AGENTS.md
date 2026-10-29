<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# [id]

## Purpose
Edit and detail routes for a single product. Both render `ProductForm`; the form distinguishes the two from the URL.

## Key Files

| File | Description |
|------|-------------|
| `edit.vue` | Edit route. Renders `AppTableHeader` and `ProductForm`; the form loads the record itself from the route id. |
| `detail.vue` | Read-only route. Renders the same `ProductForm` — the form switches to detail mode based on the path. |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- The add/edit/detail trio all render the same form component. The form decides create-vs-update from the route via `getPathWithoutIdInForm()` / `getIdFromPath()` in `utils/global.utils.ts`, so renaming a segment here silently changes form behaviour without any type error.
- Neither file passes the id as a prop — `ProductForm` reads it from the route with `getIdFromPath()`. Renaming these files or the segment breaks that lookup with no compile error.
- `detail.vue` and `edit.vue` are near-identical apart from the title string. Keep them in sync when the form's props change.

### Testing Requirements
- Open both routes for a real product id.

## Dependencies

### Internal
- `components/forms/ProductForm.vue`
- `utils/global.utils.ts` — `getIdFromPath`, `getPathWithoutIdInForm`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
