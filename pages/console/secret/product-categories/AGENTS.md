<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# product-categories

## Purpose
Category CRUD. Categories are a two-level tree: a parent category owns sub-categories, managed through the nested `sub-list` routes.

## Key Files

| File | Description |
|------|-------------|
| `index.vue` | `/console/secret/product-categories` (114 lines) — listing from `productCategoryColumns` via `useProductCategoryService`. |
| `add.vue` | `/console/secret/product-categories/add` (24 lines) — `AppTableHeader` + `ProductCategoryForm`. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `[id]/` | Edit, detail and the sub-category list for one category (see `[id]/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- The add/edit/detail trio all render the same form component. The form decides create-vs-update from the route via `getPathWithoutIdInForm()` / `getIdFromPath()` in `utils/global.utils.ts`, so renaming a segment here silently changes form behaviour without any type error.
- `ProductCategoryForm` serves both levels. Sub-category routes pass `:isChild="true"`, `:parentId` and `:hideSubCategories="true"` — the parent routes pass nothing.
- The public site routes categories by slug (`pages/category/[slug].vue`). Editing a slug here changes a live public URL.
- Deleting a parent with children is a backend concern — check what the resolver does to the children before exposing a delete here.

### Testing Requirements
- Create a parent, add a sub-category under it, then confirm both appear on `/category`.

## Dependencies

### Internal
- `components/forms/ProductCategoryForm.vue`
- `components/datatables/productCategoryColumns.ts`
- `services/product-category.service.ts`
- `pages/category/[slug].vue` consumes the slugs

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
