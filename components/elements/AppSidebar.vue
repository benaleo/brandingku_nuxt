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
import {
  BadgeCheck, Building2, ChartNoAxesCombined, ChevronDown, ExternalLink,
  Globe, Images, Inbox, LayoutDashboard, LayoutTemplate, MessageCircle, MessageSquareQuote,
  Package, ShieldCheck, ShieldUser, SlidersHorizontal, Store, Tags, UserCog,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import {useRoute} from 'vue-router'
import {useChatUnreadCount} from '~/services/chat-admin.service'

const route = useRoute()
const { menus: secretConsoleMenu } = useConsoleAccess()
const { unreadCount } = useChatUnreadCount()
const iconComponents: Record<string, Component> = {
  BadgeCheck,
  Building2,
  ChartNoAxesCombined,
  ExternalLink,
  Globe,
  Images,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  MessageCircle,
  MessageSquareQuote,
  ShieldUser,
  Package,
  ShieldCheck,
  UserCog,
  SlidersHorizontal,
  Store,
  Tags,
}

const isActive = (href: string) => {
  return route.path === href || (href !== '/' && route.path.startsWith(href + '/'))
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
                  :is="iconComponents[group.group_icon]"
                  class="h-4 w-4 shrink-0"
                  aria-hidden="true"
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
                        :class="{ 'bg-green-200': item.href ? isActive(item.href) : false }"
                    >
                      <component
                          v-if="item.icon"
                          :is="iconComponents[item.icon]"
                          class="h-4 w-4 shrink-0"
                          aria-hidden="true"
                      />
                      <span>{{ item.name }}</span>
                      <span
                          v-if="item.href === '/console/secret/chat' && unreadCount > 0"
                          class="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white"
                      >
                        {{ unreadCount > 9 ? '9+' : unreadCount }}
                      </span>
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
