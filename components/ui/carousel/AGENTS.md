<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# carousel

## Purpose
Horizontally scrollable slide container with previous/next controls. Vendored shadcn-vue: 7 component parts plus an `index.ts` barrel.

## Key Files

| File | Description |
|------|-------------|
| `Carousel.vue` | Presentational part; no reka-ui primitive. |
| `CarouselContent.vue` | Presentational part; no reka-ui primitive. |
| `CarouselItem.vue` | Presentational part; no reka-ui primitive. |
| `CarouselNext.vue` | Presentational part; no reka-ui primitive. |
| `CarouselPrevious.vue` | Presentational part; no reka-ui primitive. |
| `interface.ts` | Presentational part; no reka-ui primitive. |
| `useCarousel.ts` | Presentational part; no reka-ui primitive. |
| `index.ts` | Barrel re-exporting `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselNext`, `CarouselPrevious`, `useCarousel`. |

## For AI Agents

### Working In This Directory
- Vendored shadcn-vue source. It lives in the repo and may be edited, but `pnpm dlx shadcn-vue@latest add <name>` overwrites this directory wholesale — prefer hand-editing and diff any re-add before keeping it.
- `nuxt.config.ts` excludes `ui/**` from component auto-import and restricts this tree to `.vue` files, so the `index.ts` barrel is not auto-registered. Consume these via the `Ui` prefix (e.g. `<UiButton>`) or import from `@/components/ui/<name>`.
- Import from the family root — `import { Carousel } from '@/components/ui/carousel'` — not from the individual `.vue` files.

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
