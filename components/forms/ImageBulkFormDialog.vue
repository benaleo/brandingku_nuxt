<script setup lang="ts">
import { type PropType, ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'vue-sonner'
import { XIcon, Trash2Icon } from 'lucide-vue-next'
import type {ProductGallery} from "~/types/products.type";
import { useFileToBase64 } from "~/composables/useFileToBase64";
import { useProductGalleriesService } from "~/services/product-galleries.service";

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

const config = useRuntimeConfig();
const STORAGE_URL = config.public.STORAGE_URL

const props = defineProps({
  submit: {
    type: Function as PropType<(fileUrls: string[], removeIds: string[]) => void | Promise<void>>,
    required: false,
  },
  bucket: {
    type: String,
    default: 'images'
  },
  productId: {
    type: String,
    required: true
  },
  galleries: {
    type: Array as PropType<ProductGallery[]>,
    default: () => []
  }
})

const emit = defineEmits(['close'])

const files = ref<FileWithPreview[]>([])
const dragActive = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const removeIds = ref<string[]>([])
const galleries = ref<ProductGallery[]>([...props.galleries])
const isUploading = ref(false)

function removeGalleryItem(galleryItem: ProductGallery) {
  if (galleryItem.id) {
    removeIds.value.push(galleryItem.id)
    galleries.value = galleries.value.filter(g => g.id !== galleryItem.id)
    toast.success('Image marked for removal')
  }
}

function removeFile(id: string) {
  const fileToRemove = files.value.find(f => f.id === id)
  if (fileToRemove) {
    URL.revokeObjectURL(fileToRemove.preview)
  }
  files.value = files.value.filter(f => f.id !== id)
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    addFiles(Array.from(target.files))
  }
}

function addFiles(newFiles: File[]) {
  for (const file of newFiles) {
    if (!file.type.startsWith('image/')) continue
    
    const preview = URL.createObjectURL(file)
    files.value.push({
      file,
      preview,
      id: crypto.randomUUID()
    })
  }
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  dragActive.value = false
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    addFiles(Array.from(e.dataTransfer.files))
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  dragActive.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  dragActive.value = false
}

async function handleSubmit() {
  if (files.value.length === 0 && removeIds.value.length === 0) {
    toast.error('Please select at least one image to upload or mark an existing image for removal')
    return
  }

  isUploading.value = true

  try {
    const createdIds: number[] = []
    let deletedCount = 0
    const failedUploads: string[] = []
    const { convertToBase64 } = useFileToBase64()
    const { createProductGallery, deleteProductGallery } = useProductGalleriesService()

    // Create galleries for new files
    if (files.value.length > 0) {
      for (let idx = 0; idx < files.value.length; idx++) {
        const fileItem = files.value[idx]
        try {
          const b64 = await convertToBase64(fileItem.file)
          const created = await createProductGallery({
            image: b64,
            orders: idx,
            product_id: Number(props.productId)
          })
          if (created?.id) createdIds.push(Number(created.id))
        } catch (err) {
          console.error(`Error creating gallery for ${fileItem.file.name}:`, err)
          failedUploads.push(fileItem.file.name)
        }
      }
      if (failedUploads.length > 0) {
        toast.warning(`${failedUploads.length} image(s) failed to upload. ${createdIds.length} image(s) uploaded successfully.`)
      }
    }

    // Delete marked galleries
    if (removeIds.value.length > 0) {
      for (const id of removeIds.value) {
        try {
          const ok = await deleteProductGallery(Number(id))
          if (ok) deletedCount++
        } catch (err) {
          console.error(`Error deleting gallery id ${id}:`, err)
        }
      }
    }

    // Optional callback (backward compatibility)
    if (props.submit) {
      await props.submit([], removeIds.value)
    }
    
    files.value.forEach(f => URL.revokeObjectURL(f.preview))
    files.value = []
    removeIds.value = []
    emit('close')
    
    if (createdIds.length > 0 && deletedCount > 0) {
      toast.success(`Successfully updated images (${createdIds.length} added, ${deletedCount} removed)`)
    } else if (createdIds.length > 0) {
      toast.success(`Successfully uploaded ${createdIds.length} image${createdIds.length > 1 ? 's' : ''}`)
    } else if (deletedCount > 0) {
      toast.success(`Successfully removed ${deletedCount} image${deletedCount > 1 ? 's' : ''}`)
    }
  } catch (error: any) {
    console.error('Error during operation:', error)
    toast.error(error.message || 'Operation failed')
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Upload Images</DialogTitle>
        <DialogDescription>
          Add new images or remove existing ones
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleSubmit">
        <!-- Existing gallery previews -->
        <div v-if="galleries.length > 0" class="w-full grid grid-cols-3 gap-2 mb-4">
          <div v-for="gallery in galleries" :key="gallery.id" class="relative">
            <img :src="gallery.image ? `${STORAGE_URL}${gallery.image}` : ''" alt="Gallery preview" class="w-full h-24 object-cover rounded shadow"/>
            <button 
              type="button" 
              @click="removeGalleryItem(gallery)"
              class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"
            >
              <Trash2Icon class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <!-- Upload area -->
        <div
          class="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors"
          :class="dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
          @click="fileInput?.click()"
          style="min-height: 160px;"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="onFileChange"
            :disabled="isUploading"
          />
          
          <div v-if="files.length > 0" class="w-full grid grid-cols-3 gap-2 mb-2">
            <div v-for="file in files" :key="file.id" class="relative">
              <img :src="file.preview" class="w-full h-24 object-cover rounded shadow" />
              <button
                type="button"
                @click.stop="removeFile(file.id)"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600"
              >
                <XIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div v-if="files.length === 0" class="text-gray-400 flex flex-col items-center">
            <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 6l-4-4m0 0L8 6m4-4v14"/>
            </svg>
            <p class="mt-2 text-sm">Drag & drop images here or click to browse</p>
          </div>
        </div>
        
        <div class="mt-4 flex justify-between">
          <div class="text-sm text-gray-500">
            {{ files.length + galleries.length }} image{{ files.length + galleries.length !== 1 ? 's' : '' }} selected
          </div>
          <Button type="submit" :disabled="(files.length === 0 && removeIds.length === 0) || isUploading">
            {{ isUploading ? `Uploading (${files.length} images)...` : 'Simpan' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>