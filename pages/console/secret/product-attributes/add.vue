<template>
  <AppTableHeader page-title="Tambah Atribut Produk" />
  <ProductAttributeForm />
</template>

<script setup lang="ts">
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import ProductAttributeForm from "~/components/forms/ProductAttributeForm.vue";

definePageMeta({
  layout: 'console-secret'
})
</script>