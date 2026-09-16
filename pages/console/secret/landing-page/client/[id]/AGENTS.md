<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# [id]

## Purpose
Edit and detail routes for one client entry. Both are 12-line files rendering `ClientForm`.

## Key Files

| File | Description |
|------|-------------|
| `edit.vue` | Edit route. `AppTableHeader` with a literal title plus `ClientForm`. |
| `detail.vue` | Read-only route rendering the same `ClientForm`. |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- The add/edit/detail trio all render the same form component. The form decides create-vs-update from the route via `getPathWithoutIdInForm()` / `getIdFromPath()` in `utils/global.utils.ts`, so renaming a segment here silently changes form behaviour without any type error.
- The form resolves create-vs-edit-vs-detail from the path, so these files carry no logic. Keep them that way — behaviour belongs in `ClientForm`.

### Testing Requirements
- Open both routes for a real id.

## Dependencies

### Internal
- `components/forms/ClientForm.vue`
- `utils/global.utils.ts`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
