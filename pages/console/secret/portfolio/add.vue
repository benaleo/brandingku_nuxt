<template>
  <AppTableHeader :pageTitle="pageTitle"/>
  <PortfolioForm/>
</template>

<script setup lang="ts">
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import PortfolioForm from "~/components/forms/PortfolioForm.vue";

const pageTitle = computed(() => {
  return 'Tambah Portfolio'
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