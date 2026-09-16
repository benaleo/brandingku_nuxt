<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# api

## Purpose
Nitro API routes. Currently a single GraphQL proxy that keeps the backend origin off the client and normalizes upstream failures into a GraphQL-shaped response.

## Key Files

| File | Description |
|------|-------------|
| `gql.post.ts` | POST `/api/gql`. Forwards `query` and `variables` to the upstream `API_URL`, validating that the URL parses (400-style `{errors}` and HTTP 500 if not). Uses a 15-second timeout with `retry: 0`. Inspects the upstream payload explicitly: a non-empty `errors` array returns HTTP 502 with those errors; a payload containing `data` is passed through; anything else returns 502 with 'Upstream returned unexpected payload'. Network and non-JSON failures are caught and re-emitted as `{ errors: [{ message }] }` rather than leaking an HTML error page with a 200. |

## For AI Agents

### Working In This Directory
- The explicit payload-shape check is deliberate. Removing it lets an upstream HTML error page reach the client as a successful response — that is the bug this route exists to prevent.
- Keep the timeout and `retry: 0`. Retrying mutations here would double-submit.
- This is the client's only path to the GraphQL API. Do not add a route that forwards arbitrary upstream URLs.
- `console.error` in the catch block logs `message`, `name`, `stack` and `cause` — check the server log first when debugging a 502.

### Testing Requirements
- `curl -X POST localhost:3000/api/gql -H 'content-type: application/json' -d '{"query":"{ __typename }"}'`.
- Point `API_URL` at an unreachable host to confirm the error path returns `{errors}` and not an HTML body.

## Dependencies

### Internal
- `composables/useGql.ts` is the client-side caller
- Upstream is the `brandingku_go` `/query` endpoint

### External
- `h3` / Nitro `defineEventHandler`, `$fetch`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
