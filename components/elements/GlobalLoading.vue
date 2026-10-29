<script setup lang="ts">
// shared with NuxtLoadingIndicator; starts on router.beforeEach so slow middleware is covered too.
// call useLoadingIndicator().start()/finish() anywhere to show it manually.
const { isLoading } = useLoadingIndicator({ throttle: 150 })
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    leave-active-class="transition-opacity duration-300 ease-in"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isLoading"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <img src="/images/loading-logo.png" alt="" class="global-loading-logo size-16 select-none" draggable="false">
      <span class="sr-only">Memuat…</span>
    </div>
  </Transition>
</template>

<style scoped>
.global-loading-logo {
  animation: global-loading-pulse 1.2s ease-in-out infinite;
}

@keyframes global-loading-pulse {
  0%, 100% { opacity: 0.35; transform: scale(0.92); }
  50% { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .global-loading-logo { animation: none; }
}
</style>
