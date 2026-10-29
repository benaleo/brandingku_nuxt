<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# card

## Purpose
Bordered content container with header, content and footer regions. Vendored shadcn-vue: 7 component parts plus an `index.ts` barrel.

## Key Files

| File | Description |
|------|-------------|
| `Card.vue` | Presentational part; no reka-ui primitive. |
| `CardAction.vue` | Presentational part; no reka-ui primitive. |
| `CardContent.vue` | Presentational part; no reka-ui primitive. |
| `CardDescription.vue` | Presentational part; no reka-ui primitive. |
| `CardFooter.vue` | Presentational part; no reka-ui primitive. |
| `CardHeader.vue` | Presentational part; no reka-ui primitive. |
| `CardTitle.vue` | Presentational part; no reka-ui primitive. |
| `index.ts` | Barrel re-exporting `Card`, `CardAction`, `CardContent`, `CardDescription`, `CardFooter`, `CardHeader`, `CardTitle`. |

## For AI Agents

### Working In This Directory
- Vendored shadcn-vue source. It lives in the repo and may be edited, but `pnpm dlx shadcn-vue@latest add <name>` overwrites this directory wholesale — prefer hand-editing and diff any re-add before keeping it.
- `nuxt.config.ts` excludes `ui/**` from component auto-import and restricts this tree to `.vue` files, so the `index.ts` barrel is not auto-registered. Consume these via the `Ui` prefix (e.g. `<UiButton>`) or import from `@/components/ui/<name>`.
- Import from the family root — `import { Card } from '@/components/ui/card'` — not from the individual `.vue` files.

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
- `clsx`, `tailwind-merge`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
