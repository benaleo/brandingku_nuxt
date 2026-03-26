<template>
  <AppTableHeader :pageTitle="pageTitle"/>
  <ProductCategoryForm/>
</template>

<script setup lang="ts">
import ProductCategoryForm from "~/components/forms/ProductCategoryForm.vue";
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import {computed} from "vue";

const pageTitle = computed(() => {
  return 'Detail Kategori Produk'
})

definePageMeta({
  layout: 'console-secret'
})

useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: pageTitle }
  ]
})
</script>