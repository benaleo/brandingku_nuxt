<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# types

## Purpose
Shared TypeScript types mirroring the backend GraphQL schema, plus one module augmentation. These are the contract shared by services, forms and table column definitions.

## Key Files

| File | Description |
|------|-------------|
| `products.type.ts` | `Product`, `ProductAdditional`, `ProductGallery`, `ProductCategory`, `ProductCategoryRequest`. |
| `portfolio.type.ts` | `Portfolio`, `PortfolioGallery`, `PortfolioConnection`, `PortfolioSortInput`, `PaginationInput`. |
| `benefit.type.ts` | `Benefit`, `BenefitRequest`. |
| `client.type.ts` | `Client`, `ClientRequest`. |
| `testimonial.type.ts` | `Testimonial`, `TestimonialRequest`. |
| `inquiry.type.ts` | `Inquiry`, `InquiryConnection`. |
| `LandingPage.ts` | `FeaturedCategory` and a `Client` type. Note this `Client` is distinct from the one in `client.type.ts` — importing the wrong one is an easy mistake. |
| `options.type.ts` | `OptionType`, `ProductAttributeOptions` — shapes for select fields. |
| `Pagination.ts` | `Pagination`, `PageInfo`. |
| `tanstack-table.d.ts` | Ambient module augmentation extending TanStack Table's `ColumnMeta`. Declaration only — it exports nothing. |

## For AI Agents

### Working In This Directory
- These types are hand-maintained against `brandingku_go/graph/schema.graphqls`. They are not generated, so a backend schema change will not surface here until someone updates it by hand.
- Filenames are inconsistent — most use `*.type.ts`, but `LandingPage.ts` and `Pagination.ts` do not. Match the neighbouring file when adding to an existing area.
- `Client` is declared twice, in `client.type.ts` and `LandingPage.ts`, with different shapes. Check which one a consumer expects.
- Add custom column `meta` fields to `tanstack-table.d.ts`, otherwise TypeScript rejects them in the datatable column definitions.

### Testing Requirements
- `pnpm run build` — this directory is type-only, so the compiler is the entire check.

## Dependencies

### Internal
- Consumed by `services/`, `components/forms/`, `components/datatables/`, `composables/`
- Mirrors `brandingku_go/graph/schema.graphqls`

### External
- `@tanstack/vue-table` — the augmented module

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
