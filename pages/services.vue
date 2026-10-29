<script setup lang="ts">
import { Check, MessageCircle } from 'lucide-vue-next'

const { t } = useI18n()
const { openChat } = useChatWidget()

// ids double as the anchors used by the navbar "Services" menu and the landing page cards
const services = SERVICES

// section titles reuse the navbar menu labels so both always match
const serviceName = (key: string) => t(`app.services.menu.${key}`)
const askService = (key: string) => openChat(t('app.servicesPage.serviceTopic', { service: serviceName(key) }))

useHead(() => ({
  title: t('app.servicesPage.metaTitle'),
  meta: [{ name: 'description', content: t('app.servicesPage.metaDescription') }],
}))
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-slate-700">
    <!-- Header: top padding clears the fixed navbar -->
    <div class="text-center px-4 pt-28 pb-8 md:pt-36 md:pb-10">
      <span class="text-green-600 text-xs md:text-sm font-semibold tracking-wide">{{ $t('app.servicesPage.eyebrow') }}</span>
      <h1 class="mx-auto mt-2 max-w-3xl text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800">{{ $t('app.servicesPage.title') }}</h1>
      <p class="mt-3 text-sm md:text-base text-gray-500 max-w-2xl mx-auto">{{ $t('app.servicesPage.subtitle') }}</p>
    </div>

    <div class="app-container px-4 md:px-6 pb-12 md:pb-16">
      <!-- Jump links: scroll sideways on phones, wrap from sm up -->
      <nav class="mb-8 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center" :aria-label="$t('app.servicesPage.jumpTo')">
        <NuxtLink
          v-for="s in services"
          :key="s.id"
          :to="`#${s.id}`"
          class="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-black/5 transition-colors hover:bg-green-50 hover:text-green-700"
        >
          {{ serviceName(s.key) }}
        </NuxtLink>
      </nav>

      <div class="mx-auto max-w-5xl space-y-6">
        <section
          v-for="(s, i) in services"
          :id="s.id"
          :key="s.id"
          class="scroll-mt-28 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
        >
          <div class="grid gap-6 p-6 md:grid-cols-[auto_1fr] md:gap-8 md:p-8">
            <div class="flex items-center gap-4 md:flex-col md:items-start">
              <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <component :is="s.icon" class="size-7" />
              </div>
              <span class="text-3xl font-bold text-green-600/30 md:text-4xl">{{ String(i + 1).padStart(2, '0') }}</span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-800 md:text-2xl">{{ serviceName(s.key) }}</h2>
              <p class="mt-2 text-gray-600">{{ $t(`app.servicesPage.items.${s.key}.text`) }}</p>
              <ul class="mt-4 space-y-2">
                <li v-for="n in 3" :key="n" class="flex items-start gap-2 text-sm text-gray-700">
                  <Check class="mt-0.5 size-4 shrink-0 text-green-600" />
                  {{ $t(`app.servicesPage.items.${s.key}.p${n}`) }}
                </li>
              </ul>
              <button
                type="button"
                class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 hover:underline"
                @click="askService(s.key)"
              >
                <MessageCircle class="size-4" />
                {{ $t('app.servicesPage.askService') }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- CTA -->
    <div class="bg-green-700 px-4 py-12 text-center text-white md:py-16">
      <h2 class="text-2xl font-bold md:text-3xl">{{ $t('app.servicesPage.ctaTitle') }}</h2>
      <p class="mx-auto mt-3 max-w-xl text-green-100">{{ $t('app.servicesPage.ctaText') }}</p>
      <div class="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-green-700 hover:bg-green-50"
          @click="openChat($t('app.servicesPage.generalTopic'))"
        >
          <MessageCircle class="size-5" />
          {{ $t('app.servicesPage.ctaChat') }}
        </button>
        <NuxtLink to="/product" class="inline-flex items-center justify-center rounded-lg border-2 border-white px-8 py-3 font-semibold text-white hover:bg-white hover:text-green-700">
          {{ $t('app.servicesPage.ctaProducts') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
