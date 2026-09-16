<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# select

## Purpose
Native-feeling select built from a listbox primitive. Vendored shadcn-vue: 11 component parts plus an `index.ts` barrel.

## Key Files

| File | Description |
|------|-------------|
| `Select.vue` | Wraps the reka-ui `SelectRoot` primitive. |
| `SelectContent.vue` | Wraps the reka-ui `SelectContent`, `SelectContentEmits`, `SelectPortal`, `SelectViewport` primitive. |
| `SelectGroup.vue` | Wraps the reka-ui `SelectGroup` primitive. |
| `SelectItem.vue` | Wraps the reka-ui `SelectItem`, `SelectItemIndicator`, `SelectItemText` primitive. |
| `SelectItemText.vue` | Wraps the reka-ui `SelectItemText` primitive. |
| `SelectLabel.vue` | Wraps the reka-ui `SelectLabel` primitive. |
| `SelectScrollDownButton.vue` | Wraps the reka-ui `SelectScrollDownButton` primitive. |
| `SelectScrollUpButton.vue` | Wraps the reka-ui `SelectScrollUpButton` primitive. |
| `SelectSeparator.vue` | Wraps the reka-ui `SelectSeparator` primitive. |
| `SelectTrigger.vue` | Wraps the reka-ui `SelectIcon`, `SelectTrigger` primitive. |
| `SelectValue.vue` | Wraps the reka-ui `SelectValue` primitive. |
| `index.ts` | Barrel re-exporting `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectItemText`, `SelectLabel`, `SelectScrollDownButton`, `SelectScrollUpButton`, `SelectSeparator`, `SelectTrigger`, `SelectValue`. |

## For AI Agents

### Working In This Directory
- Vendored shadcn-vue source. It lives in the repo and may be edited, but `pnpm dlx shadcn-vue@latest add <name>` overwrites this directory wholesale — prefer hand-editing and diff any re-add before keeping it.
- `nuxt.config.ts` excludes `ui/**` from component auto-import and restricts this tree to `.vue` files, so the `index.ts` barrel is not auto-registered. Consume these via the `Ui` prefix (e.g. `<UiButton>`) or import from `@/components/ui/<name>`.
- Import from the family root — `import { Select } from '@/components/ui/select'` — not from the individual `.vue` files.
- Behaviour, keyboard handling and ARIA come from reka-ui (`SelectContent`, `SelectContentEmits`, `SelectGroup`, `SelectIcon`). Do not reimplement them here — these files should only add styling and prop forwarding.

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
