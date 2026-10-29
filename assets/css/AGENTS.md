<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# css

## Purpose
The single stylesheet entry point, registered as `css: ['~/assets/css/tailwind.css']` in `nuxt.config.ts`.

## Key Files

| File | Description |
|------|-------------|
| `tailwind.css` | Tailwind v4 entry plus the shadcn design tokens. `components.json` points its `tailwind.css` key here, and `baseColor: neutral` with `cssVariables: true` means the shadcn palette is defined as CSS custom properties in this file rather than in the Tailwind config. |

## For AI Agents

### Working In This Directory
- Tailwind v4 is configured through the Vite plugin (`@tailwindcss/vite`), so most theming happens here in CSS rather than in `tailwind.config.js`.
- The light/dark token pairs are what `@nuxtjs/color-mode` toggles via the `-mode` class suffix. Renaming a variable breaks every shadcn component that reads it.

### Testing Requirements
- `pnpm run dev` and check both colour modes; there is no automated style check.

## Dependencies

### Internal
- Consumed by every component under `components/ui/`

### External
- `@tailwindcss/vite` — Tailwind CSS v4

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
