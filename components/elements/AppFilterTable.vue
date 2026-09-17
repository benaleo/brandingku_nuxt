<script setup lang="ts">
import FieldXSearch from "~/components/forms/fields/FieldXSearch.vue";

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  disabled?: boolean
}>(), { placeholder: 'Cari…' })

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const slots = useSlots()
</script>

<template>
  <section class="mt-2 flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
    <div v-if="slots.default" class="flex flex-1 flex-wrap items-center gap-3">
      <slot />
    </div>
    <div v-else class="hidden sm:block sm:flex-1" />

    <FieldXSearch
      name="search"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :model-value="props.modelValue"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </section>
</template>
