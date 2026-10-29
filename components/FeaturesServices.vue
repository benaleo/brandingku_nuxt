<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";

// the services from /services in short; each card opens its section there
</script>

<template>
  <section class="py-16 md:py-24 lg:max-w-6xl mx-auto">
    <div class="container px-4 mx-auto">
      <div class="mb-8 text-center">
        <h2 class="text-2xl md:text-3xl font-bold">{{ $t('app.services.title') }}</h2>
      </div>
      <div class="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <NuxtLink
          v-for="s in SERVICES"
          :key="s.id"
          :to="`/services#${s.id}`"
          class="group flex flex-col items-center rounded-xl bg-slate-50 p-4 text-center transition hover:bg-green-50 hover:shadow-md md:p-6"
        >
          <span class="mb-3 flex size-12 items-center justify-center rounded-full bg-green-100 text-green-700 md:size-14">
            <component :is="s.icon" class="size-6 md:size-7" />
          </span>
          <h3 class="font-semibold text-slate-800 group-hover:text-green-700">{{ $t(`app.services.menu.${s.key}`) }}</h3>
          <p class="mt-1 text-xs text-slate-600 md:text-sm">{{ $t(`app.services.items.${s.key}`) }}</p>
        </NuxtLink>
      </div>
      <div class="mt-8 text-center">
        <NuxtLink to="/services" class="inline-flex items-center gap-2 rounded-lg border border-green-600 px-6 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-600 hover:text-white">
          {{ $t('app.services.seeAll') }} <ArrowRight class="size-4" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
