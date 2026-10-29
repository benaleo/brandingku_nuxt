<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# portfolio

## Purpose
Portfolio CRUD. A portfolio entry owns a gallery, so writes here touch object storage as well as the database.

## Key Files

| File | Description |
|------|-------------|
| `index.vue` | `/console/secret/portfolio` (144 lines) — listing from `portfolioColumns` via `usePortfolioService`. |
| `add.vue` | `/console/secret/portfolio/add` (24 lines) — `AppTableHeader` + `PortfolioForm`. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `[id]/` | Edit and detail routes for one portfolio entry (see `[id]/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- The add/edit/detail trio all render the same form component. The form decides create-vs-update from the route via `getPathWithoutIdInForm()` / `getIdFromPath()` in `utils/global.utils.ts`, so renaming a segment here silently changes form behaviour without any type error.
- Gallery images are uploaded to the S3-compatible store, not to the Go server. Removing an image must call `useDeleteCloudFile` or the object is orphaned and keeps costing storage.
- `types/portfolio.type.ts` defines `PortfolioSortInput` and `PaginationInput`; the listing's sort and paging must match those shapes or the backend rejects the query.

### Testing Requirements
- Create an entry with images, edit it, remove an image, then confirm the object is gone from the bucket — not just from the UI.

## Dependencies

### Internal
- `components/forms/PortfolioForm.vue`
- `components/datatables/portfolioColumns.ts`
- `services/portfolio.service.ts`, `portfolio-gallery.service.ts`
- `composables/useDeleteCloudFile.ts`
- `types/portfolio.type.ts`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
