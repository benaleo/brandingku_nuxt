import { defineNuxtRouteMiddleware, useCookie, navigateTo } from 'nuxt/app'

export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('token')
  // Block access to /console/secret if not logged in
  if (to.path.startsWith('/console/secret')) {
    if (!token.value) {
      return navigateTo('/console/auth')
    }
  }
  // Block access to /console/auth if already logged in
  if (to.path.startsWith('/console/auth')) {
    if (token.value) {
      return navigateTo('/console/secret/dashboard')
    }
  }
})
