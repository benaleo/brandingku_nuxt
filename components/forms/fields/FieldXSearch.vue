<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  name: string
  placeholder?: string
  modelValue: string
  disabled?: boolean
}>(), { placeholder: 'Cari…' })

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const onInput = (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value)
</script>

<template>
  <div class="relative w-full sm:w-72">
    <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      :id="name"
      :name="name"
      type="search"
      autocomplete="off"
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      class="h-10 rounded-lg bg-background pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
      @input="onInput"
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
