<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# assets

## Purpose
Build-processed static assets. Only stylesheets live here today.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `css/` | Tailwind v4 entry point and theme tokens (see `css/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Assets here go through Vite. Files that must be served byte-for-byte at a stable URL belong in `public/` instead.

### Testing Requirements
- `pnpm run build` — a broken stylesheet import fails the build.

## Dependencies

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
