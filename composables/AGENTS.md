<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# composables

## Purpose
Auto-imported composables covering data fetching against the GraphQL API, auth state, and a few browser utilities. These sit above `services/` and are what pages and components call directly.

## Key Files

| File | Description |
|------|-------------|
| `useGql.ts` | Exports `useGql` — the shared GraphQL request helper. Every other data composable goes through it. |
| `useApiFetch.ts` | Exports the `ApiResponse` and `PaginatedResponse` interfaces plus `useApiFetch`, the generic fetch wrapper. |
| `useAuth.ts` | Exports `useAuth` — sign-in state, token handling and the current user. |
| `useResetPassword.ts` | Exports `useResetPassword`, driving the multi-step reset flow. |
| `useUserProfile.ts` | Exports `useUserProfile`. |
| `useProductList.ts` | Exports `useProductList` — paginated product listing. |
| `useProductDetail.ts` | Exports the `ProductDetail` type and `useProductDetail`. |
| `useFeaturedProduct.ts` | Exports the `FeaturedProductItem` type and `useFeaturedProduct`. |
| `useGetProductsWithCategorySlug.ts` | Exports `ProductWithCategory`, `PageInfo`, `ProductsWithCategoryResponse` and `useGetProductsWithCategorySlug` for category-filtered listings. |
| `useOptionProductCategories.ts` | Exports the `ProductCategoryOption` type and `useOptionProductCategories`, used to populate select fields. |
| `useWishlist.ts` | Exports the `WishlistProduct` and `WishlistItem` types and `useWishlist`. |
| `useDeleteCloudFile.ts` | Exports `useDeleteCloudFile` — removes an object from the S3-compatible store. |
| `useFileToBase64.ts` | Exports `useFileToBase64`, the conversion the image upload fields rely on. |
| `useIntersectionObserver.ts` | Exports `useIntersectionObserver` for viewport-triggered behaviour. |

## For AI Agents

### Working In This Directory
- These are auto-imported. Do not write an explicit import for them, and keep one composable per file named after the file.
- Route GraphQL through `useGql` rather than calling `$fetch` or Apollo directly — it centralizes the endpoint and error shape.
- `useApiFetch` defines the `ApiResponse`/`PaginatedResponse` contract; new paginated endpoints should reuse those types instead of redeclaring them.
- Composables run on both server and client during SSR. Guard anything touching `window`, `localStorage` or `document`.

### Testing Requirements
- `pnpm run build` for type errors.
- Exercise against a running `brandingku_go` backend; no mocks or tests exist.

## Dependencies

### Internal
- `services/` for entity-specific operations
- `utils/token.helper.ts` for token decoding
- `types/` for shared shapes

### External
- `graphql-request`, `@apollo/client`, `@vueuse/core`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
