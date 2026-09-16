<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# utils

## Purpose
Auto-imported application helpers: JWT decoding, the console navigation tree, and small path utilities. Distinct from `lib/`, which holds only the shadcn `cn()` helper.

## Key Files

| File | Description |
|------|-------------|
| `token.helper.ts` | Exports the `DecodedToken` interface, `decodeToken`, `isTokenExpired` and `getSecureIdFromToken`. This is client-side decoding for UI decisions only — the backend re-validates every token. |
| `list.menu.ts` | Exports the `MenuItem` and `MenuGroup` interfaces and `secretConsoleMenu`, the data that drives the admin sidebar. |
| `global.utils.ts` | Exports `getPathWithoutIdInForm()` and `getIdFromPath()` — route-path helpers used by the add/edit/detail console pages. |

## For AI Agents

### Working In This Directory
- Auto-imported by Nuxt: reference these exports directly, without an import statement.
- `decodeToken` and `isTokenExpired` read the payload without verifying the signature. Never treat their output as an authorization decision — that belongs to `middleware/auth-console-secret.global.ts` and, authoritatively, to the backend.
- Add a console route by extending `secretConsoleMenu` here rather than editing `AppSidebar.vue`.
- `getIdFromPath()` is how the `[id]` console pages recover the entity id; changing the route shape under `pages/console/secret/` can break it silently.

### Testing Requirements
- `pnpm run build`.
- Verify sidebar entries and the add/edit/detail routes in `pnpm run dev`.

## Dependencies

### Internal
- `components/elements/AppSidebar.vue` consumes `secretConsoleMenu`
- `middleware/auth-console-secret.global.ts` uses the token helpers

### External

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
