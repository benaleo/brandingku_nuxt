<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# sub-list

## Purpose
Sub-categories of the category named by the parent `[id]` segment. The only place in the console where a listing is scoped to a parent record.

## Key Files

| File | Description |
|------|-------------|
| `index.vue` | `/…/[id]/sub-list` (92 lines) — the children of this category. |
| `add.vue` | `/…/[id]/sub-list/add` (34 lines). Reads `parentId` as `computed(() => Number(route.params.id))` and renders `ProductCategoryForm` with `:isChild="true" :parentId="parentId" :hideSubCategories="true"`. Passes `:create-path="''"` to `AppTableHeader` to suppress the create button. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `[childId]/` | Edit route for one sub-category (see `[childId]/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- `parentId` comes from `route.params.id`, the grandparent segment — not from `[childId]`. Getting these two confused reparents the record.
- `Number(route.params.id)` is unguarded: a non-numeric segment yields `NaN` and the form submits a broken parent link.
- The three props on `ProductCategoryForm` are what make it behave as a child editor. Dropping any one of them turns the page into a top-level category form.

### Testing Requirements
- Add a sub-category, then confirm it appears under the correct parent in the parent listing and on the public site.

## Dependencies

### Internal
- `components/forms/ProductCategoryForm.vue`
- `components/elements/AppTableHeader.vue`, `AppBreadcrumb.vue`
- `services/product-category.service.ts`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
