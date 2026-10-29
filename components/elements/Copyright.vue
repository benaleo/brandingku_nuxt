<script setup lang="ts">
// the one copyright line, shared by the site footer and the console
const year = new Date().getFullYear()
</script>

<template>
  <p>{{ $t('app.footer.copyright', { year }) }}</p>
</template>
