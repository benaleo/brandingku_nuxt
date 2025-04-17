<template>
  <div>
    Product
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'console-secret'
})

const token = useCookie('token')
console.log("token in dashboard ", token.value)
</script>