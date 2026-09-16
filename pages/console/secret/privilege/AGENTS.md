<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# privilege

## Purpose
Role and privilege management. Like `admin/`, this is currently a stub.

## Key Files

| File | Description |
|------|-------------|
| `index.vue` | `/console/secret/privilege` (16 lines). Header and layout only; empty template. |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- Placeholder. Nothing here enforces anything today — authorization lives in the backend's `RequireAdminOrSuperAdmin` and the auth directive.
- If this grows into real role editing, treat it as security-critical: the UI must never be the only thing deciding who can escalate a role.

### Testing Requirements
- Manual, once implemented.

## Dependencies

### Internal
- Backend: `graph/auth.go` — `RequireAdminOrSuperAdmin`, `ValidateUserAuthorization`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
