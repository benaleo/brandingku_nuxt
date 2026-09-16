<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# layouts

## Purpose
Tabbed shells for the authentication screens. Distinct from the top-level `layouts/` directory — these are ordinary components, not Nuxt layouts.

## Key Files

| File | Description |
|------|-------------|
| `AuthLoginTabs.vue` | Tab shell around the login flow. |
| `AuthRegisterTabs.vue` | Tab shell around the registration flow. |

## For AI Agents

### Working In This Directory
- Do not confuse this with `/layouts` at the project root — Nuxt only treats the root-level directory as layouts. These are components auto-imported as `<LayoutsAuthLoginTabs>` and `<LayoutsAuthRegisterTabs>`.
- The auth pages that use these set `layout: false` in `definePageMeta`, so these components provide the entire page chrome.

### Testing Requirements
- `pnpm run build`; check `/console/auth` in `pnpm run dev`.

## Dependencies

### Internal
- `components/ui/tabs/`
- `components/forms/LoginForm.vue` and `RegisterForm.vue`
- `pages/console/auth/`

### External
- `reka-ui`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
