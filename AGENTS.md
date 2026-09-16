<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# brandingku_nuxt

## Purpose
Nuxt 4 frontend for Brandingku: a public storefront plus an admin console mounted under `/console/secret`. Tailwind CSS v4 through the Vite plugin, shadcn-vue components under the `Ui` prefix, GraphQL against the `brandingku_go` backend (via a server-side proxy and Apollo) as the sole data source, Cloudflare R2 for public read-only asset delivery, and deployment to Cloudflare through NuxtHub. Package manager is pnpm.

## Key Files

| File | Description |
|------|-------------|
| `nuxt.config.ts` | Compatibility date `2026-02-22`. Loads `@nuxthub/core` only when `NITRO_PRESET` is one of the cloudflare presets. Registers `components/` for auto-import but ignores `ui/**`, and a custom `components:dirs` hook restricts the `components/ui` tree to `.vue` so the `index.ts` barrels are not auto-registered. shadcn prefix is `Ui`. colorMode prefers `system`, falls back to `light`, stored in localStorage. `runtimeConfig.public` exposes `BASE_URL`, `API_URL`, `STORAGE_URL` and `graphqlPath` (default `/query`). |
| `package.json` | Scripts: `dev`, `build`, `generate`, `preview`, `start`; `build:cf` sets `NITRO_PRESET=cloudflare_durable`; `deploy:cf` runs `build:cf` then `wrangler deploy`; `build:dist`/`export:dist` produce a static `dist/` via `nuxt generate`. |
| `components.json` | shadcn-vue config: style `new-york`, base colour `neutral`, CSS variables on, `ui` alias `@/components/ui`, `utils` alias `@/lib/utils`. |
| `wrangler.jsonc` | Cloudflare Worker configuration. Tracked in git, so `vars` must hold only public values. **The Supabase S3 keys (`SUPABASE_ACCESS_KEY`, `SUPABASE_SECRET_ACCESS_KEY`) were previously committed here and still exist in pushed git history (`e443b04` on `origin/dev`); removing them from the working tree does not purge history — they must be revoked at the provider.** Real secrets belong in `wrangler secret put` or CI environment variables, never in `vars`. |
| `tailwind.config.js` | Tailwind configuration referenced by `components.json`. |
| `tsconfig.json` | Extends the Nuxt-generated TypeScript config. |
| `app.vue` | Root component. |
| `firebase.json / .firebaserc` | Firebase Hosting configuration from an earlier deployment target; the live pipeline is NuxtHub/Cloudflare. |
| `.env.example` | Environment template. `.env`, `.env.preview` and `.env.production` are gitignored. |
| `pnpm-lock.yaml` | Lockfile. A stray `pnpm-lock.yaml.2828140638` sits beside it and can be deleted. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `assets/` | Tailwind entry stylesheet (see `assets/AGENTS.md`). |
| `components/` | Vue components, auto-imported except the vendored `ui/` tree (see `components/AGENTS.md`). |
| `composables/` | Data-fetching and stateful composables (see `composables/AGENTS.md`). |
| `layouts/` | Nuxt layouts (see `layouts/AGENTS.md`). |
| `lib/` | The shadcn `cn()` utility (see `lib/AGENTS.md`). |
| `middleware/` | Global route guard for the admin console (see `middleware/AGENTS.md`). |
| `pages/` | File-based routes (see `pages/AGENTS.md`). |
| `plugins/` | Client-only Nuxt plugins (see `plugins/AGENTS.md`). |
| `public/` | Static assets served verbatim (see `public/AGENTS.md`). |
| `server/` | Nitro server routes (see `server/AGENTS.md`). |
| `services/` | Per-entity GraphQL service composables (see `services/AGENTS.md`). |
| `types/` | Shared TypeScript types (see `types/AGENTS.md`). |
| `utils/` | Auto-imported helpers: token decoding, menu definitions, path helpers (see `utils/AGENTS.md`). |
| `.github/` | CI workflows (see `.github/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Use pnpm. The lockfile is `pnpm-lock.yaml` and CI installs with `--frozen-lockfile`.
- `components/ui/**` is vendored shadcn-vue. Re-running the shadcn CLI overwrites it wholesale, so hand-edit and diff rather than re-adding.
- Files under `components/` (excluding `ui/`), `composables/` and `utils/` are auto-imported — do not add manual imports for them.
- Anything under `runtimeConfig.public` reaches the browser. `apiSecret` is the only server-side key and must stay out of `public`.
- GraphQL from the client goes through `/api/gql` (see `server/api/AGENTS.md`), not directly to the backend origin.
- **No direct data access.** This frontend has no database client and no object-storage credentials. Every read and write goes through the `brandingku_go` GraphQL API. Do not reintroduce a DB SDK, a storage SDK, or signed-credential endpoints here — if the browser needs something, add it to the backend API instead.
- Object storage is Cloudflare R2. The browser only ever reads from the public custom domain in `NUXT_PUBLIC_STORAGE_URL`; uploads are base64 through the GraphQL API and are written server-side. The backend returns path-only values like `/folder/file.png`, so concatenate as `${STORAGE_URL}${path}` with no slash between them.

### Testing Requirements
- There is no test suite in this repo.
- `pnpm run build` is the correctness gate; `pnpm run build:cf` verifies the Cloudflare target specifically.
- `pnpm run dev` for interactive checks.

### Common Patterns
- Forms use vee-validate with zod resolvers and the `FieldX*` wrappers in `components/forms/fields/`.
- Admin tables use TanStack `@tanstack/vue-table` with column definitions kept in `components/datatables/`.
- Entity CRUD is reached through the `use*Service` composables in `services/`, which wrap the GraphQL documents.

## Dependencies

### External
- `nuxt` 4, `@nuxthub/core`, `@nuxtjs/apollo`, `@apollo/client`, `graphql-request`
- `shadcn-nuxt` + `reka-ui` — component primitives; `class-variance-authority`, `clsx`, `tailwind-merge`
- `@tailwindcss/vite` (Tailwind v4), `@nuxtjs/color-mode`, `@nuxt/image`, `@nuxt/icon`
- `@tanstack/vue-table`, `@vee-validate/zod`, `@vueup/vue-quill`, `@vueuse/core`, `embla-carousel-vue`, `lucide-vue-next`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
