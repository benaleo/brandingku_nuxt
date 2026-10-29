<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# test

## Purpose
Scratch pages used during development to exercise single features in isolation. Not part of the product.

## Key Files

| File | Description |
|------|-------------|
| `show-user.vue` | `/test/show-user` (35 lines) — dumps the resolved user. |
| `upload-avatar.vue` | `/test/upload-avatar` (38 lines) — exercises the image upload path. |

## For AI Agents

### Working In This Directory
- These are live public routes in every deployment, with no auth and no `robots` exclusion. Treat them as shipped surface: do not print tokens, secrets or other users' data here.
- Nothing in the app links to them. Deleting the directory is safe if the scratch work is done.

### Testing Requirements
- Manual only.

## Dependencies

### Internal
- `composables/useAuth.ts`
- `composables/useFileToBase64.ts`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
