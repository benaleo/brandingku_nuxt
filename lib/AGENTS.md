<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# lib

## Purpose
The shadcn utility module. `components.json` points its `utils` alias at this directory, so every vendored component imports from here.

## Key Files

| File | Description |
|------|-------------|
| `utils.ts` | Exports `cn()` — merges class lists with `clsx` and resolves Tailwind conflicts with `tailwind-merge`. |

## For AI Agents

### Working In This Directory
- Every component under `components/ui/` imports `cn` from `@/lib/utils`. Renaming this file or the export breaks the whole vendored tree at once.
- Keep this module dependency-light and framework-agnostic. Application helpers belong in `utils/`, which is auto-imported; this one is not.

### Testing Requirements
- `pnpm run build` — a break here surfaces as errors across every `ui/` component.

## Dependencies

### Internal
- Imported by all of `components/ui/`

### External
- `clsx`, `tailwind-merge`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
