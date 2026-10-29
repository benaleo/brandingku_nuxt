<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# [id]

## Purpose
Edit and detail routes for a single portfolio entry, both rendering `PortfolioForm`.

## Key Files

| File | Description |
|------|-------------|
| `edit.vue` | Edit route. Renders `AppTableHeader` and `PortfolioForm`; the form loads the record itself from the route id. |
| `detail.vue` | Read-only route. Renders the same `PortfolioForm` — the form switches to detail mode based on the path. |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- The add/edit/detail trio all render the same form component. The form decides create-vs-update from the route via `getPathWithoutIdInForm()` / `getIdFromPath()` in `utils/global.utils.ts`, so renaming a segment here silently changes form behaviour without any type error.
- The form reads the id from the route rather than a prop, same as the products tree.

### Testing Requirements
- Open both routes for a real portfolio id.

## Dependencies

### Internal
- `components/forms/PortfolioForm.vue`
- `utils/global.utils.ts`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
