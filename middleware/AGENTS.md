<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-09 | Updated: 2026-09-09 -->

# middleware

## Purpose
Nuxt route middleware directory for brandingku_nuxt. It holds the client/server route guards that Nuxt auto-registers from `middleware/` by file convention. Today it contains exactly one file — a `.global.ts` guard that protects the admin console (`/console/secret/**`) and bounces already-authenticated users away from the login area (`/console/auth/**`). Because the only file is global, no page in `pages/` needs to opt in via `definePageMeta({ middleware })`, and in fact no page in the repo does — all console access control funnels through this single directory.

## Key Files
| File | Description |
| --- | --- |
| `auth-console-secret.global.ts` | Global route guard: reads the `token` cookie, base64-decodes the JWT payload inline, redirects anonymous visitors of `/console/secret/**` to `/console/auth`, sends `role === 'user'` to `/`, and redirects logged-in visitors of `/console/auth/**` to `/console/secret/dashboard` (or `/` for the `user` role). Every decode failure falls back to a redirect, never to an open page. |

## For AI Agents

### Working In This Directory
- Nothing here is generated; the file is hand-written TypeScript. There is no regeneration command and no vendored code.
- File naming is load-bearing. The `.global.ts` suffix is what makes Nuxt run the guard on every route change. Renaming it to `auth-console-secret.ts` silently turns it into an opt-in middleware that never executes, because no page declares it in `definePageMeta`. If you add a non-global middleware here, you must also reference it by its kebab-case filename from the consuming page.
- Order matters if a second global middleware is added: Nuxt executes global middleware in alphabetical filename order. Prefix with a numeric segment (e.g. `01.`) if you need deterministic sequencing.
- The guard runs on both server and client. Keep it free of browser-only APIs beyond what already works in the Nitro runtime — the existing code relies on the global `atob`, which is available in the Node/Workers targets this project builds for (`nitro.preset` defaults to `node-server`; Cloudflare presets are used for deploys). `composables/useWishlist.ts` guards `atob` with a `typeof globalThis.atob === 'function'` check; this middleware does not, so do not assume that guard exists here.
- The JWT payload is decoded, not verified. There is no signature check and no `exp` check in this file, so a client can forge a payload and pass the role test. Treat this as a UX-level redirect only; real authorization must stay on the API side. Any new rule added here inherits the same weakness — do not move a genuine security decision into this directory (policy: client-side route guards are advisory, server-side authorization is authoritative).
- `utils/token.helper.ts` already exports `decodeToken()`, `isTokenExpired()`, and the `DecodedToken` interface, which cover exactly what this file re-implements by hand (split on `.`, length-3 check, `atob`, `JSON.parse`). Prefer reusing those helpers over duplicating the logic when editing; note that the current file also does not call `isTokenExpired`, so an expired token still satisfies the guard.
- Imports here are explicit (`import { defineNuxtRouteMiddleware, useCookie, navigateTo } from 'nuxt/app'`) rather than relying on Nuxt auto-imports. Keep that style in this file for consistency, or convert the whole file at once.
- The cookie name `token` is shared with `composables/useAuth.ts`, `composables/useApiFetch.ts`, `components/forms/LoginForm.vue`, `components/elements/AppTopBar.vue`, `services/product.service.ts`, and `pages/console/secret/dashboard.vue`. Renaming it breaks all of them. Also be aware `useAuth.ts` writes the cookie with `{ sameSite: 'lax' }` while this middleware reads it with bare `useCookie('token')`; match option shapes if you ever need write access here.
- Redirect targets are hardcoded strings. `/console/auth` and `/console/secret/dashboard` both exist as `pages/console/auth/index.vue` and `pages/console/secret/dashboard.vue`; verify any new target actually exists in `pages/` before shipping, since a bad `navigateTo` produces a redirect loop or a 404.

### Testing Requirements
There is no test coverage for this directory, and no test setup in the repository at all — the root `package.json` defines only `dev`, `build`, `build:cf`, `deploy:cf`, `generate`, `preview`, `start`, `postinstall`, `postgenerate`, `export:dist`, and `build:dist`, with no `test` script and no test runner (vitest/jest/playwright) in `dependencies` or `devDependencies`. Verify changes manually:
- Type/compile check via the build: `pnpm run build` (or `pnpm run dev` for the fast loop). `postinstall` runs `nuxt prepare`, which regenerates the `.nuxt` types the middleware imports rely on.
- Behavioural check in `pnpm run dev`, exercising all four branches: visit `/console/secret/dashboard` with no `token` cookie (expect `/console/auth`), with a `role: "user"` token (expect `/`), with an admin-role token (expect the page to render), and visit `/console/auth` while holding a token (expect `/console/secret/dashboard`). Manipulate the `token` cookie in devtools to drive each case.
- Confirm the guard also fires on the initial server-rendered request, not just client-side navigation, since it is global and runs in both environments.

### Common Patterns
- One concern per file, expressed as a single `defineNuxtRouteMiddleware((to) => …)` default export that inspects `to.path` with `startsWith` prefix matching rather than named-route or regex matching.
- Fail-closed error handling: every `try`/`catch` and every malformed-token branch returns a `navigateTo(...)` redirect instead of falling through, so a broken token can never leave a protected route unguarded.
- Defensive step-by-step token parsing — check segment count, check the payload segment is present, then decode — instead of trusting the JWT shape.
- Role checks are written as a denylist for the `'user'` role rather than an allowlist of admin roles, so any unrecognised or absent role value is treated as privileged. Keep this in mind when adding roles.
- Redirects are returned, never awaited or called for side effects, matching Nuxt's middleware contract.

## Dependencies

### Internal
- `pages/console/secret/**` and `pages/console/auth/**` — the route trees this guard protects and redirects between; `pages/console/secret/dashboard.vue` and `pages/console/auth/index.vue` are the concrete redirect targets.
- The `token` cookie contract shared with `composables/useAuth.ts` (writer), `composables/useApiFetch.ts`, `components/forms/LoginForm.vue`, `components/elements/AppTopBar.vue`, and `services/product.service.ts` (readers).
- `utils/token.helper.ts` — not currently imported, but the canonical home for the JWT decode/expiry logic this file duplicates.

### External
- `nuxt` (v4) — `defineNuxtRouteMiddleware`, `useCookie`, and `navigateTo` imported from `nuxt/app`; the directory itself exists only because of Nuxt's `middleware/` convention.
- `vue-router` (v4, transitively via Nuxt) — supplies the route object whose `path` the guard matches on.
- No other third-party package is used by files here; the JWT handling is plain `atob` + `JSON.parse` with no JWT library.

<!-- MANUAL: Notes added below this line are preserved on regeneration -->
