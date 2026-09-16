<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# table

## Purpose
Unstyled table primitives — the markup layer under the TanStack-driven datatables. Vendored shadcn-vue: 10 component parts plus an `index.ts` barrel.

## Key Files

| File | Description |
|------|-------------|
| `Table.vue` | Presentational part; no reka-ui primitive. |
| `TableBody.vue` | Presentational part; no reka-ui primitive. |
| `TableCaption.vue` | Presentational part; no reka-ui primitive. |
| `TableCell.vue` | Presentational part; no reka-ui primitive. |
| `TableEmpty.vue` | Presentational part; no reka-ui primitive. |
| `TableFooter.vue` | Presentational part; no reka-ui primitive. |
| `TableHead.vue` | Presentational part; no reka-ui primitive. |
| `TableHeader.vue` | Presentational part; no reka-ui primitive. |
| `TableRow.vue` | Presentational part; no reka-ui primitive. |
| `utils.ts` | Presentational part; no reka-ui primitive. |
| `index.ts` | Barrel re-exporting `Table`, `TableBody`, `TableCaption`, `TableCell`, `TableEmpty`, `TableFooter`, `TableHead`, `TableHeader`, `TableRow`. |

## For AI Agents

### Working In This Directory
- Vendored shadcn-vue source. It lives in the repo and may be edited, but `pnpm dlx shadcn-vue@latest add <name>` overwrites this directory wholesale — prefer hand-editing and diff any re-add before keeping it.
- `nuxt.config.ts` excludes `ui/**` from component auto-import and restricts this tree to `.vue` files, so the `index.ts` barrel is not auto-registered. Consume these via the `Ui` prefix (e.g. `<UiButton>`) or import from `@/components/ui/<name>`.
- Import from the family root — `import { Table } from '@/components/ui/table'` — not from the individual `.vue` files.

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
