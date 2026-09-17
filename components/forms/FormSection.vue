<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <section class="min-w-0 w-full overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
    <header class="border-b border-border bg-muted/30 px-4 py-4 sm:px-6">
      <h2 class="text-base font-semibold tracking-tight">{{ title }}</h2>
      <p v-if="description" class="mt-1 text-sm leading-relaxed text-muted-foreground">{{ description }}</p>
    </header>
    <div class="min-w-0 space-y-6 p-4 sm:p-6">
      <slot />
    </div>
  </section>
</template>
