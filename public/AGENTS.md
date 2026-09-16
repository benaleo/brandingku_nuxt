<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# public

## Purpose
Static files served verbatim from the site root, unprocessed by Vite. A file at `public/images/no-image.jpg` is reachable at `/images/no-image.jpg`.

## Key Files

| File | Description |
|------|-------------|
| `favicon.ico` | Site favicon. |
| `robots.txt` | Crawler directives. |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `icon/` | SVG icons served directly: `check-icon.svg`, `leaf-icon.svg`, `speed-icon.svg`. No AGENTS.md — asset-only. |
| `images/` | Raster assets: `no-image.jpg` (the shared fallback) plus the `about/` and `html/` sets. No AGENTS.md — asset-only. |

## For AI Agents

### Working In This Directory
- Paths here are public URLs. Renaming a file breaks every hardcoded reference, and nothing type-checks these strings.
- `images/no-image.jpg` is the shared fallback for missing product and portfolio imagery — check usages before touching it.
- Assets that should be hashed, optimized or imported by the bundler belong in `assets/` instead. Uploaded content lives in the S3-compatible store, not here.

### Testing Requirements
- Request the URL directly in `pnpm run dev` to confirm it resolves.

## Dependencies

### External
- `@nuxt/image` handles optimization for images referenced through `<NuxtImg>`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
