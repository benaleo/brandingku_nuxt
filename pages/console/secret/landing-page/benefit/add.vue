<template>
  <AppTableHeader page-title="Tambah Benefit"/>
  <BenefitForm/>
</template>

<script setup lang="ts">
import AppTableHeader from "~/components/elements/AppTableHeader.vue";
import BenefitForm from "~/components/forms/BenefitForm.vue";

definePageMeta({
  layout: 'console-secret'
})
</script>