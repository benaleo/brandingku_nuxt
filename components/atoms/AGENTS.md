<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# atoms

## Purpose
The smallest reusable presentational pieces — one concern each, no data fetching.

## Key Files

| File | Description |
|------|-------------|
| `DarkMode.vue` | Colour-mode toggle driving `@nuxtjs/color-mode`. |
| `FormButton.vue` | Shared submit button used across the entity forms. |
| `ProductThumbnail.vue` | Product image thumbnail with its fallback handling. |

## For AI Agents

### Working In This Directory
- Keep these presentational: props in, events out, no service or composable calls.
- Auto-import names are prefixed — this directory yields `<AtomsDarkMode>`, `<AtomsFormButton>`, `<AtomsProductThumbnail>`.

### Testing Requirements
- `pnpm run build`; verify visually in `pnpm run dev`.

## Dependencies

### Internal
- `lib/utils.ts` for `cn()`

### External
- `@nuxtjs/color-mode`, `lucide-vue-next`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
