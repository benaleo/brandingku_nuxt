<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# category

## Purpose
Public category browsing. Two routes: the index of all categories and a slug-addressed detail page listing the products in one category.

## Key Files

| File | Description |
|------|-------------|
| `index.vue` | `/category` — the category grid. Copy and head title live under `app.categoryPage`. |
| `[slug].vue` | `/category/:slug` (283 lines). The only page in the tree using `layout: 'page-layout'`. Resolves the category by slug and lists its products via `useGetProductsWithCategorySlug`. |

## For AI Agents

### Working In This Directory
- `[slug].vue` matches on the category slug, not the numeric id — the console edits ids, so a slug change in the admin breaks any URL already shared.
- This is the only consumer of the `page-layout` layout. Changing that layout affects this route alone, but changing this route's `layout` value leaves `page-layout` unused.

### Testing Requirements
- Visit `/category` and a real slug in `pnpm run dev` against a running backend.

## Dependencies

### Internal
- `composables/useGetProductsWithCategorySlug.ts`
- `services/landing-page.service.ts` — `useGetProductCategoryBySlug`
- `layouts/page-layout.vue`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
