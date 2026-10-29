<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# services

## Purpose
One `use*Service` composable per backend entity, each wrapping that entity's GraphQL documents. This is the layer between the generic `useGql` helper and the forms and pages that perform CRUD.

## Key Files

| File | Description |
|------|-------------|
| `auth.service.ts` | Exports `useAuthService` — login, registration and token exchange. |
| `product.service.ts` | Exports `useProductService`. |
| `product-category.service.ts` | Exports `useProductCategoryService`, including the parent/child category tree. |
| `product-additional.service.ts` | Exports `useProductAdditionalService`. |
| `product-galleries.service.ts` | Exports `useProductGalleriesService`. |
| `portfolio.service.ts` | Exports `usePortfolioService`. |
| `portfolio-gallery.service.ts` | Exports `usePortfolioGalleryService`. |
| `benefit.service.ts` | Exports `useBenefitService`. |
| `client.service.ts` | Exports `useClientService`. |
| `testimonial.service.ts` | Exports `useTestimonialService`. |
| `web-contact.service.ts` | Exports `useWebContactService` — the public contact/inquiry submission. |
| `landing-page.service.ts` | The one module that breaks the single-export pattern: exports the `SubCategory` and `ProductCategoryBySlug` interfaces plus two composables, `useLandingFeaturedCategories` and `useGetProductCategoryBySlug`. |

## For AI Agents

### Working In This Directory
- This directory is not in Nuxt's auto-import set the way `composables/` is — import these explicitly.
- Every service goes through `useGql`. Do not call `$fetch('/api/gql')` directly from a service.
- Request and response types belong in `types/`, not inline in the service, so forms and tables can share them.
- Naming is `<entity>.service.ts` exporting `use<Entity>Service`. `landing-page.service.ts` is the deliberate exception.

### Testing Requirements
- `pnpm run build` for type errors.
- Verify against a running backend — schema drift shows up at runtime, not at build.

## Dependencies

### Internal
- `composables/useGql.ts`
- `types/` for entity and request shapes
- Called by `components/forms/` and the console pages

### External
- `graphql-request`, `graphql`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
