<script setup lang="ts">
import { type PropType, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'vue-sonner'
import { XIcon } from 'lucide-vue-next'
import type {ProductGalleriesList} from "~/types/products.type";

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

const props = defineProps({
  submit: {
    type: Function as PropType<(fileUrls: string[], removeIds: string[]) => void | Promise<void>>,
    required: true,
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
    type: Array as PropType<ProductGalleriesList[]>,
  }
})

const emit = defineEmits(['close'])

onMounted(() => {
  console.log("galleries list", props.galleries)
})

const files = ref<FileWithPreview[]>([])
const dragActive = ref(false)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const removeIds = ref<string[]>([])

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

function removeFile(id: string) {
  const fileToRemove = files.value.find(f => f.id === id)
  if (fileToRemove) {
    URL.revokeObjectURL(fileToRemove.preview)
  }
  files.value = files.value.filter(f => f.id !== id)
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
  if (files.value.length === 0) {
    toast.error('Please select at least one image')
    return
  }

  isUploading.value = true

  try {
    const { uploadFile, getFileUrl } = useFileUpload()
    const fileUrls: string[] = []
    const failedUploads: string[] = []

    // Upload each file
    for (const fileItem of files.value) {
      try {
        // Generate a unique filename to avoid conflicts
        const fileExtension = fileItem.file.name.split('.').pop()
        const uniqueFileName = `product-${props.productId}-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExtension}`

        // Upload to S3 - authentication is handled inside uploadFile
        const uploadResult = await uploadFile(props.bucket, uniqueFileName, fileItem.file)

        if (!uploadResult) {
          failedUploads.push(fileItem.file.name)
          continue
        }

        // Get the public URL
        const fileUrl = await getFileUrl(props.bucket, uploadResult.path)

        if (!fileUrl) {
          failedUploads.push(fileItem.file.name)
          continue
        }

        fileUrls.push(fileUrl)
      } catch (fileError: any) {
        console.error(`Error uploading ${fileItem.file.name}:`, fileError)
        failedUploads.push(fileItem.file.name)
      }
    }

    // If we have some successful uploads but some failed
    if (fileUrls.length > 0 && failedUploads.length > 0) {
      toast.warning(`${failedUploads.length} image(s) failed to upload. Successfully uploaded ${fileUrls.length} image(s).`)
    } 
    // If all uploads failed
    else if (fileUrls.length === 0) {
      throw new Error('All uploads failed. Please check your connection and try again.')
    }

    // Send all URLs to the parent component
    if (fileUrls.length > 0) {
      await props.submit(fileUrls, removeIds.value)
      
      // Reset form
      files.value.forEach(f => URL.revokeObjectURL(f.preview))
      files.value = []
      removeIds.value = []
      emit('close')
      
      toast.success(`Successfully uploaded ${fileUrls.length} image${fileUrls.length > 1 ? 's' : ''}`)
    }
  } catch (error: any) {
    console.error('Error during upload:', error)
    toast.error(error.message || 'Upload failed')
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline">
        <slot/>
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Bulk Upload Images</DialogTitle>
        <DialogDescription>
          Drag and drop multiple images here, or click to select. You can upload multiple images at once.
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleSubmit">
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
              <img :src="file.preview" alt="Preview" class="w-full h-24 object-cover rounded shadow"/>
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
            <span>Drag & drop or click to select multiple images</span>
          </div>
        </div>
        
        <div class="mt-4 flex justify-between">
          <div class="text-sm text-gray-500">
            {{ files.length }} image{{ files.length !== 1 ? 's' : '' }} selected
          </div>
          <Button type="submit" :disabled="files.length === 0 || isUploading">
            {{ isUploading ? `Uploading (${files.length} images)...` : 'Upload All' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>