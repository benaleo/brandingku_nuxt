<script setup lang="ts">
import { ImageUp } from 'lucide-vue-next';
import ImageBulkFormDialog from '../forms/ImageBulkFormDialog.vue';
import type {ProductGalleriesList} from "~/types/products.type";

defineProps<{
  handleUpdate: (fileUrl: string[], removeIds: string[]) => void | Promise<void>,
  productId: string,
  galleries: ProductGalleriesList[]
}>()

</script>

<template>
  <ImageBulkFormDialog 
    :submit="handleUpdate"
    :product-id="productId"
    :galleries
  >
    <ImageUp />
  </ImageBulkFormDialog>
</template>