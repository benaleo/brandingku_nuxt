<template>
  Dashboard
</template>

<script setup>
const token = useCookie('token')
console.log("token in dashboard ", token.value)
</script>