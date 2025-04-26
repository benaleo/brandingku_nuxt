<script setup lang="ts">
import FieldXSearch from "~/components/forms/fields/FieldXSearch.vue";

// Use modelValue for v-model compatibility
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const updateKeyword = (value: string) => {
  console.log('AppFilterTable updateKeyword:', value)
  emit('update:modelValue', value)
}

</script>

<template>
  <section class="grid">
    <!-- Custom filter slot -->
    <div class="flex justify-start items-center gap-4 flex-wrap">
      <slot></slot>
    </div>

    <!-- Search field -->
    <FieldXSearch 
      name="search" 
      placeholder="Cari" 
      :model-value="props.modelValue"
      @update:modelValue="updateKeyword"
    />
  </section>
</template>

<style scoped>

</style>