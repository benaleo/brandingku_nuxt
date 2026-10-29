<script setup lang="ts">
import {SidebarProvider} from '@/components/ui/sidebar'
import AppSidebar from '~/components/elements/AppSidebar.vue'
import AppTopBar from "~/components/elements/AppTopBar.vue";
</script>

<template>
  <SidebarProvider>
    <div class="flex h-screen w-full overflow-hidden">
      <AppSidebar/>
      <!-- phones leave room for the bottom navigation -->
      <div class="flex h-screen min-w-0 flex-1 flex-col overflow-y-auto bg-background max-[768px]:pb-16">
        <AppTopBar/>
        <!-- phones keep the breadcrumb close to the bar -->
        <div class="w-full min-w-0 flex-1 px-4 pb-6 pt-1 sm:px-6 sm:py-6 lg:px-8">
          <slot/>
        </div>
        <FooterConsole/>
      </div>
      <ElementsConsoleBottomNav/>
    </div>
  </SidebarProvider>
</template>
