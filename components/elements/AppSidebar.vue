<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '@/components/ui/collapsible'
import {Box, ChevronDown, Home, Layers, LayoutDashboard, Package, ShieldCheck, ShieldUser, UserCog} from 'lucide-vue-next'
import {secretConsoleMenu} from '~/utils/list.menu'
import {useRoute} from 'vue-router'

const route = useRoute()
const iconComponents = {
  Home,
  LayoutDashboard,
  ShieldUser,
  Package,
  Box,
  ShieldCheck,
  UserCog,
  Product: Package,
  'Produk Kategori': Layers
}

const isActive = (href: string) => {
  return route.path === href || route.path.startsWith(href)
}
</script>

<template>
  <Sidebar class="w-64 border-r">
    <SidebarContent>
      <Collapsible
          v-for="group in secretConsoleMenu"
          :key="group.group_name"
          defaultOpen
          class="group/collapsible"
      >
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <CollapsibleTrigger class="w-full flex items-center gap-2">
              <component
                  v-if="group.group_icon"
                  :is="iconComponents[group.group_icon] || iconComponents[group.group_name]"
                  class="h-4 w-4"
              />
              <span>{{ group.group_name }}</span>
              <ChevronDown class="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180"/>
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem v-for="item in group.sub" :key="item.name">
                  <SidebarMenuButton asChild>
                    <NuxtLink
                        :to="item.href"
                        class="flex items-center gap-2 px-4 py-2"
                        :class="{ 'bg-green-200': isActive(item.href) }"
                    >
                      <component
                          v-if="item.icon"
                          :is="iconComponents[item.icon] || iconComponents[item.name]"
                          class="h-4 w-4"
                      />
                      <span>{{ item.name }}</span>
                    </NuxtLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>
    </SidebarContent>
  </Sidebar>
</template>