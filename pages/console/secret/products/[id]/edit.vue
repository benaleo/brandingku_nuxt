<template>
  <AppTableHeader :pageTitle="pageTitle"/>
  <ProductForm/>
</template>

<script setup lang="ts">
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import ProductForm from "~/components/forms/ProductForm.vue";
import {computed} from "vue";

definePageMeta({
  layout: 'console-secret'
})

const pageTitle = computed(() => {
  return 'Edit Produk'
})

useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: pageTitle }
  ]
})
</script>