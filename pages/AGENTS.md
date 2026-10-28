<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# pages

## Purpose
File-based routes. Nuxt derives every URL from this tree, so a filename here is a public URL. Three distinct areas live side by side: the public storefront at the root, the auth screens under `console/auth/`, and the admin console under `console/secret/`.

## Key Files

| File | Description |
|------|-------------|
| `index.vue` | `/` — the landing page. |
| `kontak.vue` | `/kontak` — contact page with the inquiry form. Copy lives under `app.contactPage`; the submitted subject stays in English. |
| `tentang.vue` | `/tentang` — about page. Copy and head title live under `app.aboutPage`. |
| `tnc.vue` | `/tnc` — terms and conditions. Copy and head title live under `app.tncPage`. |
| `portfolio/index.vue` | `/portfolio` — active portfolios from `getPortfolios` (first page server-rendered, more pages appended), category chips built from the loaded items, gallery viewer in `ElementsInsetSheet`. Copy under `app.portfolioPage`. |
| `portfolio/[slug].vue` | `/portfolio/:slug` — one active portfolio via the public `getPublicPortfolio(slug)` query (server-rendered), plus `ElementsPortfolioCarousel` for related work. The backend generates the slug from the title. Copy under `app.portfolioDetail`. |
| `services.vue` | `/services` — the five services from the navbar menu; section ids are the navbar anchors. Copy under `app.servicesPage`, titles reuse `app.services.menu`. |
| `wishlist.vue` | `/wishlist` — the saved-products view, backed by `useWishlist`. Copy lives under `app.wishlistPage`. |
| `notifications.vue` | `/notifications` — the signed-in account's notifications (running quotations on top, then the rest); phones reach it from the header bell, larger screens get the same list as a dropdown. State comes from `useNotifications`; copy lives under `app.notifications`. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `category/` | Public category browsing (see `category/AGENTS.md`). |
| `product/` | Public product listing and detail (see `product/AGENTS.md`). |
| `profile/` | Signed-in user profile and order history (see `profile/AGENTS.md`). |
| `test/` | Scratch pages, not production routes (see `test/AGENTS.md`). |
| `console/` | Auth screens and the admin console (see `console/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Public page copy is translated: put user-facing text in `i18n/locales/app/{id,en}.json` and render it with `$t` (names and brand terms can stay literal). Escape `@` as `{'@'}` in messages.
- Adding a file here publishes a route. There is no route allow-list to update and nothing warns you — check whether the page should be public before creating it.
- Public pages use `default` or `page-layout`; console pages must set `console-secret`. Auth pages opt out with `layout: false`.
- Route names are Indonesian (`kontak`, `tentang`) while component and variable names are English. Keep new public routes Indonesian to match the existing URLs.
- `.omc/` currently sits inside this directory. It is orchestration state accidentally written here, not a route — Nuxt ignores dot-directories, so it is harmless but should be removed.

### Testing Requirements
- `pnpm run build` catches template and type errors.
- Walk the route in `pnpm run dev`; there are no route tests.

### Common Patterns
- `definePageMeta({ layout, middleware })` at the top of `<script setup>`, then `useHead({ title, meta })` for SEO.
- Most pages hold no data logic of their own — they compose an `Elements*` header with a `Forms*` or datatable component.

## Dependencies

### Internal
- `layouts/`
- `components/elements/`, `components/forms/`, `components/datatables/`
- `services/`, `composables/`

### External
- Nuxt file-based routing, `vue-router`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
