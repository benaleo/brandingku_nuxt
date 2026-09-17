<script setup lang="ts">
import { ImageUp } from 'lucide-vue-next';
import ImageBulkFormDialog from '../forms/ImageBulkFormDialog.vue';
import type {ProductGallery} from "~/types/products.type";
const { can } = useConsoleAccess()

defineProps<{
  handleUpdate: (createdGalleries: ProductGallery[], removeIds: string[]) => void | Promise<void>,
  productId: string,
  galleries: ProductGallery[]
}>()

</script>

<template>
  <ImageBulkFormDialog 
    v-if="can('products.create') || can('products.delete')"
    :submit="handleUpdate"
    :product-id="productId"
    :galleries
  >
    <ImageUp />
  </ImageBulkFormDialog>
</template>
