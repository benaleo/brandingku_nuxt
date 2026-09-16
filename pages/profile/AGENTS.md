<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# profile

## Purpose
Signed-in user area: the profile page addressed by uuid, and the order-history view.

## Key Files

| File | Description |
|------|-------------|
| `[uuid].vue` | `/profile/:uuid` (316 lines) — profile detail and editing, via `useUserProfile`. |
| `order-histories.vue` | `/profile/order-histories` (405 lines) — the user's past orders. |

## For AI Agents

### Working In This Directory
- The route key is a uuid, not a numeric id. `getSecureIdFromToken()` in `utils/token.helper.ts` is how the app gets the current user's uuid — do not read it from user input.
- Neither page declares its own auth middleware, and the global console middleware only covers `console/secret`. Confirm the backend rejects a mismatched uuid rather than relying on the URL being unguessable.

### Testing Requirements
- Sign in and visit both routes in `pnpm run dev`.
- Try another user's uuid and confirm the backend refuses it.

## Dependencies

### Internal
- `composables/useUserProfile.ts`, `useAuth.ts`
- `utils/token.helper.ts`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
