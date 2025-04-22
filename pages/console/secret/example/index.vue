<script setup>
import { ref } from 'vue'
import { toast } from 'vue-sonner'

const { uploadFile, getFileUrl } = useFileUpload()
const file = ref(null)
const fileUrl = ref(null)
const isUploading = ref(false)

const onFileChange = (event) => {
  file.value = event.target.files[0]
}

const handleUpload = async () => {
  if (!file.value) {
    toast.error('Please select a file first')
    return
  }

  isUploading.value = true
  try {
    // Upload file
    const result = await uploadFile('images', file.value.name, file.value)

    // Get the public URL if needed
    if (result) {
      fileUrl.value = await getFileUrl('images', result.path)
      toast.success('File uploaded successfully')
    }
  } catch (error) {
    console.error('Upload failed:', error)
    toast.error(`Upload failed: ${error.message || 'Unknown error'}`)
  } finally {
    isUploading.value = false
  }
}


const pageTitle = 'Example'

useHead({
  title: pageTitle,
})

definePageMeta({
  layout: 'console-secret'
})
</script>

<template>
  <div>
    <h2>Upload File</h2>
    <div>
      <input type="file" @change="onFileChange" :disabled="isUploading" />
      <button @click="handleUpload" :disabled="isUploading || !file">
        {{ isUploading ? 'Uploading...' : 'Upload' }}
      </button>
    </div>

    <div v-if="fileUrl" class="mt-4">
      <h3>Uploaded File</h3>
      <img v-if="file?.type.includes('image')" :src="fileUrl" class="max-w-sm" />
      <a v-else :href="fileUrl" target="_blank">View File</a>
    </div>
  </div>
</template>
