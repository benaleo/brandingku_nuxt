<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <!-- no overflow-hidden: dropdowns inside (e.g. category select) must be able to extend past the card -->
  <section class="min-w-0 w-full rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
    <header class="rounded-t-2xl border-b border-border bg-muted/30 px-4 py-4 sm:px-6">
      <h2 class="text-base font-semibold tracking-tight">{{ title }}</h2>
      <p v-if="description" class="mt-1 text-sm leading-relaxed text-muted-foreground">{{ description }}</p>
    </header>
    <div class="min-w-0 space-y-6 p-4 sm:p-6">
      <slot />
    </div>
  </section>
</template>
