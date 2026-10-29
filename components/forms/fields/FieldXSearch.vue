<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  name: string
  placeholder?: string
  modelValue: string
  disabled?: boolean
  widthClass?: string
}>(), { placeholder: 'Cari…', widthClass: 'sm:w-72' })

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="relative w-full" :class="props.widthClass">
    <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      :id="name"
      :name="name"
      type="search"
      autocomplete="off"
      :model-value="props.modelValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      class="h-10 rounded-lg bg-background pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
      @update:model-value="emit('update:modelValue', String($event))"
    />
    <button
      v-if="props.modelValue"
      type="button"
      aria-label="Hapus pencarian"
      class="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      @click="emit('update:modelValue', '')"
    >
      <X class="size-4" />
    </button>
  </div>
</template>
