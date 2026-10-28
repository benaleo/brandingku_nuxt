<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Bell, CheckCheck } from 'lucide-vue-next'
import type { AppNotification } from '~/types/notification.type'

// notifications belong to an account; login brings the visitor back here
definePageMeta({
  middleware: (to) => {
    if (!useCookie<string | null>('token').value) return navigateTo({ path: '/console/auth', query: { redirect: to.fullPath } })
  },
})

const { t } = useI18n()
const router = useRouter()
const { feed, refresh, markRead, markAllRead } = useNotifications()

useHead(() => ({ title: t('app.notifications.title'), meta: [{ name: 'robots', content: 'noindex' }] }))

// the bell keeps the feed live; this only catches up when the page is opened directly
onMounted(() => refresh())

// opened from a link there is no page to go back to
const goBack = () => (window.history.state?.back ? router.back() : router.push('/'))

const openNotification = async (n: AppNotification) => {
  if (!n.read) markRead(n.id).catch(() => {})
  await router.push(n.link)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
    <div class="app-container px-4 pb-16 pt-28 md:px-6">
      <div class="mx-auto max-w-2xl">
        <button type="button" class="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-green-700" @click="goBack">
          <ArrowLeft class="size-4" /> {{ $t('app.notifications.back') }}
        </button>
        <div class="mb-5 flex items-end justify-between gap-3">
          <h1 class="text-2xl font-bold text-slate-900 md:text-3xl">{{ $t('app.notifications.title') }}</h1>
          <button
            v-if="feed.unread_count"
            type="button"
            class="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-green-700 hover:underline"
            @click="markAllRead().catch(() => {})"
          >
            <CheckCheck class="size-4" /> {{ $t('app.notifications.markAll') }}
          </button>
        </div>

        <!-- running quotations stay on top until they move on, so they always count -->
        <section v-if="feed.quotations.length" class="mb-6">
          <h2 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{{ $t('app.notifications.quotations') }}</h2>
          <div class="space-y-2">
            <ElementsNotificationQuotationCard v-for="q in feed.quotations" :key="q.order_id" :quotation="q" />
          </div>
        </section>

        <section>
          <h2 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{{ $t('app.notifications.others') }}</h2>
          <div v-if="!feed.items.length" class="rounded-xl border bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm">
            <Bell class="mx-auto mb-2 size-8 text-slate-300" />
            {{ $t('app.notifications.empty') }}
          </div>
          <ul v-else class="divide-y overflow-hidden rounded-xl border bg-white shadow-sm">
            <li v-for="n in feed.items" :key="n.id">
              <button
                type="button"
                class="block w-full px-4 py-3 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                :class="!n.read && 'bg-green-50/70'"
                @click="openNotification(n)"
              >
                <ElementsNotificationRow :notification="n" />
              </button>
            </li>
          </ul>
        </section>

        <NuxtLink to="/profile/order-histories" class="mt-6 block text-center text-sm font-medium text-green-700 hover:underline">
          {{ $t('app.notifications.viewOrders') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
