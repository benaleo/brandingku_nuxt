<script setup lang="ts">
import { ImageUp } from 'lucide-vue-next';
import ImageFormDialog from "~/components/forms/ImageFormDialog.vue";

defineProps<{
  handleUpdate: (fileUrl: string, file: File) => void | Promise<void>
}>()

</script>

<template>
  <ImageFormDialog :submit="handleUpdate">
    <ImageUp />
  </ImageFormDialog>
</template>