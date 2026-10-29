<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# products

## Purpose
Product CRUD. The largest console area — a product carries galleries, additionals and a category link, all edited through one form.

## Key Files

| File | Description |
|------|-------------|
| `index.vue` | `/console/secret/products` (165 lines) — listing. Columns from `productColumns`, data from `useProductService`, toasts via `vue-sonner`. |
| `add.vue` | `/console/secret/products/add` (24 lines) — `AppTableHeader` + `ProductForm`, title `Tambah Produk`. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `[id]/` | Edit and detail routes for one product (see `[id]/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- The add/edit/detail trio all render the same form component. The form decides create-vs-update from the route via `getPathWithoutIdInForm()` / `getIdFromPath()` in `utils/global.utils.ts`, so renaming a segment here silently changes form behaviour without any type error.
- `ProductForm.vue` is shared by all three routes and is the real implementation — these page files should stay at ~24 lines.
- Deleting a product must also clean up its gallery objects in the S3-compatible store; that is `useDeleteCloudFile`'s job, not the backend's.
- The backend caches product queries in Redis. After a write, the resolver invalidates by prefix — if a change here does not show up, suspect a stale cache before suspecting the query.

### Testing Requirements
- Create, edit and delete a product end to end in `pnpm run dev` against a running backend.
- Confirm the listing reflects the change without a hard refresh.

## Dependencies

### Internal
- `components/forms/ProductForm.vue`
- `components/datatables/productColumns.ts`
- `services/product.service.ts`, `product-additional.service.ts`, `product-galleries.service.ts`
- `types/products.type.ts`

### External
- `vue-sonner`, `@tanstack/vue-table`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
