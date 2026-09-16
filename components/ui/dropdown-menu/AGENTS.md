<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# dropdown-menu

## Purpose
Anchored menu with items, separators, submenus and shortcuts. Vendored shadcn-vue: 14 component parts plus an `index.ts` barrel.

## Key Files

| File | Description |
|------|-------------|
| `DropdownMenu.vue` | Wraps the reka-ui `DropdownMenuRoot`, `DropdownMenuRootEmits` primitive. |
| `DropdownMenuCheckboxItem.vue` | Wraps the reka-ui `DropdownMenuCheckboxItem`, `DropdownMenuCheckboxItemEmits`, `DropdownMenuItemIndicator` primitive. |
| `DropdownMenuContent.vue` | Wraps the reka-ui `DropdownMenuContent`, `DropdownMenuContentEmits`, `DropdownMenuPortal` primitive. |
| `DropdownMenuGroup.vue` | Wraps the reka-ui `DropdownMenuGroup` primitive. |
| `DropdownMenuItem.vue` | Wraps the reka-ui `DropdownMenuItem` primitive. |
| `DropdownMenuLabel.vue` | Wraps the reka-ui `DropdownMenuLabel` primitive. |
| `DropdownMenuRadioGroup.vue` | Wraps the reka-ui `DropdownMenuRadioGroup`, `DropdownMenuRadioGroupEmits` primitive. |
| `DropdownMenuRadioItem.vue` | Wraps the reka-ui `DropdownMenuItemIndicator`, `DropdownMenuRadioItem`, `DropdownMenuRadioItemEmits` primitive. |
| `DropdownMenuSeparator.vue` | Wraps the reka-ui `DropdownMenuSeparator` primitive. |
| `DropdownMenuShortcut.vue` | Presentational part; no reka-ui primitive. |
| `DropdownMenuSub.vue` | Wraps the reka-ui `DropdownMenuSub`, `DropdownMenuSubEmits` primitive. |
| `DropdownMenuSubContent.vue` | Wraps the reka-ui `DropdownMenuSubContent`, `DropdownMenuSubContentEmits` primitive. |
| `DropdownMenuSubTrigger.vue` | Wraps the reka-ui `DropdownMenuSubTrigger` primitive. |
| `DropdownMenuTrigger.vue` | Wraps the reka-ui `DropdownMenuTrigger` primitive. |
| `index.ts` | Barrel re-exporting `DropdownMenu`, `DropdownMenuCheckboxItem`, `DropdownMenuContent`, `DropdownMenuGroup`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubContent`, `DropdownMenuSubTrigger`, `DropdownMenuTrigger`, `DropdownMenuPortal`. |

## For AI Agents

### Working In This Directory
- Vendored shadcn-vue source. It lives in the repo and may be edited, but `pnpm dlx shadcn-vue@latest add <name>` overwrites this directory wholesale — prefer hand-editing and diff any re-add before keeping it.
- `nuxt.config.ts` excludes `ui/**` from component auto-import and restricts this tree to `.vue` files, so the `index.ts` barrel is not auto-registered. Consume these via the `Ui` prefix (e.g. `<UiButton>`) or import from `@/components/ui/<name>`.
- Import from the family root — `import { DropdownMenu } from '@/components/ui/dropdown-menu'` — not from the individual `.vue` files.
- Behaviour, keyboard handling and ARIA come from reka-ui (`DropdownMenuCheckboxItem`, `DropdownMenuCheckboxItemEmits`, `DropdownMenuContent`, `DropdownMenuContentEmits`). Do not reimplement them here — these files should only add styling and prop forwarding.

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
