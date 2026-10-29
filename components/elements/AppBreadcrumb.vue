<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const { menus: secretConsoleMenu, firstRoute } = useConsoleAccess()

// Find current page info from menu structure
const getBreadcrumbs = () => {
  const breadcrumbs: { name: string; href?: string }[] = []
  
  // Add dashboard as first breadcrumb
  breadcrumbs.push({
    name: 'Dashboard',
    href: firstRoute.value
  })
  
  // Find current menu item
  for (const group of secretConsoleMenu.value) {
    const matchingItem = group.sub.find(item => item.href !== '/' && (route.path === item.href || route.path.startsWith(item.href + '/')))
    
    if (matchingItem) {
      // Only add group if it has multiple items
      if (group.sub.length > 1) {
        breadcrumbs.push({
          name: group.group_name,
          href: group.sub[0]?.href
        })
      }
      
      breadcrumbs.push({
        name: matchingItem.name,
        href: matchingItem.href
      })
      break
    }
  }
  
  return breadcrumbs
}

const breadcrumbs = computed(getBreadcrumbs)
</script>

<template>
  <div class="flex items-center gap-2 py-4 text-sm">
    <template v-for="(crumb, index) in breadcrumbs" :key="crumb.name">
      <NuxtLink 
        v-if="crumb.href && index < breadcrumbs.length - 1" 
        :to="crumb.href"
        class="text-muted-foreground hover:text-primary"
      >
        {{ crumb.name }}
      </NuxtLink>
      <span v-else class="text-foreground">
        {{ crumb.name }}
      </span>
      <span v-if="index < breadcrumbs.length - 1" class="text-muted-foreground">/</span>
    </template>
  </div>
</template>
