<script setup lang="ts">
import { ImageUp } from 'lucide-vue-next';
import ImageForm from "~/components/forms/ImageForm.vue";

defineProps<{
  handleUpdate: (file: File) => void | Promise<void>
}>()

</script>

<template>
  <ImageForm :submit="handleUpdate">
    <ImageUp />
  </ImageForm>
</template>
