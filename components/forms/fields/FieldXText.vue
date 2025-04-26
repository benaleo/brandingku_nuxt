<template>
  <FormField v-slot="{ componentField }" :name="name" :validate-on-blur="!isFieldDirty">
    <FormItem :class="itemClass" v-auto-animate>
      <FormLabel v-if="label">{{ label }}</FormLabel>
      <FormControl>
        <Input
            :type="type"
            :placeholder="placeholder"
            v-model="modelValue"
            v-bind="componentField"
            :value="modelValue"
            :disabled="disabled"
            :class="inputClass"
        />
      </FormControl>
      <FormMessage/>
    </FormItem>
  </FormField>
</template>

<script lang="ts" setup>
import {Input} from '@/components/ui/input'
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {vAutoAnimate} from '@formkit/auto-animate/vue'

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
  },
  itemClass: {
    type: String,
    default: 'w-full'
  },
  inputClass:{
    type: String,
    default: ''
  }
})

const modelValue = defineModel()
</script>
