<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# avatar

## Purpose
User or entity image with a text fallback when the image is missing or fails to load. Vendored shadcn-vue: 3 component parts plus an `index.ts` barrel.

## Key Files

| File | Description |
|------|-------------|
| `Avatar.vue` | Wraps the reka-ui `AvatarRoot` primitive. |
| `AvatarFallback.vue` | Wraps the reka-ui `AvatarFallback` primitive. |
| `AvatarImage.vue` | Wraps the reka-ui `AvatarImage` primitive. |
| `index.ts` | Barrel re-exporting `Avatar`, `AvatarFallback`, `AvatarImage`. |

## For AI Agents

### Working In This Directory
- Vendored shadcn-vue source. It lives in the repo and may be edited, but `pnpm dlx shadcn-vue@latest add <name>` overwrites this directory wholesale — prefer hand-editing and diff any re-add before keeping it.
- `nuxt.config.ts` excludes `ui/**` from component auto-import and restricts this tree to `.vue` files, so the `index.ts` barrel is not auto-registered. Consume these via the `Ui` prefix (e.g. `<UiButton>`) or import from `@/components/ui/<name>`.
- Import from the family root — `import { Avatar } from '@/components/ui/avatar'` — not from the individual `.vue` files.
- Behaviour, keyboard handling and ARIA come from reka-ui (`AvatarFallback`, `AvatarImage`, `AvatarRoot`). Do not reimplement them here — these files should only add styling and prop forwarding.

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
