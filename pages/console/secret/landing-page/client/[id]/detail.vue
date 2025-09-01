<template>
  <AppTableHeader page-title="Detail Client"/>
  <ClientForm/>
</template>

<script setup lang="ts">
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import ClientForm from "~/components/forms/ClientForm.vue";

definePageMeta({
  layout: 'console-secret'
})
</script>