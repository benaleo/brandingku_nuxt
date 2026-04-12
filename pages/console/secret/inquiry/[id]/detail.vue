<template>
  <AppTableHeader :pageTitle="pageTitle"/>
  <InquiryDetailForm :id="id"/>
</template>

<script setup lang="ts">
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import InquiryDetailForm from "~/components/forms/InquiryDetailForm.vue";
import {computed} from "vue";

const route = useRoute()
const id = computed(() => route.params.id as string)

const pageTitle = computed(() => {
  return 'Inquiry Detail'
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
