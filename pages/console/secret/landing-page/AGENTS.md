<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# landing-page

## Purpose
Editable content blocks for the public landing page. Three independent entities — benefits, clients and testimonials — each with the standard listing plus add/edit/detail routes. There is no page file at this level; it is purely a grouping segment.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `benefit/` | The benefit cards (see `benefit/AGENTS.md`). |
| `client/` | The client logo strip (see `client/AGENTS.md`). |
| `testimonial/` | Customer testimonials (see `testimonial/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Every page here sets `definePageMeta({ layout: 'console-secret' })`. Omitting it drops the page out of the admin shell — it still renders, just without the sidebar, which looks like a styling bug rather than a missing line.
- `/console/secret/landing-page` itself is not a route — only the three subdirectories are.
- Everything edited here renders on the public landing page immediately. There is no draft or preview step, so a bad save is visible to visitors.
- The three entities are structurally identical. When changing the pattern, change all three or the inconsistency will be copied forward.

### Testing Requirements
- Edit an item, then reload `/` and confirm the change appears.

## Dependencies

### Internal
- `services/landing-page.service.ts`, `benefit.service.ts`, `client.service.ts`, `testimonial.service.ts`
- `pages/index.vue`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
