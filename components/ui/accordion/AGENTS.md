<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# accordion

## Purpose
Collapsible content sections where opening one panel can close the others. Vendored shadcn-vue: 4 component parts plus an `index.ts` barrel.

## Key Files

| File | Description |
|------|-------------|
| `Accordion.vue` | Wraps the reka-ui `AccordionRoot` primitive. |
| `AccordionContent.vue` | Wraps the reka-ui `AccordionContent` primitive. |
| `AccordionItem.vue` | Wraps the reka-ui `AccordionItem` primitive. |
| `AccordionTrigger.vue` | Wraps the reka-ui `AccordionHeader`, `AccordionTrigger` primitive. |
| `index.ts` | Barrel re-exporting `Accordion`, `AccordionContent`, `AccordionItem`, `AccordionTrigger`. |

## For AI Agents

### Working In This Directory
- Vendored shadcn-vue source. It lives in the repo and may be edited, but `pnpm dlx shadcn-vue@latest add <name>` overwrites this directory wholesale — prefer hand-editing and diff any re-add before keeping it.
- `nuxt.config.ts` excludes `ui/**` from component auto-import and restricts this tree to `.vue` files, so the `index.ts` barrel is not auto-registered. Consume these via the `Ui` prefix (e.g. `<UiButton>`) or import from `@/components/ui/<name>`.
- Import from the family root — `import { Accordion } from '@/components/ui/accordion'` — not from the individual `.vue` files.
- Behaviour, keyboard handling and ARIA come from reka-ui (`AccordionContent`, `AccordionHeader`, `AccordionItem`, `AccordionRoot`). Do not reimplement them here — these files should only add styling and prop forwarding.

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
