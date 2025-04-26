<template>
  <div>
    <label v-if="label" class="form-label">{{ label }}</label>
    <Select v-model="selectedValue" :disabled="disabled">
      <SelectTrigger class="w-full">
        <SelectValue :placeholder="placeholder" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem
            v-for="option in options"
            :key="option.id"
            :value="option.id"
          >
            {{ option.label }}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
</template>

<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { computed } from 'vue'
import type { OptionType } from '~/types/options.type'

const props = defineProps({
  name: {
    type: String,
    required: false
  },
  label: String,
  options: {
    type: Array as () => OptionType[],
    default: () => []
  },
  modelValue: [String, Number],
  placeholder: {
    type: String,
    default: 'Select an option'
  },
  labelField: {
    type: String,
    default: 'label'
  },
  valueField: {
    type: String,
    default: 'value'
  },
  disabled: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const selectedValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>
