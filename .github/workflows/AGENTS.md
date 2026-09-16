<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# workflows

## Purpose
GitHub Actions workflow definitions. One pipeline, deploying to NuxtHub.

## Key Files

| File | Description |
|------|-------------|
| `nuxthub.yml` | `Deploy to NuxtHub`, triggered on every push to any branch. Runs on ubuntu-latest with `contents: read` and `id-token: write`. Steps: checkout, `pnpm/action-setup@v4`, Node 22 with pnpm cache, `pnpm install --frozen-lockfile`, `pnpx nuxthub@latest ensure`, `pnpm run build`, a debug listing of `.output`, then `nuxt-hub/action@v2` with project key `brandingku-zliy` and output directory `.output`. |

## For AI Agents

### Working In This Directory
- The trigger is a bare `on: push`, so every branch deploys. Narrow it to specific branches before treating this as a production gate.
- It runs `pnpm run build` (the default Node preset), not `build:cf`. The `deploy:cf` script in `package.json` is a separate, manual wrangler path — the two deployment routes coexist.
- `--frozen-lockfile` means an out-of-date `pnpm-lock.yaml` fails CI. Commit the lockfile with any dependency change.
- `id-token: write` is required for NuxtHub's OIDC auth; removing it breaks the deploy step.

### Testing Requirements
- Validated only by pushing. There is no local runner configured.

## Dependencies

### Internal
- Builds the whole `brandingku_nuxt` app
- Overlaps with the `deploy:cf` script in `package.json`

### External
- `pnpm/action-setup@v4`, `actions/setup-node@v4`, `nuxt-hub/action@v2`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
