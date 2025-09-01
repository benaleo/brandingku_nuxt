<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import ImageUploadField from "~/components/forms/ImageSingleUploadField.vue";
import type { ProductGallery } from '~/types/products.type'
import { Trash2 } from 'lucide-vue-next'
import { useProductGalleriesService } from '~/services/product-galleries.service'
import { useFileToBase64 } from '~/composables/useFileToBase64'

const props = defineProps<{
  modelValue: ProductGallery[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: ProductGallery[]): void
}>()

const list = ref<ProductGallery[]>(props.modelValue || [])
watch(() => props.modelValue, (v) => { list.value = v || [] }, { immediate: true })
watch(list, (v) => emit('update:modelValue', v), { deep: true })

const galleryService = useProductGalleriesService()

function addItem() {
  const newItem: ProductGallery = {
    id: Math.random().toString(36).slice(2),
    product_id: 0,
    image: '',
    orders: list.value.length + 1,
  }
  list.value.push(newItem)
}

async function removeItem(idx: number) {
  const item = list.value[idx]
  if (item && /^\d+$/.test(item.id)) {
    // It's an existing item from DB, delete it
    await galleryService.deleteProductGallery(Number(item.id))
  }
  list.value.splice(idx, 1)
  // Reorder after removal
  list.value = list.value.map((g, i) => ({ ...g, orders: i + 1 }))
}

async function onUploaded(idx: number, url: string) {
  // url may be object URL or data URL depending on child emission.
  // Keep preview as data URL when available.
  list.value[idx].image = url
}

async function onFileSelected(idx: number, f: File | null) {
  try {
    if (!f) {
      ;(list.value[idx] as any)._raw = ''
      return
    }
    const { convertToBase64 } = useFileToBase64()
    const dataUrl = await convertToBase64(f)
    const comma = dataUrl.indexOf(',')
    const raw = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
    // Store raw base64 for submit, keep image as data URL for preview
    ;(list.value[idx] as any)._raw = raw
    list.value[idx].image = dataUrl
  } catch (_) {}
}

function onDelete(idx: number, payload: { url: string, path: string, bucket: string }) {
  // Optionally enqueue deletion to parent; for now, just clear the url
  list.value[idx].image = ''
}
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-bold">Galleries</h3>
      <Button type="button" @click="addItem">Add Image</Button>
    </div>
    <div v-if="list.length === 0" class="text-sm text-muted-foreground">No gallery items. Click "Add Image".</div>

    <div class="flex flex-wrap gap-4">
      <div v-for="(g, idx) in list" :key="g.id || idx" class="border rounded p-4 relative" style="min-width: 150px; flex: 1 1 auto;">
        <Button type="button" variant="destructive" class="absolute top-2 right-2" @click="removeItem(idx)"><Trash2 /></Button>
        <div class="flex flex-col gap-4">
          <div class="w-full mt-4">
            <ImageUploadField
              v-model:fileUrl="g.image"
              label="Gallery Image"
              @update:fileUrl="(url) => onUploaded(idx, url)"
              @update:file="(f) => onFileSelected(idx, f)"
              @delete="(payload) => onDelete(idx, payload)"
            />
          </div>
          <div class="w-full">
            <label class="form-label mb-2 block">Order</label>
            <input type="number" min="1" class="form-input" v-model.number="g.orders" />
            <p class="text-xs text-muted-foreground mt-1">Lower number shows earlier.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
