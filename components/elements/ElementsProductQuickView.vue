<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { Button } from '@/components/ui/button'

interface ProductAdditional {
  name?: string
  price?: number
  moq?: number
  stock?: number
}

interface ProductType {
  id?: number | string
  name?: string
  slug?: string
  description?: string
  image?: string
  additionals?: ProductAdditional[]
  category?: { name?: string }
}

const props = defineProps<{
  modelValue: boolean
  product: ProductType | null
  baseUrl: string
  storageUrl: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { modelValue, product, baseUrl, storageUrl } = toRefs(props)

const open = computed({
  get: () => modelValue.value,
  set: (v: boolean) => emit('update:modelValue', v)
})

const productUrl = computed(() => {
  const slug = product.value?.slug || ''
  return `${baseUrl}/product/${slug}`
})

const whatsappHref = computed(() => {
  const name = product.value?.name || 'Product inquiry'
  const text = encodeURIComponent(`Halo, saya tertarik dengan ${name}.\n${productUrl.value}`)
  return `https://wa.me/?text=${text}`
})
</script>

<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- backdrop -->
      <div class="absolute inset-0 bg-black/50" @click="open = false" />
      <!-- dialog -->
      <div class="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b">
          <h3 class="text-lg font-semibold">{{ product?.name }}</h3>
          <button class="text-gray-500 hover:text-gray-700" @click="open = false">✕</button>
        </div>
        <div class="p-4 space-y-4 max-h-[70vh] overflow-auto">
          <div class="flex flex-col md:flex-row gap-4 w-full items-center">
            <img
              v-if="product?.image"
              :src="(product?.image?.startsWith('http') ? product?.image : storageUrl + product?.image) as string"
              :alt="product?.name || 'product'"
              class="w-40 h-40 object-cover rounded"
            />
            <div class="flex-1">
              <p class="text-sm text-gray-600" v-if="product?.category?.name">
                Kategori: <span class="font-medium">{{ product?.category?.name }}</span>
              </p>
              <div class="prose max-w-none mt-2" v-html="product?.description || 'Tidak ada deskripsi.'" />
            </div>
          </div>

          <div>
            <h4 class="font-semibold mb-2">Pilihan (Additionals)</h4>
            <div v-if="(product?.additionals || []).length" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                v-for="(add, idx) in product?.additionals"
                :key="idx"
                class="border rounded p-2 text-sm flex justify-between items-center"
              >
                <div>
                  <div class="font-medium">{{ add?.name || 'Varian' }}</div>
                  <div class="text-gray-500">MOQ: {{ add?.moq ?? 0 }}</div>
                </div>
                <div class="font-semibold">Rp. {{ Number(add?.price || 0) }}</div>
              </div>
            </div>
            <p v-else class="text-sm text-gray-500">Tidak ada pilihan tambahan.</p>
          </div>
        </div>
        <div class="px-4 py-3 border-t flex items-center justify-between">
          <a :href="productUrl" target="_blank" rel="noopener" class="text-sm text-gray-600 hover:underline">Lihat detail</a>
          <a :href="whatsappHref" target="_blank" rel="noopener">
            <Button variant="default">Chat via WhatsApp</Button>
          </a>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
