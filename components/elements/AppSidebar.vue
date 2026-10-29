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
  Globe, Images, Inbox, LayoutDashboard, LayoutTemplate, Mail, MessageCircle, MessageSquareQuote, MessagesSquare,
  Package, ReceiptText, ShieldAlert, ShieldCheck, ShoppingBag, ShieldUser, SlidersHorizontal, Stamp, Store, Tags, TicketPercent, UserCog, Users, Wallet,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import {useRoute} from 'vue-router'
import {toast} from 'vue-sonner'
import {useChatUnreadCount} from '~/services/chat-admin.service'
import {useDiscussionIncoming, useDiscussionInboxCount} from '~/services/discussion.service'
import {useAftercareService} from '~/services/aftercare.service'

const route = useRoute()
const router = useRouter()
const { menus: secretConsoleMenu, can } = useConsoleAccess()
const CHAT_HREF = '/console/secret/chat'
const { unreadCount } = useChatUnreadCount(() => {
  if (route.path.startsWith(CHAT_HREF)) return
  toast.info('Chat baru masuk', { action: { label: 'Buka', onClick: () => router.push(CHAT_HREF) } })
})

// discussions with unread messages; new customer messages also show a toast unless that
// thread is already on screen
const DISCUSSIONS_HREF = '/console/secret/discussions'
const { count: openDiscussions, refresh: refreshDiscussions } = useDiscussionInboxCount()
const onScreen = useDiscussionOnScreen()
const { start: startIncoming } = useDiscussionIncoming(({ message, label, link }) => {
  refreshDiscussions()
  if (onScreen(message.subject_type, message.subject_id)) return
  toast.info(`Diskusi baru · ${label}`, {
    description: `${message.author_name}: ${message.message || message.attachment?.file_name || ''}`,
    action: { label: 'Buka', onClick: () => router.push(link) },
  })
})
// console access may still be loading when the sidebar mounts
onMounted(() => watch(() => can('discussions.index'), (allowed) => {
  if (!allowed) return
  refreshDiscussions()
  startIncoming(refreshDiscussions)
}, { immediate: true }))
watch(useDiscussionInboxStale(), () => { if (can('discussions.index')) refreshDiscussions() })

// customers' testimonials waiting for moderation and new guarantee claims; refreshed like the order count
const TESTIMONIALS_HREF = '/console/secret/landing-page/testimonial'
const GUARANTEES_HREF = '/console/secret/guarantees'
const { getConsoleCounts } = useAftercareService()
const aftercare = ref({ testimonialsPendingCount: 0, guaranteeClaimsOpenCount: 0 })
const refreshAftercare = async () => {
  try {
    aftercare.value = await getConsoleCounts(can('testimonials.index'), can('guarantees.index'))
  } catch {
    // the badges keep their last value
  }
}
let aftercareTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  refreshAftercare()
  aftercareTimer = setInterval(refreshAftercare, 60_000)
})
onBeforeUnmount(() => clearInterval(aftercareTimer))
watch([() => route.path, useAftercareCountsStale(), () => can('testimonials.index') || can('guarantees.index')], refreshAftercare)

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
const badges: Record<string, () => number> = {
  [CHAT_HREF]: () => unreadCount.value,
  [ORDERS_HREF]: () => openOrders.value,
  [DISCUSSIONS_HREF]: () => openDiscussions.value,
  [TESTIMONIALS_HREF]: () => aftercare.value.testimonialsPendingCount,
  [GUARANTEES_HREF]: () => aftercare.value.guaranteeClaimsOpenCount,
}
const badgeTitles: Record<string, (n: number) => string> = {
  [ORDERS_HREF]: n => `${n} transaksi belum selesai`,
  [DISCUSSIONS_HREF]: n => `${n} diskusi belum dibaca`,
  [TESTIMONIALS_HREF]: n => `${n} ulasan customer menunggu moderasi`,
  [GUARANTEES_HREF]: n => `${n} klaim garansi baru`,
}
const badgeOf = (href: string) => badges[href]?.() ?? 0
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
  MessagesSquare,
  ShieldUser,
  Package,
  ReceiptText,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  UserCog,
  Users,
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
                          :title="badgeTitles[item.href]?.(badgeOf(item.href))"
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
