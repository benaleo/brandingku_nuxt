<script setup lang="ts">
import type { PortfolioGallery } from "~/types/portfolio.type";
import { ref, computed } from "vue";
import { useFileToBase64 } from "~/composables/useFileToBase64";
import ImageUploadField from "~/components/forms/ImageSingleUploadField.vue";
import { Button } from "~/components/ui/button";

interface Props {
  gallery: PortfolioGallery;
  index: number;
}

interface Emits {
  (e: 'update', index: number, gallery: PortfolioGallery): void;
  (e: 'remove', index: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { convertToBase64 } = useFileToBase64();
const isUploading = ref(false);

const imageUrl = computed(() => {
  if (!props.gallery.file) return '';
  const config = useRuntimeConfig();
  const STORAGE_URL = config.public.STORAGE_URL;
  
  // Check if it's already a full URL or base64
  if (props.gallery.file.startsWith('http') || props.gallery.file.startsWith('data:')) {
    return props.gallery.file;
  }
  
  return `${STORAGE_URL}/${props.gallery.file}`;
});

const handleFileUpload = async (file: File) => {
  try {
    isUploading.value = true;
    const base64 = await convertToBase64(file);
    
    // Update gallery with new file (base64 for now, will be converted to URL after upload)
    const updatedGallery: PortfolioGallery = {
      ...props.gallery,
      file: base64,
    };
    
    emit('update', props.index, updatedGallery);
  } catch (error) {
    console.error('Error uploading file:', error);
  } finally {
    isUploading.value = false;
  }
};

const handleRemove = () => {
  emit('remove', props.index);
};
</script>

<template>
  <div class="border rounded-lg p-4 space-y-4">

    <div class="gap-4">
      <div class="flex items-center justify-between">
      <h4 class="font-medium">Gallery Image {{ index + 1 }}</h4>
      <Button
        type="button"
        @click="handleRemove"
        variant="destructive"
        size="sm"
      >
        Remove
      </Button>
    </div>
      <!-- Image Upload -->
      <div class="space-y-2">
        <ImageUploadField
          :value="imageUrl"
          @update:value="handleFileUpload"
          :loading="isUploading"
          accept="image/*"
          placeholder="Upload gallery image"
        />
      </div>

     
    </div>
  </div>
</template>
