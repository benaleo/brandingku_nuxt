<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

interface ProductAdditional {
  name?: string
  price?: number
  moq?: number
  stock?: number
  is_active?: boolean
}

interface ProductType {
  id?: number | string
  name?: string
  slug?: string
  description?: string
  image?: string
  galleries?: { image?: string; orders?: number }[]
  colors?: { name?: string; image?: string }[]
  additionals?: ProductAdditional[]
  category?: { name?: string }
}

const props = defineProps<{
  modelValue: boolean
  product: ProductType | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const { t, locale } = useI18n()
const config = useRuntimeConfig()
const { openChat } = useChatWidget()
const mediaUrl = useMediaUrl()

const productPath = computed(() => `/product/${props.product?.slug || ''}`)

const activeAdditionals = computed(() =>
  (props.product?.additionals || []).filter((a) => a?.is_active !== false),
)

const minPrice = computed(() => {
  const prices = activeAdditionals.value.map((a) => Number(a?.price) || 0).filter((n) => n > 0)
  return prices.length ? Math.min(...prices) : 0
})
const hasManyPrices = computed(() => new Set(activeAdditionals.value.map((a) => Number(a?.price) || 0)).size > 1)
const minMoq = computed(() => {
  const moqs = activeAdditionals.value.map((a) => Number(a?.moq) || 0).filter((n) => n > 0)
  return moqs.length ? Math.min(...moqs) : 0
})
const inStock = computed(() => activeAdditionals.value.some((a) => (Number(a?.stock) || 0) > 0))

const formatPrice = (n: number) =>
  new Intl.NumberFormat(locale.value === 'en' ? 'en-ID' : 'id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n)

const colorNames = computed(() => {
  const names = (props.product?.colors || []).map((c) => c?.name).filter(Boolean) as string[]
  return [...new Set(names)]
})

// tags removed on purpose: the description is rich text and only a teaser is shown here
const shortDescription = computed(() =>
  (props.product?.description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim(),
)

const toUrl = mediaUrl
const images = computed(() => {
  const p = props.product
  if (!p) return []
  const gal = [...(p.galleries || [])]
    .sort((a, b) => (a.orders ?? 0) - (b.orders ?? 0))
    .map((g) => toUrl(g.image))
  return [...new Set([toUrl(p.image), ...gal].filter(Boolean))]
})

const active = ref(0)
const broken = ref<Record<string, boolean>>({})
watch(() => props.product, () => { active.value = 0 })
const step = (d: number) => {
  const n = images.value.length
  if (n) active.value = (active.value + d + n) % n
}

const chatAboutProduct = () => {
  open.value = false
  const url = `${config.public.BASE_URL}${productPath.value}`
  openChat(
    t('app.productPage.quickViewDialog.interestedMessage', {
      name: props.product?.name || t('app.productPage.quickViewDialog.thisProduct'),
      url,
    }),
  )
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="top-auto bottom-0 left-0 flex max-h-[92dvh] w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-b-none rounded-t-2xl border-0 p-0 sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-h-[85vh] sm:max-w-4xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border"
    >
      <div class="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-gray-200 sm:hidden" aria-hidden="true" />

      <div class="grid min-h-0 flex-1 overflow-y-auto overscroll-contain sm:grid-cols-2 sm:overflow-hidden">
        <!-- gallery -->
        <div class="min-w-0 bg-gray-50 p-4 sm:overflow-y-auto sm:p-6">
          <div class="relative aspect-square overflow-hidden rounded-xl bg-white">
            <img
              v-if="images[active] && !broken[images[active]!]"
              :key="images[active]"
              :src="images[active]"
              :alt="$t('app.productPage.detail.imageAlt', { n: active + 1 })"
              class="h-full w-full object-cover"
              @error="broken[images[active]!] = true"
            />
            <div v-else class="flex h-full w-full items-center justify-center text-6xl font-bold uppercase text-green-700/40">
              {{ product?.name?.charAt(0) }}
            </div>
            <template v-if="images.length > 1">
              <button
                type="button"
                class="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow focus-visible:ring-2 focus-visible:ring-green-700"
                :aria-label="$t('app.productPage.prevPage')"
                @click="step(-1)"
              >
                <ChevronLeft class="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow focus-visible:ring-2 focus-visible:ring-green-700"
                :aria-label="$t('app.productPage.nextPage')"
                @click="step(1)"
              >
                <ChevronRight class="h-5 w-5" aria-hidden="true" />
              </button>
            </template>
          </div>
          <div v-if="images.length > 1" class="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              v-for="(src, i) in images"
              :key="src"
              type="button"
              class="h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white focus-visible:ring-2 focus-visible:ring-green-700"
              :class="i === active ? 'border-green-700' : 'border-transparent'"
              :aria-label="$t('app.productPage.detail.imageAlt', { n: i + 1 })"
              :aria-current="i === active ? 'true' : undefined"
              @click="active = i"
            >
              <img :src="src" alt="" loading="lazy" class="h-full w-full object-cover" />
            </button>
          </div>
        </div>

        <!-- info -->
        <div class="min-w-0 space-y-4 p-4 sm:overflow-y-auto sm:p-6">
          <div>
            <p v-if="product?.category?.name" class="text-xs font-medium uppercase tracking-wide text-green-700">
              {{ product.category.name }}
            </p>
            <DialogTitle class="mt-1 break-words pr-8 text-xl font-semibold leading-snug text-gray-900">
              {{ product?.name }}
            </DialogTitle>
            <DialogDescription class="mt-1 break-all text-xs text-gray-500">
              {{ product?.slug }}
            </DialogDescription>
          </div>

          <div v-if="minPrice">
            <p v-if="hasManyPrices" class="text-xs text-gray-500">{{ $t('app.productPage.startingFrom') }}</p>
            <p class="text-2xl font-bold text-green-700">
              {{ formatPrice(minPrice) }}<span class="ml-1 text-sm font-normal text-gray-500">{{ $t('app.productPage.perPcs') }}</span>
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-sm">
            <span
              class="rounded-full px-2.5 py-1 text-xs font-medium"
              :class="inStock ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-600'"
            >
              {{ inStock ? $t('app.productPage.detail.available') : $t('app.productPage.detail.unavailable') }}
            </span>
            <span v-if="minMoq" class="text-gray-600">{{ $t('app.productPage.detail.moq') }} {{ minMoq }} pcs</span>
          </div>

          <div v-if="colorNames.length">
            <p class="mb-1.5 text-sm font-medium text-gray-900">{{ $t('app.productPage.detail.color') }}</p>
            <ul class="flex flex-wrap gap-1.5">
              <li v-for="c in colorNames" :key="c" class="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700">
                {{ c }}
              </li>
            </ul>
          </div>

          <p v-if="shortDescription" class="line-clamp-4 break-words text-sm leading-relaxed text-gray-600">
            {{ shortDescription }}
          </p>
        </div>
      </div>

      <!-- actions, pinned under the scroll area -->
      <div class="flex shrink-0 flex-col-reverse gap-2 border-t bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6">
        <Button type="button" variant="outline" class="h-11 sm:h-10" @click="chatAboutProduct">
          <MessageCircle class="h-4 w-4" aria-hidden="true" />
          {{ $t('app.productPage.quickViewDialog.chatAdmin') }}
        </Button>
        <Button as-child class="h-11 sm:h-10">
          <NuxtLink :to="productPath" @click="open = false">
            {{ $t('app.productPage.quickViewDialog.viewDetail') }}
          </NuxtLink>
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
