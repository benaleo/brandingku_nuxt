<template>
  <FormField v-slot="{ componentField }" :name="name" :validate-on-blur="!isFieldDirty">
    <FormItem class="w-full" v-auto-animate>
      <FormLabel v-if="label">{{ label }}</FormLabel>
      <FormControl>
        <Input 
          :type="type" 
          :placeholder="placeholder" 
          v-model="modelValue" 
          v-bind="componentField" 
          :value="modelValue" 
          :disabled="disabled" 
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
</template>

<script lang="ts" setup>
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const props = defineProps({
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
  type: {
    type: String,
    default: 'text'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  isFieldDirty: {
    type: Boolean,
    default: false
  }
})

const modelValue = defineModel()
</script>
