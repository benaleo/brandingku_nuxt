<template>
  <div>
    <AppBreadcrumb/>
    <h1 class="text-2xl font-bold mt-4">{{ pageTitle }}</h1>
    <!-- Your dashboard content -->
  </div>
</template>

<script setup>
import AppBreadcrumb from "~/components/elements/AppBreadcrumb.vue";

const pageTitle = 'Dashboard'

useHead({
  title: pageTitle,
})

definePageMeta({
  layout: 'console-secret'
})

const token = useCookie('token')
console.log("token in dashboard ", token.value)
</script>