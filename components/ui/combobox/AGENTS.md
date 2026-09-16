<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# combobox

## Purpose
Searchable select: a popover containing a filterable command list. Vendored shadcn-vue: 11 component parts plus an `index.ts` barrel.

## Key Files

| File | Description |
|------|-------------|
| `Combobox.vue` | Wraps the reka-ui `ComboboxRoot`, `ComboboxRootEmits` primitive. |
| `ComboboxAnchor.vue` | Wraps the reka-ui `ComboboxAnchor` primitive. |
| `ComboboxEmpty.vue` | Wraps the reka-ui `ComboboxEmpty` primitive. |
| `ComboboxGroup.vue` | Wraps the reka-ui `ComboboxGroup`, `ComboboxLabel` primitive. |
| `ComboboxInput.vue` | Wraps the reka-ui `ComboboxInput`, `ComboboxInputEmits` primitive. |
| `ComboboxItem.vue` | Wraps the reka-ui `ComboboxItem` primitive. |
| `ComboboxItemIndicator.vue` | Wraps the reka-ui `ComboboxItemIndicator` primitive. |
| `ComboboxList.vue` | Wraps the reka-ui `ComboboxContent`, `ComboboxPortal` primitive. |
| `ComboboxSeparator.vue` | Wraps the reka-ui `ComboboxSeparator` primitive. |
| `ComboboxTrigger.vue` | Wraps the reka-ui `ComboboxTrigger` primitive. |
| `ComboboxViewport.vue` | Wraps the reka-ui `ComboboxViewport` primitive. |
| `index.ts` | Barrel re-exporting `Combobox`, `ComboboxAnchor`, `ComboboxEmpty`, `ComboboxGroup`, `ComboboxInput`, `ComboboxItem`, `ComboboxItemIndicator`, `ComboboxList`, `ComboboxSeparator`, `ComboboxViewport`, `ComboboxCancel`, `ComboboxTrigger`. |

## For AI Agents

### Working In This Directory
- Vendored shadcn-vue source. It lives in the repo and may be edited, but `pnpm dlx shadcn-vue@latest add <name>` overwrites this directory wholesale — prefer hand-editing and diff any re-add before keeping it.
- `nuxt.config.ts` excludes `ui/**` from component auto-import and restricts this tree to `.vue` files, so the `index.ts` barrel is not auto-registered. Consume these via the `Ui` prefix (e.g. `<UiButton>`) or import from `@/components/ui/<name>`.
- Import from the family root — `import { Combobox } from '@/components/ui/combobox'` — not from the individual `.vue` files.
- Behaviour, keyboard handling and ARIA come from reka-ui (`ComboboxAnchor`, `ComboboxContent`, `ComboboxEmpty`, `ComboboxGroup`). Do not reimplement them here — these files should only add styling and prop forwarding.

### Testing Requirements
- `pnpm run build` type-checks the barrel and its consumers.
- No component tests exist — verify visually, in both light and dark mode.

### Common Patterns
- Each part forwards its props to the underlying primitive and merges incoming classes through `cn()`.
- Colours come from the CSS custom properties in `assets/css/tailwind.css`, never from literal hex values.

## Dependencies

### Internal
- `lib/utils.ts` — `cn()`
- `assets/css/tailwind.css` — design tokens

### External
- `reka-ui`
- `clsx`, `tailwind-merge`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
