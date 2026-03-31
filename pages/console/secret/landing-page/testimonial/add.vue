<template>
  <AppTableHeader page-title="Tambah Testimonial"/>
  <TestimonialForm/>
</template>

<script setup lang="ts">
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import TestimonialForm from "~/components/forms/TestimonialForm.vue";

definePageMeta({
  layout: 'console-secret'
})
</script>