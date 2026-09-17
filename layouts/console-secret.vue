<script setup lang="ts">
import {SidebarProvider} from '@/components/ui/sidebar'
import AppSidebar from '~/components/elements/AppSidebar.vue'
import AppTopBar from "~/components/elements/AppTopBar.vue";
</script>

<template>
  <SidebarProvider>
    <div class="flex h-screen w-full overflow-hidden">
      <AppSidebar/>
      <div class="flex h-screen min-w-0 flex-1 flex-col overflow-y-auto bg-background">
        <AppTopBar/>
        <div class="w-full min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <slot/>
        </div>
        <FooterConsole/>
      </div>
    </div>
  </SidebarProvider>
</template>
