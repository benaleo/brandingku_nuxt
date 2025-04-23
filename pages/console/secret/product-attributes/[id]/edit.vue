<template>
  <AppTableHeader page-title="Edit Atribut Produk"/>
  <ProductAttributeForm/>
</template>

<script setup lang="ts">
import ProductAttributeForm from "~/components/forms/ProductAttributeForm.vue";
import AppTableHeader from "~/components/elements/AppTableHeader.vue";

definePageMeta({
  layout: 'console-secret'
})
</script>