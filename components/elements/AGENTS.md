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
| `ConfirmDialog.vue` | Storefront confirmation (`v-model:open`, `title`, `description`, `confirm-label`, `tone`, `icon`, `busy`; extra fields in the slot). Stays open while `busy`, focuses the dismiss button first. Use it instead of `window.confirm`/`window.prompt`. |
| `FilePickField.vue` | Visible file picker: a dashed drop zone (tap to choose, drag on desktop), then the chosen files with thumbnail, size, change and remove. The parent validates and owns `files`; listens to `pick` and `remove`. Use it instead of a bare `<input type="file">`. |
| `RupiahInput.vue` | Rupiah amount field with dot thousand separators while typing (`1.500.000`); `v-model` stays a plain number (or `''`). |
| `PaymentPlanCard.vue` | Customer's first payment of an accepted quotation once its deal is sent: DP (percent or nominal, at least half the deal) or full payment, with a live PDF preview from `previewPaymentPlan` (inline from `md`, a link on phones). |
| `OrderProgressTimeline.vue` | Production steps of a quotation order (mockup → sample → mass production → QC → ready to ship → shipped → completed) with photos; `viewer="customer"` adds the approve/revise buttons for the mockup and the sample, the console fills the current step through the `current-<step>` slot. |
| `NotificationBell.vue` | Storefront header bell for signed-in accounts: running quotation cards on top (always counted), then notifications (counted until read). State and the live `notificationsChanged` subscription come from `composables/useNotifications.ts`; rows are written by backend hooks in `brandingku_go/graph/notification.go`. |
| `DiscussionThread.vue` | Live discussion thread for a record (`subject-type`, `subject-id`), used on quotation orders in the storefront (`viewer="customer"`) and the console (`viewer="staff"`). Data and the websocket subscription come from `services/discussion.service.ts`; the backend decides who may join (`discussionSubjects` in `brandingku_go/graph/discussion.go`). |

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
