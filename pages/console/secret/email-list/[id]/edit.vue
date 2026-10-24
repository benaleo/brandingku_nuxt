<template>
  <AppTableHeader page-title="Edit Email"/>
  <AdminSmtpForm/>
</template>

<script setup lang="ts">
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import AdminSmtpForm from "~/components/forms/AdminSmtpForm.vue";

useHead({title: 'Edit Email'})

definePageMeta({
  layout: 'console-secret'
})
</script>
