<script setup lang="ts">
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { vAutoAnimate } from '@formkit/auto-animate/vue'

defineProps({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: String,
    default: ''
  },
  validateOnBlur: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

function handleInput(e: Event) {
  const target = e.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <FormField v-slot="{ componentField }" :name="name" :validate-on-blur="validateOnBlur">
    <FormItem v-auto-animate>
      <FormLabel v-if="label">{{ label }}</FormLabel>
      <FormControl>
        <Textarea 
          :placeholder="placeholder" 
          v-bind="componentField" 
          :disabled="disabled"
          :model-value="modelValue"
          @update:model-value="(val) => emit('update:modelValue', val)"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
