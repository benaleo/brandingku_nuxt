<script setup lang="ts">
import { ImageUp } from 'lucide-vue-next';
import ImageFormDialog from "~/components/forms/ImageSingleFormDialog.vue";

defineProps<{
  handleUpdate: (fileUrl: string, file: File, oldImageUrl?: string) => void | Promise<void>
  oldImageUrl?: string
}>()

</script>

<template>
  <ImageFormDialog :submit="(fileUrl, file) => handleUpdate(fileUrl, file, oldImageUrl)">
    <ImageUp />
  </ImageFormDialog>
</template>