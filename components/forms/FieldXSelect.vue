<template>
  <FormField v-slot="{ componentField }" :name="name" :validate-on-blur="!isFieldDirty">
    <FormItem :class="itemClass" v-auto-animate>
      <FormLabel v-if="label">{{ label }}</FormLabel>
      <FormControl>
        <Combobox v-model="modelValue" :by="byField" v-bind="componentField">
          <ComboboxAnchor as-child>
            <ComboboxTrigger as-child :disabled="disabled">
              <Button variant="outline" class="justify-between w-full">
                {{(options ?? []).find(item => item[valueField] === modelValue)?.[labelField] ?? placeholder}}
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </ComboboxTrigger>
          </ComboboxAnchor>

          <ComboboxList>
            <div class="relative w-full items-center">
              <ComboboxInput class="pl-9 focus-visible:ring-0 border-0 border-b rounded-none h-10"
                :placeholder="searchPlaceholder" />
              <span class="absolute start-0 inset-y-0 flex items-center justify-center px-3">
                <Search class="size-4 text-muted-foreground" />
              </span>
            </div>

            <ComboboxEmpty>
              {{ emptyMessage }}
            </ComboboxEmpty>

            <ComboboxGroup>
              <template v-if="loading">
                <div class="px-4 py-2 text-gray-500">{{ loadingMessage }}</div>
              </template>
              <template v-else-if="error">
                <div class="px-4 py-2 text-red-500">{{ errorMessage }}</div>
              </template>
              <template v-else>
                <ComboboxItem 
                  v-for="item in (options ?? [])" 
                  :key="item[valueField]" 
                  :value="item[valueField]"
                >
                  {{ item[labelField] }}
                  <ComboboxItemIndicator>
                    <Check class="ml-auto h-4 w-4" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              </template>
            </ComboboxGroup>
          </ComboboxList>
        </Combobox>
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
</template>

<script lang="ts" setup>
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger
} from '@/components/ui/combobox'
import { Check, ChevronsUpDown, Search } from 'lucide-vue-next'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import type { PropType } from 'vue'

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
    default: 'Select an option'
  },
  searchPlaceholder: {
    type: String,
    default: 'Search...'
  },
  emptyMessage: {
    type: String,
    default: 'No items found.'
  },
  loadingMessage: {
    type: String,
    default: 'Loading...'
  },
  errorMessage: {
    type: String,
    default: 'Failed to load data'
  },
  options: {
    type: Array as PropType<Array<Record<string, any>>>,
    default: () => []
  },
  valueField: {
    type: String,
    default: 'id'
  },
  labelField: {
    type: String,
    default: 'label'
  },
  byField: {
    type: String,
    default: 'id'
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
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
  }
})

const modelValue = defineModel()
</script>
