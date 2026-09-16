<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# components

## Purpose
Vue components. Nuxt auto-imports this tree, with `ui/**` explicitly excluded in `nuxt.config.ts` — that subtree is vendored shadcn-vue and is reached through the `Ui` prefix instead. The files directly in this directory are the storefront's landing-page sections and chrome.

## Key Files

| File | Description |
|------|-------------|
| `Hero.vue` | Landing page hero section. |
| `Navbar.vue` | Primary site navigation. |
| `Footer.vue` | Public site footer. |
| `FooterConsole.vue` | Footer variant used inside the admin console. |
| `BannerCTA.vue` | Call-to-action banner block. |
| `FeaturedCategories.vue` | Landing block listing highlighted product categories. |
| `FeaturesBenefitFaq.vue` | Combined benefits and FAQ section. |
| `FeaturesClient.vue` | Client logos / social proof section. |
| `FeaturesProduct.vue` | Product highlights section. |
| `FeaturesServices.vue` | Services overview section. |
| `FeaturesTestimonial.vue` | Testimonial carousel section. |
| `HeaderProduct.vue` | Header used on product listing and detail pages. |
| `Promotions.vue` | Promotional content block. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `atoms/` | Smallest shared building blocks (see `atoms/AGENTS.md`). |
| `datatables/` | TanStack table wrapper and per-entity column definitions (see `datatables/AGENTS.md`). |
| `elements/` | Composite console and storefront widgets (see `elements/AGENTS.md`). |
| `forms/` | vee-validate entity forms (see `forms/AGENTS.md`). |
| `layouts/` | Auth tab shells (see `layouts/AGENTS.md`). |
| `skeletons/` | Loading placeholders (see `skeletons/AGENTS.md`). |
| `ui/` | Vendored shadcn-vue primitives (see `ui/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Components here are auto-imported by path-derived name — `elements/AppSidebar.vue` becomes `<ElementsAppSidebar>`. Renaming a file renames the tag.
- Do not add first-party components under `ui/`; that directory is treated as vendored and gets overwritten by the shadcn CLI.
- Compose from `Ui*` primitives rather than restyling raw HTML, so colour-mode tokens keep working.

### Testing Requirements
- `pnpm run build` catches template and type errors.
- Visual verification through `pnpm run dev`.

## Dependencies

### Internal
- `composables/` and `services/` for data
- `lib/utils.ts` for `cn()`
- `types/` for entity shapes

### External
- `reka-ui`, `lucide-vue-next`, `@vueuse/core`, `@formkit/auto-animate`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
