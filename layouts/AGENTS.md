<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# layouts

## Purpose
Nuxt layouts. Pages select one via `definePageMeta({ layout: ... })`; the auth screens opt out entirely with `layout: false`.

## Key Files

| File | Description |
|------|-------------|
| `default.vue` | Public storefront shell — the implicit layout when a page does not name one. |
| `page-layout.vue` | Alternative public shell used by content pages such as `pages/category/[slug].vue`. |
| `console-secret.vue` | Admin console shell — sidebar, top bar and content region. Every page under `pages/console/secret/` sets `layout: 'console-secret'`. |

## For AI Agents

### Working In This Directory
- Layout names come from the filename, so renaming a file here breaks every `definePageMeta` that references it.
- `console-secret.vue` composes `ElementsAppSidebar` and `ElementsAppTopBar`; console chrome changes usually belong in those components, not here.
- Authentication is enforced by `middleware/auth-console-secret.global.ts`, not by this layout. Choosing the layout does not protect a route.

### Testing Requirements
- `pnpm run build`.
- Check one page per layout in `pnpm run dev`.

## Dependencies

### Internal
- `components/elements/AppSidebar.vue`, `AppTopBar.vue`, `FooterConsole.vue`
- `middleware/auth-console-secret.global.ts`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
