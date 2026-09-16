<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# skeletons

## Purpose
Loading placeholders shown while data resolves.

## Key Files

| File | Description |
|------|-------------|
| `SkeletonFeaturedCategory.vue` | Placeholder for the featured-categories landing block. |

## For AI Agents

### Working In This Directory
- Mirror the real component's layout and spacing, otherwise the swap from skeleton to content shifts the page.
- Build on `components/ui/skeleton/` rather than hand-rolling pulse animations.

### Testing Requirements
- Throttle the network in `pnpm run dev` to see the placeholder state.

## Dependencies

### Internal
- `components/ui/skeleton/`
- `components/FeaturedCategories.vue`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
