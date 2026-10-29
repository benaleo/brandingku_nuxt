<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# datatables

## Purpose
The admin console's table layer: one generic table component plus a column definition module per entity, built on `@tanstack/vue-table`.

## Key Files

| File | Description |
|------|-------------|
| `DataTable.vue` | Generic TanStack table wrapper — takes columns and rows and renders sorting, paging and the shared shell. |
| `GeneralColumnAction.vue` | Reusable row-action cell (view / edit / delete) shared by the column definitions below. |
| `benefitColumns.ts` | Exports `benefitColumns`. |
| `clientColumns.ts` | Exports `clientColumns`. |
| `inquiryColumns.ts` | Exports `inquiryColumns`. |
| `portfolioColumns.ts` | Exports `portfolioColumns`. |
| `productAttributeColumns.ts` | Exports the `ProductAttribute` type and `productAttributeColumns`. |
| `productCategoryColumns.ts` | Exports `productCategoryColumns`. |
| `productCategoryChildColumns.ts` | Exports `productCategoryChildColumns` for the nested sub-category list. |
| `productColumns.ts` | Exports `productColumns`. |
| `testimonialColumns.ts` | Exports `testimonialColumns`. |

## For AI Agents

### Working In This Directory
- Column modules are plain `.ts` exporting a `ColumnDef[]`. They are not components and are not auto-imported as tags — import them explicitly in the page that renders the table.
- `types/tanstack-table.d.ts` augments TanStack's `ColumnMeta`; if you add a custom `meta` field on a column, declare it there or TypeScript rejects it.
- Row actions should reuse `GeneralColumnAction.vue` rather than each entity hand-rolling its own action cell.
- Image/logo thumbnails rendered in datatable columns must fit inside `max-w-[150px] max-h-[60px]` and use `object-contain`; wrap the thumbnail in a fixed `h-[60px]` container so rows stay compact and consistent.
- Console pages should pass their loading state into `DatatablesDataTable`; the shared table renders 10 skeleton rows across all columns while data is loading, then shows the empty state only after loading finishes.

### Testing Requirements
- `pnpm run build` for type errors in the column definitions.
- Exercise each table through its console page under `pages/console/secret/`.

## Dependencies

### Internal
- `types/` for the entity row shapes
- Rendered by the index pages under `pages/console/secret/`

### External
- `@tanstack/vue-table`, `lucide-vue-next`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
