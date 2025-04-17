<script setup lang="ts">
import { useRoute } from 'vue-router'
import { secretConsoleMenu } from '~/utils/list.menu'

const route = useRoute()

// Find current page info from menu structure
const getBreadcrumbs = () => {
  const breadcrumbs: { name: string; href?: string }[] = []
  
  // Add dashboard as first breadcrumb
  breadcrumbs.push({
    name: 'Dashboard',
    href: '/console/secret/dashboard'
  })
  
  // Find current menu item
  for (const group of secretConsoleMenu) {
    const matchingItem = group.sub.find(item => route.path.startsWith(item.href || ''))
    
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

const breadcrumbs = getBreadcrumbs()
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