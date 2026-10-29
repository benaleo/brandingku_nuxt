<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-09 | Updated: 2026-09-09 -->

# auth

## Purpose
Public entry point to the brandingku_nuxt back-office. This directory owns the single URL `/console/auth`, whose `index.vue` renders a two-tab shell (LOGIN / REGISTER) that swaps between `components/layouts/AuthLoginTabs.vue` and `components/layouts/AuthRegisterTabs.vue`. Its sibling `reset-password/` holds the three-step forgotten-password flow that `components/forms/LoginForm.vue` links into. Everything under this path prefix is meant for anonymous visitors: `middleware/auth-console-secret.global.ts` matches `to.path.startsWith('/console/auth')` and bounces anyone carrying a `token` cookie away — to `/` for a `role: "user"` token, to `/console/secret/dashboard` otherwise — so `/console/auth` is only reachable while logged out.

## Key Files
| File | Description |
| --- | --- |
| `index.vue` | The `/console/auth` page: a `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` shell driven by an `activeTab` ref (default `'login'`) and a local `tabs` array whose entries carry the component object itself, rendered through `<component :is="val.element">`; also the redirect target the global guard sends unauthenticated `/console/secret/**` visitors to. |

## Subdirectories
| Directory | Purpose |
| --- | --- |
| `reset-password/` | Three-step forgotten-password flow — `index.vue` (request), `verify.vue`, `change-password.vue` — all declaring `definePageMeta({ layout: false })`, reached from the "Forgot your password? Reset it" link in `components/forms/LoginForm.vue` (see `reset-password/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Nothing here is generated or vendored; `index.vue` is a hand-written SFC and Nuxt derives the `/console/auth` route from the filename, so there is no route table to update.
- `index.vue` deliberately declares **no** `definePageMeta`, so it inherits `layouts/default.vue` (the public site chrome). This is the odd one out in the tree — the `reset-password/*` pages set `layout: false` and every `secret/` page sets `layout: 'console-secret'`. Do not "fix" this by adding meta without checking the rendered page; changing it alters the visible header/footer.
- This filename is load-bearing for access control. The global guard hardcodes `navigateTo('/console/auth')` as the redirect for unauthenticated `/console/secret/**` requests, so renaming or deleting `index.vue` turns every failed auth check into a 404.
- The guard treats *any* present `token` cookie as logged-in before it tries to decode it, and its `catch` branch for a malformed token still redirects to `/console/secret/dashboard`. A stale or corrupt cookie therefore makes this page unreachable; clear the cookie rather than editing the page when it appears to "not load".
- The tab switch is an event contract, not shared state: `AuthLoginTabs` and `AuthRegisterTabs` both `defineEmits(['switchTab'])` and fire it from their cross-link buttons, and `index.vue` listens with `@switch-tab="handleSwitchTab"`. If you rename the event, update both children and the listener — Vue's kebab/camel normalisation is the only reason the current spelling mismatch works.
- The `tabs` array stores imported component objects, so entries cannot be moved into a JSON/`utils` list without switching to `resolveComponent` or a static `<TabsContent>` per tab.
- Tab `value`s are the raw strings `'login'` / `'register'` and the trigger label is `trigger.name.toLocaleUpperCase()`, so renaming a tab changes both the internal value and the user-visible label at once.
- Credential handling lives in the children, not here: `index.vue` holds no form state, validation, or API call. Login/register logic belongs in `components/forms/LoginForm.vue` / `RegisterForm.vue`, which use `services/auth.service.ts`.

### Testing Requirements
No test coverage for this directory, and no test setup in the repository: `package.json` defines only `dev`, `build`, `build:cf`, `deploy:cf`, `generate`, `preview`, `start`, `postinstall`, `postgenerate`, `export:dist`, and `build:dist` — no `test` script and no test runner in the dependency lists. Verify by hand:
- `pnpm run dev` and open `/console/auth` with no `token` cookie; `pnpm run build` for a type/compile check (`postinstall` runs `nuxt prepare`).
- Click both tab triggers and both in-panel cross-link buttons ("Daftar" from login, "Masuk" from register) to confirm the `switchTab` round trip still drives `activeTab`.
- Re-check the guard interaction after any change: with a `token` cookie set, `/console/auth` must redirect out (dashboard for an admin token, `/` for a `role: "user"` token); with the cookie cleared, the page must render.
- Confirm the "Reset it" link in the login form still resolves to `/console/auth/reset-password`.

### Common Patterns
- Container page + presentational children: the page owns only `activeTab` and a switch handler; markup and forms are delegated to `components/layouts/Auth*Tabs.vue`.
- Data-driven tabs — one `v-for` over `tabs` for the triggers and another for the contents, keyed by `index` and `val.id` respectively, with per-`id` corner-rounding classes applied conditionally.
- shadcn-style imports: `@/components/ui/tabs` for the UI primitives, `~/components/...` for app components; both aliases are used side by side in the same file.
- Tailwind utility-only styling with no `<style>` block, including arbitrary values (`pt-[20vh]`, `md:max-w-3/4`).

## Dependencies

### Internal
- `components/ui/tabs/` — `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` (shadcn/reka-ui wrappers).
- `components/layouts/AuthLoginTabs.vue`, `components/layouts/AuthRegisterTabs.vue` — the two tab panels, and the source of the `switchTab` event.
- `components/forms/LoginForm.vue`, `components/forms/RegisterForm.vue` — rendered transitively by those panels; the login form also owns the link into `reset-password/`.
- `middleware/auth-console-secret.global.ts` — the guard that both protects and redirects to this route.
- `layouts/default.vue` — the layout `index.vue` falls through to.
- `services/auth.service.ts` and the `token` cookie contract, used by the child forms rather than by this page directly.

### External
- `nuxt` (v4) — file-based routing for the `/console/auth` route.
- `vue` (v3) — `<script setup>`, `ref`, `<component :is>`.
- `reka-ui` + `shadcn-nuxt` — the underlying tab primitives.
- `tailwindcss` (v4) — all styling in `index.vue`.

<!-- MANUAL: Notes added below this line are preserved on regeneration -->
