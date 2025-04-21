<template>
  <AppTableHeader page-title="Detail Kategori Produk"/>
  <ProductForm/>
</template>

<script setup lang="ts">
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import ProductForm from "~/components/forms/ProductForm.vue";

definePageMeta({
  layout: 'console-secret'
})
</script>