<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# plugins

## Purpose
Nuxt plugins. All three are `.client.ts`, so they run only in the browser and are excluded from the server bundle.

## Key Files

| File | Description |
|------|-------------|
| `quill.client.ts` | Registers `@vueup/vue-quill`, which touches the DOM at import time and cannot be server-rendered. |
| `apollo-dev-messages.client.ts` | Enables Apollo Client's verbose development error messages. |

## For AI Agents

### Working In This Directory
- The `.client` suffix is load-bearing. Dropping it makes these run during SSR, where Quill fails.
- Plugins run once per app instance before the first route renders — keep the work here to registration, not data fetching.

### Testing Requirements
- `pnpm run build` then `pnpm run preview` — an SSR-unsafe plugin fails at render, not at build.

## Dependencies

### Internal
- `components/forms/fields/FieldXVueEditor.vue` depends on the Quill plugin

### External
- `@vueup/vue-quill`, `@apollo/client`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
