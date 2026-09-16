<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# forms

## Purpose
One form component per entity, built with vee-validate + zod on top of the `FieldX*` wrappers in `fields/`. These are the write path for the admin console.

## Key Files

| File | Description |
|------|-------------|
| `LoginForm.vue` | Console sign-in. |
| `RegisterForm.vue` | Account registration. |
| `AvatarUploadForm.vue` | Avatar upload for the user profile. |
| `BenefitForm.vue` | Create/edit a landing-page benefit. |
| `ClientForm.vue` | Create/edit a client entry. |
| `TestimonialForm.vue` | Create/edit a testimonial. |
| `PortfolioForm.vue` | Create/edit a portfolio item. |
| `PortfolioGalleryForm.vue` | Manage a portfolio item's gallery images. |
| `ProductForm.vue` | Create/edit a product. |
| `ProductAdditionalForm.vue` | Product additional-information entries. |
| `ProductAttributeForm.vue` | Product attribute editor. |
| `ProductGalleryForm.vue` | Product gallery images. |
| `ProductCategoryForm.vue` | Create/edit a product category, including the parent/child relationship. |
| `InquiryDetailForm.vue` | Inquiry detail view and status handling. |
| `ImageSingleUploadField.vue` | Single-image upload field. |
| `ImageSingleFormDialog.vue` | Dialog wrapper around the single-image field. |
| `ImageBulkUploadField.vue` | Multi-image upload field. |
| `ImageBulkFormDialog.vue` | Dialog wrapper around the bulk-image field. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `fields/` | `FieldX*` input wrappers shared by every form here (see `fields/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Build fields from the `FieldX*` wrappers rather than raw `Ui*` form primitives — the wrappers already bind vee-validate state and error display.
- Validation schemas are zod via `@vee-validate/zod`. Keep the schema next to the form it validates.
- Image fields hand base64 payloads to the backend, which converts them through `graph/helpers/file_helper.go` and `cloud_storage.go` — see `composables/useFileToBase64.ts`.
- Submission goes through a `use*Service` composable from `services/`, never a bare fetch.

### Testing Requirements
- `pnpm run build` for type errors.
- Submit each form against a running backend; there is no automated form test.

## Dependencies

### Internal
- `components/forms/fields/`
- `services/` for mutations
- `types/` for request shapes
- `composables/useFileToBase64.ts`

### External
- `@vee-validate/zod`, `reka-ui`, `@vueup/vue-quill`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
