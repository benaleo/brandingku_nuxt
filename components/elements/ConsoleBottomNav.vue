<script setup lang="ts">
import { LayoutDashboard, UserRound } from 'lucide-vue-next'

// phones (up to 768px, where the sidebar becomes a sheet): Dashboard and Profile at the bottom
const route = useRoute()
const { firstRoute } = useConsoleAccess()
const items = computed(() => [
  { label: 'Dashboard', to: firstRoute.value === '/' ? '/console/secret/dashboard' : firstRoute.value, icon: LayoutDashboard },
  { label: 'Profile', to: '/console/secret/profile', icon: UserRound },
])
const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur min-[769px]:hidden"
    aria-label="Navigasi console"
  >
    <ul class="grid grid-cols-2">
      <li v-for="item in items" :key="item.to">
        <NuxtLink
          :to="item.to"
          class="flex flex-col items-center gap-0.5 py-2 text-xs font-medium"
          :class="isActive(item.to) ? 'text-green-700' : 'text-muted-foreground hover:text-foreground'"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          <component :is="item.icon" class="size-5" />
          {{ item.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
