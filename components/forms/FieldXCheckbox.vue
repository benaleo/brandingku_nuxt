<template>
  <FormField v-slot="{ handleChange, componentField }" :name="name" :type="'checkbox'"
    :validate-on-blur="!isFieldDirty">
    <FormItem class="flex items-center gap-2 justify-start w-full" v-auto-animate>
      <FormControl>
        <label class="cursor-pointer form-label">
          <Checkbox
            :checked="modelValue"
            @update:checked="(val: boolean) => {
              const boolVal = val === true;
              emitUpdate(boolVal);
              handleChange(boolVal);
            }"
            v-bind="componentField"
            :disabled="disabled"
            :id="name"
          />
          <span>{{ label }}</span>
          </label>
        <FormMessage />
      </FormControl>
    </FormItem>
  </FormField>
</template>

<script setup lang="ts">
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '~/components/ui/checkbox';
import { vAutoAnimate } from '@formkit/auto-animate/vue'

defineOptions({
  directives: {
    autoAnimate: vAutoAnimate
  }
})

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: Boolean, required: true },
  disabled: { type: Boolean, default: false },
  isFieldDirty: { type: Boolean, default: true },
});

const emit = defineEmits(['update:modelValue']);
const emitUpdate = (val: boolean) => emit('update:modelValue', val);


</script>
