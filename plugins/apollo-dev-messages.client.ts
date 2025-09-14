// Loads Apollo Client dev and error messages only in development to keep prod bundles lean
// See: https://www.apollographql.com/docs/react/v3.8/errors

if (import.meta.dev) {
  // Import inside guard to avoid bundling in production
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { loadDevMessages, loadErrorMessages } = require('@apollo/client/dev')
  try {
    loadDevMessages()
    loadErrorMessages()
  } catch {
    // no-op if the dev helpers are unavailable
  }
}
