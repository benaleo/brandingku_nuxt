<template>
  <AppTableHeader :pageTitle="pageTitle"/>
  <ProductForm/>
</template>

<script setup lang="ts">
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import ProductForm from "~/components/forms/ProductForm.vue";

const pageTitle = computed(() => {
  return 'Tambah Produk'
})

useHead({
  title: pageTitle,
})

definePageMeta({
  layout: 'console-secret'
})
</script>