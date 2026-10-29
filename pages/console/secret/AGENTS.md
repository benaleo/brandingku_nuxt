<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# secret

## Purpose
The admin console. Everything under this path is the authenticated back office — datatable listings plus add/edit/detail forms for each entity. The `secret` segment is obscurity, not security; the real gate is the global auth middleware.

## Key Files

| File | Description |
|------|-------------|
| `dashboard.vue` | `/console/secret/dashboard` (23 lines) — the console landing page. Currently logs the token to the console (`console.log("token in dashboard ", token.value)`); remove that before shipping. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `admin/` | Admin user management (see `admin/AGENTS.md`). |
| `privilege/` | Role and privilege management (see `privilege/AGENTS.md`). |
| `products/` | Product CRUD (see `products/AGENTS.md`). |
| `product-categories/` | Category CRUD, including the sub-category tree (see `product-categories/AGENTS.md`). |
| `portfolio/` | Portfolio CRUD (see `portfolio/AGENTS.md`). |
| `inquiry/` | Incoming contact submissions, read-only (see `inquiry/AGENTS.md`). |
| `landing-page/` | Landing-page content: benefits, clients, testimonials (see `landing-page/AGENTS.md`). |
| `example/` | A reference implementation of the console page pattern (see `example/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- Access is enforced globally by `middleware/auth-console-secret.global.ts`, not per page. Do not add a local auth middleware here and do not assume a page is unprotected because it declares none.
- Add a route here and it will not appear in the sidebar until you add it to `secretConsoleMenu` in `utils/list.menu.ts`.
- `dashboard.vue` logging the auth token is a real leak into the browser console — fix it rather than copying the pattern.

### Testing Requirements
- Sign in as an admin and exercise the route in `pnpm run dev`.
- `pnpm run build` for template/type errors.

### Common Patterns
- Listing pages compose `AppBreadcrumb` + `AppTableHeader` + `AppFilterTable`, with columns imported from `components/datatables/`.
- add/edit/detail are thin: `AppTableHeader` plus the entity's form component. All three render the same form.
- The add/edit/detail trio all render the same form component. The form decides create-vs-update from the route via `getPathWithoutIdInForm()` / `getIdFromPath()` in `utils/global.utils.ts`, so renaming a segment here silently changes form behaviour without any type error.

## Dependencies

### Internal
- `layouts/console-secret.vue`
- `middleware/auth-console-secret.global.ts`
- `utils/list.menu.ts`
- `components/datatables/`, `components/forms/`, `components/elements/`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
