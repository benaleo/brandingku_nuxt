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
  Globe, Images, Inbox, LayoutDashboard, LayoutTemplate, Mail, MessageCircle, MessageSquareQuote,
  Package, ReceiptText, ShieldCheck, ShoppingBag, ShieldUser, SlidersHorizontal, Stamp, Store, Tags, TicketPercent, UserCog, Wallet,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import {useRoute} from 'vue-router'
import {useChatUnreadCount} from '~/services/chat-admin.service'

const route = useRoute()
const { menus: secretConsoleMenu, can } = useConsoleAccess()
const { unreadCount } = useChatUnreadCount()

// unfinished transactions; refreshed on navigation and every minute
const ORDERS_HREF = '/console/secret/orders'
const { count: openOrders, refresh: refreshOpenOrders } = useOpenOrderCount()
const refreshOrders = () => { if (can('orders.index')) refreshOpenOrders() }
let ordersTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  refreshOrders()
  ordersTimer = setInterval(refreshOrders, 60_000)
})
onBeforeUnmount(() => clearInterval(ordersTimer))
watch(() => route.path, refreshOrders)
const badgeOf = (href: string) => href === '/console/secret/chat' ? unreadCount.value : href === ORDERS_HREF ? openOrders.value : 0
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
  Mail,
  MessageCircle,
  MessageSquareQuote,
  ShieldUser,
  Package,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  UserCog,
  SlidersHorizontal,
  Stamp,
  Store,
  Tags,
  TicketPercent,
  Wallet,
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
                          v-if="badgeOf(item.href) > 0"
                          class="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white"
                          :title="item.href === ORDERS_HREF ? `${openOrders} transaksi belum selesai` : undefined"
                      >
                        {{ badgeOf(item.href) > 99 ? '99+' : badgeOf(item.href) }}
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
