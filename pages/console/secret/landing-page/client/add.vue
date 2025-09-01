<template>
  <AppTableHeader page-title="Tambah Client"/>
  <ClientForm/>
</template>

<script setup lang="ts">
import ClientForm from "~/components/forms/ClientForm.vue";
import AppTableHeader from "~/components/elements/AppTableHeader.vue";

definePageMeta({
  layout: 'console-secret'
})
</script>