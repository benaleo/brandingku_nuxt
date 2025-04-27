<script setup lang="ts">
import { ref, watch, type PropType } from 'vue'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { Trash2 } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

const props = defineProps({
  /**
   * v-model:fileUrl for the uploaded image URL
   */
  fileUrl: {
    type: String,
    default: ''
  },
  /**
   * v-model:file for the selected File object
   */
  file: {
    type: Object as PropType<File|null>,
    default: null
  },
  /**
   * S3 bucket or storage bucket name
   */
  bucket: {
    type: String,
    default: 'images'
  },
  /**
   * Optional label for the field
   */
  label: {
    type: String,
    default: 'Image'
  },
  /**
   * Disabled state
   */
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:fileUrl','update:file', 'delete', 'update:isUploading'])

const file = ref<File | null>(props.file)
const previewUrl = ref<string | null>(props.fileUrl || null)
const dragActive = ref(false)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const deleteConfirmOpen = ref(false)

watch(() => props.fileUrl, (val) => {
  if (val && val !== previewUrl.value) {
    previewUrl.value = val
  }
})

watch(isUploading, (val) => emit('update:isUploading', val))

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    setFile(target.files[0])
  }
}

function setFile(f: File) {
  file.value = f
  emit('update:file', f)
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

function openDeleteConfirm() {
  if (props.disabled) return;
  deleteConfirmOpen.value = true;
}

function cancelDelete() {
  deleteConfirmOpen.value = false;
}

async function confirmDelete() {
  deleteConfirmOpen.value = false;
  try {
    if (props.fileUrl) {
      const { deleteFile, getPathFromUrl } = useFileUpload();
      const path = getPathFromUrl(props.bucket, props.fileUrl);
      
      if (!path) {
        toast.error('Could not determine file path from URL');
        return;
      }
      
      // Emit delete event for parent component to handle
      emit('delete', { url: props.fileUrl, path, bucket: props.bucket });
      
      // Clear local preview
      if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = null;
      file.value = null;
      
      // Update model values
      emit('update:fileUrl', '');
      emit('update:file', null);
      
      toast.success('Image removed');
    }
  } catch (error: any) {
    toast.error(error.message || 'Failed to remove image');
  }
}

async function uploadImage() {
  if (!file.value) {
    toast.error('Please select a file first')
    return
  }
  isUploading.value = true
  try {
    // Use the same composable as ImageFormDialog.vue
    const { uploadFile, getFileUrl } = useFileUpload()
    const fileExtension = file.value.name.split('.').pop()
    const uniqueFileName = `images-${Date.now()}.${fileExtension}`
    const uploadResult = await uploadFile(props.bucket, uniqueFileName, file.value)
    if (!uploadResult) throw new Error('Upload failed')
    const url = await getFileUrl(props.bucket, uploadResult.path)
    if (!url) throw new Error('Failed to get file URL')
    emit('update:fileUrl', url)
    toast.success('Image uploaded!')
    // Optionally reset file
    file.value = null
  } catch (error: any) {
    toast.error(error.message || 'Upload failed')
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="w-full">
    <Label class="ml-1 mb-2">{{ label }}</Label>
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
        :disabled="disabled || isUploading"
      />
      <div v-if="previewUrl" class="mb-2">
        <img :src="previewUrl" alt="Preview" class="max-h-32 rounded shadow" />
      </div>
      <div v-else class="text-gray-400 flex flex-col items-center">
        <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 6l-4-4m0 0L8 6m4-4v14"/>
        </svg>
        <span>Drag & drop or click to select image</span>
      </div>

    </div>
    <Button v-if="previewUrl" @click="openDeleteConfirm" class="mt-2" variant="destructive" size="sm" type="button">
      <Trash2 class="w-4 h-4 mr-1" />
      Delete
    </Button>
    <Dialog :open="deleteConfirmOpen" @close="cancelDelete">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Image</DialogTitle>
          <DialogDescription>Are you sure you want to delete this image?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="cancelDelete">Cancel</Button>
          <Button variant="destructive" @click="confirmDelete">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
