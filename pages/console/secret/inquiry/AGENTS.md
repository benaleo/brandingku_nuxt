<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# inquiry

## Purpose
Incoming contact-form submissions. Read-only: the console lists them and opens a detail view, but does not create or edit them — they arrive from the public `/kontak` page.

## Key Files

| File | Description |
|------|-------------|
| `index.vue` | `/console/secret/inquiry` (108 lines) — listing built from `inquiryColumns` and fetched via `useWebContactService`. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `[id]/` | Detail route for one submission (see `[id]/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- There is deliberately no `add.vue` or `edit.vue`. Inquiries are user-submitted records; adding write routes here would let staff fabricate them.
- Submissions contain personal contact details. Do not add exports, logging or screenshots that copy them out of the console.

### Testing Requirements
- Submit through `/kontak`, then confirm the row appears in the listing.

## Dependencies

### Internal
- `services/web-contact.service.ts`
- `components/datatables/inquiryColumns.ts`
- `types/inquiry.type.ts`
- `pages/kontak.vue` is the source of these records

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
