<script setup lang="ts">
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '~/components/elements/AppSidebar.vue'
</script>

<template>
  <SidebarProvider>
    <div class="flex min-h-screen">
      <AppSidebar />
      <div class="flex-1 overflow-auto bg-background">
        <slot />
      </div>
    </div>
  </SidebarProvider>
</template>
