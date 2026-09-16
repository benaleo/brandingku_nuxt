<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# [id]

## Purpose
Detail view for a single contact submission.

## Key Files

| File | Description |
|------|-------------|
| `detail.vue` | `/console/secret/inquiry/:id/detail` (28 lines). Reads `route.params.id` and passes it explicitly as `:id` to `InquiryDetailForm` — unlike the other console detail pages, which let the form read the route itself. |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- The id is passed as a prop here. That is the exception in this tree; do not 'fix' it to match the others without checking `InquiryDetailForm`.
- There is no `edit.vue` by design — see the parent directory.

### Testing Requirements
- Open a real inquiry from the listing.

## Dependencies

### Internal
- `components/forms/InquiryDetailForm.vue`
- `components/elements/AppTableHeader.vue`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
