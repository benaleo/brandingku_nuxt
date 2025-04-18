<template>
  <AppTableHeader page-title="Detail Kategori Produk"/>
  <ProductCategoryForm/>
</template>

<script setup lang="ts">
import ProductCategoryForm from "~/components/forms/ProductCategoryForm.vue";
import AppTableHeader from "~/components/elements/AppTableHeader.vue";

definePageMeta({
  layout: 'console-secret'
})
</script>