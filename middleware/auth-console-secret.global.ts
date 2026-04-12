import { defineNuxtRouteMiddleware, useCookie, navigateTo } from 'nuxt/app'

export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('token')
  
  // Block access to /console/secret if not logged in
  if (to.path.startsWith('/console/secret')) {
    if (!token.value) {
      return navigateTo('/console/auth')
    }
    
    // Decode JWT token to check user role
    try {
      const tokenParts = token.value.split('.')
      if (tokenParts.length !== 3) {
        return navigateTo('/console/auth')
      }
      
      const payload = tokenParts[1]
      if (!payload) {
        return navigateTo('/console/auth')
      }
      
      const decodedToken = JSON.parse(atob(payload))
      const userRole = decodedToken.role
      
      // Block users with 'user' role from accessing console/secret/*
      if (userRole === 'user') {
        return navigateTo('/')
      }
    } catch (error) {
      // If token decoding fails, redirect to auth
      return navigateTo('/console/auth')
    }
  }
  
  // Block access to /console/auth if already logged in
  if (to.path.startsWith('/console/auth')) {
    if (token.value) {
      try {
        // Decode JWT token to check user role
        const tokenParts = token.value.split('.')
        if (tokenParts.length === 3) {
          const payload = tokenParts[1]
          if (payload) {
            const decodedToken = JSON.parse(atob(payload))
            const userRole = decodedToken.role
            
            // Redirect based on user role
            if (userRole === 'user') {
              return navigateTo('/')
            } else {
              return navigateTo('/console/secret/dashboard')
            }
          }
        }
        // Fallback to dashboard if token decoding fails
        return navigateTo('/console/secret/dashboard')
      } catch (error) {
        // If token decoding fails, redirect to dashboard
        return navigateTo('/console/secret/dashboard')
      }
    }
  }
})
