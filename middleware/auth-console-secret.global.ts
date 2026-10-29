export default defineNuxtRouteMiddleware(async (to) => {
  const secret = to.path.startsWith('/console/secret')
  const auth = to.path.startsWith('/console/auth')
  if (!secret && !auth) return
  const token = useCookie<string | null>('token')
  const access = useConsoleAccess()
  if (!token.value) {
    access.clear()
    if (secret) return navigateTo('/console/auth')
    return
  }
  try {
    await access.refresh()
  } catch {
    if (secret) return navigateTo('/console/auth')
    return
  }
  if (auth) return navigateTo(access.firstRoute.value)
  if (!access.canVisit(to.path)) {
    if (to.path !== access.firstRoute.value) return navigateTo(access.firstRoute.value)
    return abortNavigation()
  }
})
