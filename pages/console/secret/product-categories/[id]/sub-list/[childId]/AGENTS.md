<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# [childId]

## Purpose
Edit route for a single sub-category, addressed by both its parent id and its own id.

## Key Files

| File | Description |
|------|-------------|
| `edit.vue` | `/…/[id]/sub-list/:childId/edit` (56 lines) — the longest of the console edit pages, because it has to resolve two route params rather than one. No `detail.vue` exists for sub-categories. |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- Two ids are in play: `route.params.id` is the parent, `route.params.childId` is the record being edited. `getIdFromPath()` is not used here — the params are read explicitly, which is why this file is longer than its siblings.
- Unlike every other entity, there is no detail route at this level. Do not assume the add/edit/detail trio holds here.

### Testing Requirements
- Edit a sub-category and confirm its parent link is unchanged after saving.

## Dependencies

### Internal
- `components/forms/ProductCategoryForm.vue`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
