<script setup lang="ts">
import { type PropType, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'vue-sonner'

const props = defineProps({
  submit: {
    type: Function as PropType<(fileUrl: string, file: File) => void | Promise<void>>,
    required: true,
  },
  bucket: {
    type: String,
    default: 'images'
  }
})

const emit = defineEmits(['close'])

const file = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const dragActive = ref(false)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    setFile(target.files[0])
  }
}

function setFile(f: File) {
  file.value = f
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(f)
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  dragActive.value = false
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
    setFile(e.dataTransfer.files[0])
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
  if (!file.value) {
    toast.error('Please select a file first')
    return
  }

  isUploading.value = true

  try {
    const { uploadFile, getFileUrl } = useFileUpload()

    // Generate a unique filename to avoid conflicts
    const fileExtension = file.value.name.split('.').pop()
    const uniqueFileName = `images-${Date.now()}.${fileExtension}`

    // Upload to S3
    const uploadResult = await uploadFile(props.bucket, uniqueFileName, file.value)

    if (!uploadResult) {
      throw new Error('Upload failed')
    }

    // Get the public URL
    const fileUrl = await getFileUrl(props.bucket, uploadResult.path)

    if (!fileUrl) {
      throw new Error('Failed to get file URL')
    }

    // Send the URL to the parent component
    await props.submit(fileUrl, file.value)

    // Reset form
    file.value = null
    previewUrl.value = null
    emit('close')
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
    <DialogContent class="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>Upload Image</DialogTitle>
        <DialogDescription>
          Drag and drop an image here, or click to select. Only one image can be uploaded at a time.
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
              class="hidden"
              @change="onFileChange"
              :disabled="isUploading"
          />
          <div v-if="previewUrl" class="mb-2">
            <img :src="previewUrl" alt="Preview" class="max-h-32 rounded shadow"/>
          </div>
          <div v-else class="text-gray-400 flex flex-col items-center">
            <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 6l-4-4m0 0L8 6m4-4v14"/>
            </svg>
            <span>Drag & drop or click to select image</span>
          </div>
        </div>
        <DialogFooter class="mt-4">
          <Button type="submit" :disabled="!file || isUploading">
            {{ isUploading ? 'Uploading...' : 'Upload' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>