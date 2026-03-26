<template>
  <AppTableHeader :pageTitle="pageTitle"/>
  <ProductForm/>
</template>

<script setup lang="ts">
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import ProductForm from "~/components/forms/ProductForm.vue";
import {computed} from "vue";

const pageTitle = computed(() => {
  return 'Detail Produk'
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