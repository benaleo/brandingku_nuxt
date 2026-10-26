<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# elements

## Purpose
Composite widgets that sit between the shadcn primitives and full pages — console chrome, dialogs, and a few storefront interactions.

## Key Files

| File | Description |
|------|-------------|
| `AppSidebar.vue` | Admin console sidebar, driven by allowed permissions from `useConsoleAccess`. |
| `AppTopBar.vue` | Console top bar. |
| `AppBreadcrumb.vue` | Breadcrumb trail for console pages. |
| `AppTableHeader.vue` | Shared header block above console data tables (title plus primary action). |
| `AppFilterTable.vue` | Filter controls bound to the data tables. |
| `AppConfirmDeleteDialog.vue` | Shared delete confirmation dialog. |
| `ActionImageUpdate.vue` | Single-image replacement action. |
| `ActionBulkImageUpdate.vue` | Bulk image replacement action. |
| `DialogViewImage.vue` | Image lightbox dialog. |
| `BenefitFaq.vue` | Accordion rendering of benefit/FAQ entries. |
| `ElementsProductQuickView.vue` | Product quick-view overlay for the storefront. Note the redundant `Elements` prefix in the filename — auto-import resolves this to `<ElementsElementsProductQuickView>`. |
| `ChatProductButton.vue` | Product card button that opens the live chat with the product as the topic. |

## For AI Agents

### Working In This Directory
- These are the console's shared chrome. Changing `AppSidebar.vue` or `AppTopBar.vue` affects every page using the `console-secret` layout.
- Sidebar entries come from `useConsoleAccess` and the backend permission seed in `brandingku_go/config/rbac.go`. Do not hardcode menu links here; keep icon names aligned with the sidebar registry.
- Auto-import prefixes this directory with `Elements`, so `ElementsProductQuickView.vue` ends up double-prefixed; rename the file if you want the shorter tag.

### Testing Requirements
- `pnpm run build`; verify console pages render in `pnpm run dev`.

## Dependencies

### Internal
- `composables/useConsoleAccess.ts` for the sidebar tree and route permissions
- `components/ui/sidebar/` and `components/ui/dialog/` primitives
- `layouts/console-secret.vue`

### External
- `reka-ui`, `lucide-vue-next`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
