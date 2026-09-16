<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-09-10 | Updated: 2026-09-10 -->

# reset-password

## Purpose
The three-step password reset flow: request a code, verify it, then set a new password. Each step is its own route.

## Key Files

| File | Description |
|------|-------------|
| `index.vue` | `/console/auth/reset-password` (66 lines) — step 1, request the OTP. |
| `verify.vue` | `/console/auth/reset-password/verify` (108 lines) — step 2, submit the OTP. |
| `change-password.vue` | `/console/auth/reset-password/change-password` (107 lines) — step 3, set the new password. |

## For AI Agents

### Working In This Directory
- The steps share state through `useResetPassword`, not through route params. Navigating straight to `verify` or `change-password` lands on a page with no flow state — check that behaviour before adding links to them.
- The OTP is issued and validated by the backend (`graph/helpers/email_helper.go` sends it). Never validate or store it client-side.
- Do not put the email or OTP in the URL; the flow deliberately keeps them out of the query string.

### Testing Requirements
- Walk all three steps in `pnpm run dev` with a real backend and a mailbox you can read.

## Dependencies

### Internal
- `composables/useResetPassword.ts`
- `services/auth.service.ts`
- Backend: `resetPassword` / `verifyOTP` resolvers

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
