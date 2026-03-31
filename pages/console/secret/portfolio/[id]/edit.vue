<template>
  <AppTableHeader :pageTitle="pageTitle"/>
  <PortfolioForm/>
</template>

<script setup lang="ts">
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import PortfolioForm from "~/components/forms/PortfolioForm.vue";
import {computed} from "vue";

definePageMeta({
  layout: 'console-secret'
})

const pageTitle = computed(() => {
  return 'Edit Portfolio'
})

useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: pageTitle }
  ]
})
</script>