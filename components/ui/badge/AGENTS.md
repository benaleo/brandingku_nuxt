<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# badge

## Purpose
Small inline status or category label. Vendored shadcn-vue: 1 component part plus an `index.ts` barrel.

## Key Files

| File | Description |
|------|-------------|
| `Badge.vue` | Wraps the reka-ui `Primitive` primitive. |
| `index.ts` | Barrel re-exporting `Badge`. Also defines the `cva` variant map for this family. |

## For AI Agents

### Working In This Directory
- Vendored shadcn-vue source. It lives in the repo and may be edited, but `pnpm dlx shadcn-vue@latest add <name>` overwrites this directory wholesale — prefer hand-editing and diff any re-add before keeping it.
- `nuxt.config.ts` excludes `ui/**` from component auto-import and restricts this tree to `.vue` files, so the `index.ts` barrel is not auto-registered. Consume these via the `Ui` prefix (e.g. `<UiButton>`) or import from `@/components/ui/<name>`.
- Import from the family root — `import { Badge } from '@/components/ui/badge'` — not from the individual `.vue` files.
- Variants are defined with `cva`. Add a variant to that map rather than passing ad-hoc classes at the call site, so every usage stays consistent.
- Behaviour, keyboard handling and ARIA come from reka-ui (`Primitive`). Do not reimplement them here — these files should only add styling and prop forwarding.

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
- `class-variance-authority`
- `clsx`, `tailwind-merge`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
