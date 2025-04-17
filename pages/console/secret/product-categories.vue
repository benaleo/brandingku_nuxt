<template>
  <div>
    <AppBreadcrumb/>
    <h1 class="text-2xl font-bold mt-4">Kategori Produk</h1>
    Product Category
  </div>
</template>

<script setup>
import AppBreadcrumb from "~/components/elements/AppBreadcrumb.vue";

definePageMeta({
  layout: 'console-secret'
})

const token = useCookie('token')
console.log("token in dashboard ", token.value)
</script>