<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# elements

## Purpose
Composite widgets that sit between the shadcn primitives and full pages — console chrome, dialogs, and a few storefront interactions.

## Key Files

| File | Description |
|------|-------------|
| `AppSidebar.vue` | Admin console sidebar, driven by `secretConsoleMenu` from `utils/list.menu.ts`. |
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
| `WhatsAppButton.vue` | Floating WhatsApp contact button. |

## For AI Agents

### Working In This Directory
- These are the console's shared chrome. Changing `AppSidebar.vue` or `AppTopBar.vue` affects every page using the `console-secret` layout.
- Sidebar entries are data, not markup — edit `utils/list.menu.ts` to add a console route rather than hardcoding a link here.
- Auto-import prefixes this directory with `Elements`, so `ElementsProductQuickView.vue` ends up double-prefixed; rename the file if you want the shorter tag.

### Testing Requirements
- `pnpm run build`; verify console pages render in `pnpm run dev`.

## Dependencies

### Internal
- `utils/list.menu.ts` for the sidebar tree
- `components/ui/sidebar/` and `components/ui/dialog/` primitives
- `layouts/console-secret.vue`

### External
- `reka-ui`, `lucide-vue-next`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
