<template>
  <UiToaster rich-colors />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ChatWidget />
</template>

<script setup lang="ts">
import ChatWidget from "~/components/chat/ChatWidget.vue";
</script>
