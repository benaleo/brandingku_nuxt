<script setup lang="ts">
import { ImageUp } from 'lucide-vue-next';
import ImageBulkFormDialog from '../forms/ImageBulkFormDialog.vue';

defineProps<{
  handleUpdate: (fileUrl: string[], removeIds: string[]) => void | Promise<void>,
  productId: string
}>()

</script>

<template>
  <ImageBulkFormDialog 
    :submit="handleUpdate"
    :product-id="productId"
  >
    <ImageUp />
  </ImageBulkFormDialog>
</template>