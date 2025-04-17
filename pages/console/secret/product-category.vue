<template>
  <div>
    Product Category
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'console-secret'
})

const token = useCookie('token')
console.log("token in dashboard ", token.value)
</script>