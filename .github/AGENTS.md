<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-09 | Updated: 2026-09-09 -->

# .github

## Purpose
GitHub platform configuration directory for brandingku_nuxt. It currently holds nothing of its own — the entire content is the `workflows/` subdirectory, which carries the single GitHub Actions pipeline that builds the Nuxt SSR output and deploys it to NuxtHub on every push. No issue templates, PR templates, `CODEOWNERS`, `dependabot.yml`, or composite actions exist here yet; this is the place they would go if added.

## Subdirectories
| Directory | Purpose |
| --- | --- |
| `workflows/` | GitHub Actions workflow definitions; contains the pnpm + Node 22 build and NuxtHub deploy pipeline (see `workflows/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Nothing here is machine-generated; every file is hand-written YAML/Markdown intended for GitHub's own conventions, so edit directly. There is no regeneration command.
- Do not place workflow YAML at this level — GitHub only executes files under `.github/workflows/`. Anything CI-related belongs in the subdirectory.
- New files added here must use GitHub's exact reserved names (`CODEOWNERS`, `dependabot.yml`, `ISSUE_TEMPLATE/`, `pull_request_template.md`) or they are inert.
- Changing CI behaviour means editing `workflows/nuxthub.yml`, not this directory. That workflow assumes pnpm as the package manager (matching `packageManager: pnpm@10.8.0` in the root `package.json`) and a committed `pnpm-lock.yaml`, because it installs with `--frozen-lockfile`.
- The deploy step is bound to the NuxtHub project key `brandingku-zliy` and publishes the `.output` directory; keep any build-script change in the root `package.json` compatible with that artifact path.

### Testing Requirements
There is no test suite in this repository — the root `package.json` defines only `dev`, `build`, `build:cf`, `deploy:cf`, `generate`, `preview`, `start`, and export/copy scripts, with no `test` script and no test runner in dependencies. Verification of a change here is therefore limited to: YAML parses (any YAML linter, or GitHub's own rejection of an invalid workflow file), and the pipeline's own build step succeeding — reproduce it locally with `pnpm install --frozen-lockfile` followed by `pnpm run build`, then confirm `.output` exists. The real signal is the Actions run on the next push, since the workflow triggers on `on: push` for all branches.

### Common Patterns
- Single-purpose directory: one concern (CI/CD) expressed as one workflow file, no shared/reusable action definitions.
- Pinned major versions for third-party actions (`actions/checkout@v4`, `actions/setup-node@v4`, `pnpm/action-setup@v4`, `nuxt-hub/action@v2`) rather than floating refs or commit SHAs.
- Least-privilege job permissions declared inline (`contents: read`, `id-token: write`) instead of relying on repository defaults.
- A debug step (`ls -la .output`) is left in the pipeline deliberately to make deploy-artifact problems visible in the run log.

## Dependencies

### Internal
- `../package.json` — supplies the `build` script, the pinned pnpm version, and the dependency set the workflow installs.
- `../pnpm-lock.yaml` — required by the `--frozen-lockfile` install; the workflow fails if it is out of sync.
- `../nuxt.config.ts` — decides the Nitro preset and whether `@nuxthub/core` is loaded, which determines what lands in `.output`.
- `../.output/` — build artifact directory the deploy step uploads (git-ignored, produced during the run).

### External
This directory has no files of its own and thus no direct dependencies. Its subdirectory relies on the GitHub Actions marketplace actions `actions/checkout`, `actions/setup-node`, `pnpm/action-setup`, and `nuxt-hub/action`, plus the `nuxthub` CLI via `pnpx`; see `workflows/AGENTS.md`.

<!-- MANUAL: Notes added below this line are preserved on regeneration -->
