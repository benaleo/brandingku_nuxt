<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# product

## Purpose
Public product catalogue: the browse/filter listing and the single-product detail page. These are the two largest public pages in the app.

## Key Files

| File | Description |
|------|-------------|
| `index.vue` | `/product` (400 lines) — listing with filtering and pagination, driven by `useProductList`. |
| `[slug].vue` | `/product/:slug` (366 lines) — product detail, driven by `useProductDetail`. Renders the gallery, additionals and the wishlist action. |

## For AI Agents

### Working In This Directory
- Both files are large and mix markup with data logic. Extract into `composables/` or `components/elements/` rather than growing them further.
- Routing is by slug. `useProductDetail` resolves the slug; do not switch these to ids without redirecting the existing URLs.
- These pages are server-rendered and are the app's main SEO surface — keep `useHead` populated from the fetched product, and avoid client-only rendering for the main content.

### Testing Requirements
- Load `/product` and a real product slug in `pnpm run dev`.
- Check the rendered HTML source to confirm content is present server-side.

## Dependencies

### Internal
- `composables/useProductList.ts`, `useProductDetail.ts`, `useWishlist.ts`
- `components/elements/ProductQuickView.vue`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
