<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CalendarDays } from 'lucide-vue-next'

// A date or date-time field in the Indonesian format, dd-mm-yyyy or dd-mm-yyyy HH:mm:ss (24 h).
// People type the date or pick it from the browser's calendar behind the button; either way
// v-model holds yyyy-mm-dd, or yyyy-mm-ddTHH:mm:ss in local time with `with-time`.
const props = defineProps<{
  modelValue: string
  withTime?: boolean
  id?: string
  // yyyy-mm-dd bounds
  min?: string
  max?: string
  disabled?: boolean
  inputClass?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const text = ref(inputValueToText(props.modelValue, props.withTime))
const invalid = ref(false)
const focused = ref(false)
watch(() => props.modelValue, (v) => {
  if (focused.value) return
  text.value = inputValueToText(v, props.withTime)
  invalid.value = false
})

const placeholder = computed(() => (props.withTime ? 'dd-mm-yyyy hh:mm:ss' : 'dd-mm-yyyy'))
const inRange = (value: string) => {
  const day = value.slice(0, 10)
  return (!props.min || day >= props.min) && (!props.max || day <= props.max)
}

const commit = () => {
  focused.value = false
  if (!text.value.trim()) {
    invalid.value = false
    if (props.modelValue) emit('update:modelValue', '')
    return
  }
  const value = textToInputValue(text.value, props.withTime)
  invalid.value = !value || !inRange(value)
  if (invalid.value || !value) return
  text.value = inputValueToText(value, props.withTime)
  if (value !== props.modelValue) emit('update:modelValue', value)
}

// the browser's own calendar, opened from the button
const native = ref<HTMLInputElement | null>(null)
const nativeValue = computed(() => (props.withTime ? props.modelValue : props.modelValue.slice(0, 10)))
const openPicker = () => {
  const el = native.value
  if (!el || props.disabled) return
  try {
    el.showPicker()
  } catch {
    el.focus()
    el.click()
  }
}
const onNativePick = (e: Event) => {
  let value = (e.target as HTMLInputElement).value
  if (props.withTime && value && value.length === 16) value += ':00'
  invalid.value = false
  text.value = inputValueToText(value, props.withTime)
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="relative">
    <input
      :id="id"
      v-model="text"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="invalid || undefined"
      class="form-input pr-10 tabular-nums"
      :class="[inputClass, invalid && 'border-red-500 focus-visible:ring-red-500/40']"
      @focus="focused = true"
      @blur="commit"
      @keydown.enter.prevent="commit"
    >
    <button
      type="button"
      class="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
      :disabled="disabled"
      :aria-label="withTime ? 'Pilih tanggal dan jam' : 'Pilih tanggal'"
      @click="openPicker"
    >
      <CalendarDays class="size-4" />
    </button>
    <!-- kept in the layout (not display:none) so showPicker() can anchor the calendar -->
    <input
      ref="native"
      :type="withTime ? 'datetime-local' : 'date'"
      :step="withTime ? 1 : undefined"
      :value="nativeValue"
      :min="min ? (withTime ? `${min}T00:00:00` : min) : undefined"
      :max="max ? (withTime ? `${max}T23:59:59` : max) : undefined"
      tabindex="-1"
      aria-hidden="true"
      class="pointer-events-none absolute bottom-0 right-0 h-px w-px opacity-0"
      @change="onNativePick"
    >
  </div>
</template>
