<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# sidebar

## Purpose
shadcn-vue `sidebar` component family. Vendored shadcn-vue: 25 component parts plus an `index.ts` barrel.

## Key Files

| File | Description |
|------|-------------|
| `Sidebar.vue` | Presentational part; no reka-ui primitive. |
| `SidebarContent.vue` | Presentational part; no reka-ui primitive. |
| `SidebarFooter.vue` | Presentational part; no reka-ui primitive. |
| `SidebarGroup.vue` | Presentational part; no reka-ui primitive. |
| `SidebarGroupAction.vue` | Wraps the reka-ui `Primitive` primitive. |
| `SidebarGroupContent.vue` | Presentational part; no reka-ui primitive. |
| `SidebarGroupLabel.vue` | Wraps the reka-ui `Primitive` primitive. |
| `SidebarHeader.vue` | Presentational part; no reka-ui primitive. |
| `SidebarInput.vue` | Presentational part; no reka-ui primitive. |
| `SidebarInset.vue` | Presentational part; no reka-ui primitive. |
| `SidebarMenu.vue` | Presentational part; no reka-ui primitive. |
| `SidebarMenuAction.vue` | Wraps the reka-ui `Primitive` primitive. |
| `SidebarMenuBadge.vue` | Presentational part; no reka-ui primitive. |
| `SidebarMenuButton.vue` | Presentational part; no reka-ui primitive. |
| `SidebarMenuButtonChild.vue` | Wraps the reka-ui `Primitive` primitive. |
| `SidebarMenuItem.vue` | Presentational part; no reka-ui primitive. |
| `SidebarMenuSkeleton.vue` | Presentational part; no reka-ui primitive. |
| `SidebarMenuSub.vue` | Presentational part; no reka-ui primitive. |
| `SidebarMenuSubButton.vue` | Wraps the reka-ui `Primitive` primitive. |
| `SidebarMenuSubItem.vue` | Presentational part; no reka-ui primitive. |
| `SidebarProvider.vue` | Wraps the reka-ui `TooltipProvider` primitive. |
| `SidebarRail.vue` | Presentational part; no reka-ui primitive. |
| `SidebarSeparator.vue` | Presentational part; no reka-ui primitive. |
| `SidebarTrigger.vue` | Presentational part; no reka-ui primitive. |
| `utils.ts` | Wraps the reka-ui `createContext` primitive. |
| `index.ts` | Barrel re-exporting `Sidebar`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarGroupLabel`, `SidebarHeader`, `SidebarInput`, `SidebarInset`, `SidebarMenu`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuButton`, `SidebarMenuItem`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubButton`, `SidebarMenuSubItem`, `SidebarProvider`, `SidebarRail`, `SidebarSeparator`, `SidebarTrigger`, `useSidebar`. Also defines the `cva` variant map for this family. |

## For AI Agents

### Working In This Directory
- Vendored shadcn-vue source. It lives in the repo and may be edited, but `pnpm dlx shadcn-vue@latest add <name>` overwrites this directory wholesale — prefer hand-editing and diff any re-add before keeping it.
- `nuxt.config.ts` excludes `ui/**` from component auto-import and restricts this tree to `.vue` files, so the `index.ts` barrel is not auto-registered. Consume these via the `Ui` prefix (e.g. `<UiButton>`) or import from `@/components/ui/<name>`.
- Import from the family root — `import { Sidebar } from '@/components/ui/sidebar'` — not from the individual `.vue` files.
- Variants are defined with `cva`. Add a variant to that map rather than passing ad-hoc classes at the call site, so every usage stays consistent.
- Behaviour, keyboard handling and ARIA come from reka-ui (`Primitive`, `TooltipProvider`, `createContext`). Do not reimplement them here — these files should only add styling and prop forwarding.

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
