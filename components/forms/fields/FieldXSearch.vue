<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-vue-next'

// Define props with proper types
const props = defineProps<{
  name: string
  placeholder?: string
  modelValue: string
}>()

// Define emits for v-model to work
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Handle input change
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="grid gap-2 mt-2">
    <div class="flex justify-end items-end gap-2">
      <p class="form-label mb-2">
        Pencarian :
      </p>
      <div class="relative w-full max-w-[200px] items-center">
        <Input
            :id="name"
            :name="name"
            type="text"
            :placeholder="placeholder || 'Search...'"
            class="pl-10"
            @input="handleInput"
        />
        <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
      <Search class="size-6 text-muted-foreground" />
    </span>
      </div>
    </div>
  </div>
</template>