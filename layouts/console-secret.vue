<script setup lang="ts">
import {SidebarProvider} from '@/components/ui/sidebar'
import AppSidebar from '~/components/elements/AppSidebar.vue'
import AppTopBar from "~/components/elements/AppTopBar.vue";
</script>

<template>
  <SidebarProvider>
    <div class="flex w-full min-h-screen">
      <AppSidebar/>
      <div class="flex-1 overflow-auto bg-background">
        <AppTopBar/>
        <div class="px-8 py-4">
          <slot/>
        </div>
      </div>
    </div>
  </SidebarProvider>
</template>
