<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# ui

## Purpose
Vendored shadcn-vue component library, scaffolded by the shadcn CLI and built on `reka-ui` primitives. Each subdirectory is one component family: the parts as `.vue` files plus an `index.ts` barrel that also holds any `cva` variant maps.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `accordion/` | shadcn-vue `accordion` family — 5 files (see `accordion/AGENTS.md`). |
| `alert-dialog/` | shadcn-vue `alert-dialog` family — 10 files (see `alert-dialog/AGENTS.md`). |
| `avatar/` | shadcn-vue `avatar` family — 4 files (see `avatar/AGENTS.md`). |
| `badge/` | shadcn-vue `badge` family — 2 files (see `badge/AGENTS.md`). |
| `breadcrumb/` | shadcn-vue `breadcrumb` family — 8 files (see `breadcrumb/AGENTS.md`). |
| `button/` | shadcn-vue `button` family — 2 files (see `button/AGENTS.md`). |
| `card/` | shadcn-vue `card` family — 8 files (see `card/AGENTS.md`). |
| `carousel/` | shadcn-vue `carousel` family — 8 files (see `carousel/AGENTS.md`). |
| `checkbox/` | shadcn-vue `checkbox` family — 2 files (see `checkbox/AGENTS.md`). |
| `collapsible/` | shadcn-vue `collapsible` family — 4 files (see `collapsible/AGENTS.md`). |
| `combobox/` | shadcn-vue `combobox` family — 12 files (see `combobox/AGENTS.md`). |
| `dialog/` | shadcn-vue `dialog` family — 11 files (see `dialog/AGENTS.md`). |
| `dropdown-menu/` | shadcn-vue `dropdown-menu` family — 15 files (see `dropdown-menu/AGENTS.md`). |
| `form/` | shadcn-vue `form` family — 8 files (see `form/AGENTS.md`). |
| `input/` | shadcn-vue `input` family — 2 files (see `input/AGENTS.md`). |
| `label/` | shadcn-vue `label` family — 2 files (see `label/AGENTS.md`). |
| `select/` | shadcn-vue `select` family — 12 files (see `select/AGENTS.md`). |
| `separator/` | shadcn-vue `separator` family — 2 files (see `separator/AGENTS.md`). |
| `sheet/` | shadcn-vue `sheet` family — 10 files (see `sheet/AGENTS.md`). |
| `sidebar/` | shadcn-vue `sidebar` family — 26 files (see `sidebar/AGENTS.md`). |
| `skeleton/` | shadcn-vue `skeleton` family — 2 files (see `skeleton/AGENTS.md`). |
| `sonner/` | shadcn-vue `sonner` family — 2 files (see `sonner/AGENTS.md`). |
| `table/` | shadcn-vue `table` family — 11 files (see `table/AGENTS.md`). |
| `tabs/` | shadcn-vue `tabs` family — 5 files (see `tabs/AGENTS.md`). |
| `tags-input/` | shadcn-vue `tags-input` family — 6 files (see `tags-input/AGENTS.md`). |
| `textarea/` | shadcn-vue `textarea` family — 2 files (see `textarea/AGENTS.md`). |
| `tooltip/` | shadcn-vue `tooltip` family — 5 files (see `tooltip/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Vendored shadcn-vue source. It lives in the repo and may be edited, but `pnpm dlx shadcn-vue@latest add <name>` overwrites this directory wholesale — prefer hand-editing and diff any re-add before keeping it.
- `nuxt.config.ts` excludes `ui/**` from component auto-import and restricts this tree to `.vue` files, so the `index.ts` barrel is not auto-registered. Consume these via the `Ui` prefix (e.g. `<UiButton>`) or import from `@/components/ui/<name>`.
- Styling is driven by the CSS custom properties in `assets/css/tailwind.css` (`baseColor: neutral`, `cssVariables: true`). Use those tokens rather than literal colours so dark mode keeps working.
- First-party components do not belong here. Put them in a sibling directory under `components/`.

### Testing Requirements
- `pnpm run build` catches type errors across the barrels.
- No component tests exist; verify visually.

### Common Patterns
- Variant maps live in `index.ts` next to the export, defined with `cva` (e.g. `buttonVariants`).
- Parts forward props to the underlying reka-ui primitive and merge classes through `cn()` from `@/lib/utils`.

## Dependencies

### Internal
- `lib/utils.ts` — `cn()`
- `assets/css/tailwind.css` — design tokens

### External
- `reka-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-vue-next`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
