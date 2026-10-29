<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# [id]

## Purpose
Routes scoped to one category: its edit and detail forms, plus the sub-category list nested underneath.

## Key Files

| File | Description |
|------|-------------|
| `edit.vue` | Edit route. Renders `AppTableHeader` and `ProductCategoryForm`; the form loads the record itself from the route id. |
| `detail.vue` | Read-only route. Renders the same `ProductCategoryForm` — the form switches to detail mode based on the path. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `sub-list/` | Sub-categories belonging to this category (see `sub-list/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- `:id` here is the parent category. The `sub-list` routes below read it with `Number(route.params.id)` and pass it to the form as `parentId` — this segment is load-bearing for the child routes, not just for these two files.

### Testing Requirements
- Open edit and detail for a category that has children.

## Dependencies

### Internal
- `components/forms/ProductCategoryForm.vue`
- `utils/global.utils.ts`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
