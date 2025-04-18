<script setup lang="ts">
import {type PropType, ref} from 'vue'
import {Button} from '@/components/ui/button'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,} from '@/components/ui/dialog'
import {Input} from '@/components/ui/input'

const props = defineProps({
  submit: {
    type: Function as PropType<(...args: any[]) => void>,
    required: true,
  },
})

const emit = defineEmits(['close'])

const file = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const dragActive = ref(false)

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
  if (file.value) {
    await props.submit(file.value)
    file.value = null
    previewUrl.value = null
    emit('close')
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
            @click="$refs.fileInput.click()"
            style="min-height: 160px;"
        >
          <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileChange"
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
          <Button type="submit" :disabled="!file">Upload</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>