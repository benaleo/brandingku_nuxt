<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-09 | Updated: 2026-09-09 -->

# console

## Purpose
Route-segment container for the whole `/console/**` back-office area of brandingku_nuxt. It holds no page files of its own — it exists purely as the Nuxt file-based-routing prefix that splits the admin surface into two halves: `auth/` (unauthenticated login, register, and password reset) and `secret/` (the authenticated admin CRUD console). Because there is no `index.vue` here, the bare URL `/console` is not a route at all and resolves to a 404; the real entry points are `/console/auth` and `/console/secret/dashboard`. The split is load-bearing: `middleware/auth-console-secret.global.ts` matches on the literal path prefixes `/console/secret` and `/console/auth` with `startsWith`, so the directory names here are what the global route guard keys off.

## Subdirectories
| Directory | Purpose |
| --- | --- |
| `auth/` | Public console entry: the login/register tab page and the three-step password-reset flow (request, verify, change). Reached by anonymous visitors; the global guard bounces authenticated visitors out of this subtree (see `auth/AGENTS.md`) |
| `secret/` | Authenticated admin console: `dashboard.vue` plus CRUD page trees for products, product categories (with nested sub-list), portfolio, inquiry, landing-page content (benefit/client/testimonial), privilege, and admin. Every page here opts into `layout: 'console-secret'` (see `secret/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Nothing in this tree is generated or vendored. All pages are hand-written Vue SFCs; Nuxt derives the routes from the directory layout at build time, so adding a file adds a route with no registration step.
- Do not add files directly to `pages/console/`. A new page belongs in `auth/` or `secret/` so it inherits the correct guard branch. A file placed at this level (e.g. `pages/console/foo.vue`) matches neither `startsWith('/console/secret')` nor `startsWith('/console/auth')` and would ship completely unguarded.
- Renaming either subdirectory silently disables access control. The guard in `middleware/auth-console-secret.global.ts` hardcodes the strings `/console/secret` and `/console/auth`, and hardcodes the redirect targets `/console/auth` and `/console/secret/dashboard`. Both targets must keep existing as `auth/index.vue` and `secret/dashboard.vue` or you get a redirect loop or a 404.
- The guard only base64-decodes the JWT `token` cookie and checks `decodedToken.role !== 'user'`; it never verifies the signature or expiry. Treat everything under `console/` as UX-level gating only — real authorization stays server-side (policy: client-side route guards are advisory, server-side authorization is authoritative).
- Layout selection is per-page, not per-directory. There is no layout inheritance hook at this level: every page under `secret/` declares `definePageMeta({ layout: 'console-secret' })` individually, the `auth/reset-password/*` pages declare `layout: false`, and `auth/index.vue` declares no meta at all so it falls through to `layouts/default.vue` (public Navbar/Footer). A new console page that forgets `definePageMeta` will render inside the public site chrome.
- No page under `console/` declares `middleware` in `definePageMeta`; all protection comes from the single `.global.ts` file. Do not add per-page middleware here expecting it to compose with the global guard without checking ordering.
- Sidebar and breadcrumb navigation is not derived from this directory. Both `components/elements/AppSidebar.vue` and `components/elements/AppBreadcrumb.vue` read `secretConsoleMenu` from `utils/list.menu.ts`, which holds hardcoded `href` strings. Adding a page under `secret/` does not make it reachable from the UI until you add a menu entry; the reverse drift already exists — `utils/list.menu.ts` links `/console/secret/landing-page/options`, for which no page directory exists.

### Testing Requirements
There is no test coverage for this directory and no test setup in the repository at all: the root `package.json` defines only `dev`, `build`, `build:cf`, `deploy:cf`, `generate`, `preview`, `start`, `postinstall`, `postgenerate`, `export:dist`, and `build:dist` — no `test` script, and no test runner (vitest/jest/playwright) in `dependencies` or `devDependencies`. Verify changes manually:
- Compile/type check with `pnpm run build`, or `pnpm run dev` for the fast loop (`postinstall` runs `nuxt prepare` to regenerate `.nuxt` types, including the route and layout types these pages depend on).
- Confirm route generation after any add/rename/move here, since routes come from filenames — check the URL actually resolves in `pnpm run dev` rather than assuming.
- Exercise both guard branches by hand, manipulating the `token` cookie in devtools: with no token, `/console/secret/dashboard` must land on `/console/auth`; with a `role: "user"` token it must land on `/`; with an admin token the page must render; and with any token present, `/console/auth` must redirect to `/console/secret/dashboard`.
- Check the guard fires on the initial server-rendered request as well as client-side navigation — it is global and runs in both environments.

### Common Patterns
- Directory name as security boundary: the public/private split is expressed by path prefix (`auth` vs `secret`) and matched with `startsWith`, not by named routes, route groups, or per-page metadata.
- Nuxt file-based routing throughout, with `index.vue` for list pages, `add.vue` for create, and `[id]/detail.vue` + `[id]/edit.vue` for per-record views — the convention is applied uniformly across the resource trees under `secret/`.
- No `index.vue` at container level: intermediate route segments (`console/`, and likewise `console/secret/`) are pure namespaces with no landing page.
- Explicit per-page `definePageMeta({ layout: ... })` rather than any directory-level layout convention.

## Dependencies

### Internal
- `middleware/auth-console-secret.global.ts` — the sole access-control guard for this whole tree; keys on the `/console/auth` and `/console/secret` path prefixes.
- `layouts/console-secret.vue` — admin chrome (`SidebarProvider` + `AppSidebar` + `AppTopBar` + `FooterConsole`) that every `secret/` page opts into; `layouts/default.vue` is what `auth/index.vue` falls back to.
- `utils/list.menu.ts` — `secretConsoleMenu`, the hardcoded href list that drives navigation into these routes.
- `components/elements/AppSidebar.vue`, `components/elements/AppBreadcrumb.vue`, `components/elements/AppTopBar.vue` — navigation and chrome components that consume those hrefs and the `token` cookie.
- `app.vue` — mounts `NuxtLayout`/`NuxtPage` and the global `Toaster` these pages report through.
- The `token` cookie contract shared with `composables/useAuth.ts`, `composables/useApiFetch.ts`, and `services/*.service.ts`.

### External
- `nuxt` (v4) — file-based routing is the only reason this directory exists; `definePageMeta`, `useHead`, `useCookie`, and `navigateTo` come from it.
- `vue` (v3) / `vue-router` (v4) — SFCs and the route object the guard and breadcrumb inspect.
- `shadcn-nuxt` + `reka-ui` — the `Ui*`-prefixed component library under `components/ui` used by the pages in both subtrees.
- No package is imported by this directory itself, since it contains no files.

<!-- MANUAL: Notes added below this line are preserved on regeneration -->
