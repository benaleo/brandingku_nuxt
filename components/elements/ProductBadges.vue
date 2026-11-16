<script setup lang="ts">
import { Flame, ThumbsUp } from 'lucide-vue-next'

defineProps<{ product: { is_upsell?: boolean; is_highlight?: boolean; is_recommended?: boolean } }>()
</script>

<template>
  <div
    v-if="product.is_upsell || product.is_highlight || product.is_recommended"
    class="absolute right-2 top-2 flex flex-wrap items-center justify-end gap-1"
  >
    <span v-if="product.is_upsell" class="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-semibold uppercase text-white shadow">
      {{ $t('app.productPage.badge.promo') }}
    </span>
    <span
      v-if="product.is_highlight"
      class="flex items-center rounded-full bg-orange-500 px-1.5 py-0.5 text-white shadow"
      :title="$t('app.productPage.badge.highlight')"
    >
      <Flame v-for="n in 3" :key="n" class="-mr-1 h-3.5 w-3.5 last:mr-0" aria-hidden="true" />
      <span class="sr-only">{{ $t('app.productPage.badge.highlight') }}</span>
    </span>
    <span
      v-if="product.is_recommended"
      class="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white shadow"
      :title="$t('app.productPage.badge.recommended')"
    >
      <ThumbsUp class="h-3.5 w-3.5" aria-hidden="true" />
      <span class="sr-only">{{ $t('app.productPage.badge.recommended') }}</span>
    </span>
  </div>
</template>
