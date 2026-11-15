<template>
  <UiToaster rich-colors :position="isConsole ? 'top-right' : undefined" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ChatWidget />
  <ElementsGlobalLoading />
</template>

<script setup lang="ts">
import ChatWidget from "~/components/chat/ChatWidget.vue";

const isConsole = computed(() => useRoute().path.startsWith('/console'))
</script>
