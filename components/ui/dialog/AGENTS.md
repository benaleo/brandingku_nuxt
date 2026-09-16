<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# dialog

## Purpose
Modal overlay for content and forms. Vendored shadcn-vue: 10 component parts plus an `index.ts` barrel.

## Key Files

| File | Description |
|------|-------------|
| `Dialog.vue` | Wraps the reka-ui `DialogRoot`, `DialogRootEmits` primitive. |
| `DialogClose.vue` | Wraps the reka-ui `DialogClose` primitive. |
| `DialogContent.vue` | Wraps the reka-ui `DialogClose`, `DialogContent`, `DialogContentEmits`, `DialogPortal` primitive. |
| `DialogDescription.vue` | Wraps the reka-ui `DialogDescription` primitive. |
| `DialogFooter.vue` | Presentational part; no reka-ui primitive. |
| `DialogHeader.vue` | Presentational part; no reka-ui primitive. |
| `DialogOverlay.vue` | Wraps the reka-ui `DialogOverlay` primitive. |
| `DialogScrollContent.vue` | Wraps the reka-ui `DialogClose`, `DialogContent`, `DialogContentEmits`, `DialogOverlay`, `DialogPortal` primitive. |
| `DialogTitle.vue` | Wraps the reka-ui `DialogTitle` primitive. |
| `DialogTrigger.vue` | Wraps the reka-ui `DialogTrigger` primitive. |
| `index.ts` | Barrel re-exporting `Dialog`, `DialogClose`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogOverlay`, `DialogScrollContent`, `DialogTitle`, `DialogTrigger`. |

## For AI Agents

### Working In This Directory
- Vendored shadcn-vue source. It lives in the repo and may be edited, but `pnpm dlx shadcn-vue@latest add <name>` overwrites this directory wholesale — prefer hand-editing and diff any re-add before keeping it.
- `nuxt.config.ts` excludes `ui/**` from component auto-import and restricts this tree to `.vue` files, so the `index.ts` barrel is not auto-registered. Consume these via the `Ui` prefix (e.g. `<UiButton>`) or import from `@/components/ui/<name>`.
- Import from the family root — `import { Dialog } from '@/components/ui/dialog'` — not from the individual `.vue` files.
- Behaviour, keyboard handling and ARIA come from reka-ui (`DialogClose`, `DialogContent`, `DialogContentEmits`, `DialogDescription`). Do not reimplement them here — these files should only add styling and prop forwarding.

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
