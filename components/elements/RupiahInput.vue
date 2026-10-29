<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

// a rupiah amount typed with dot thousand separators (1.500.000); the model stays a plain
// number, or '' when empty. Other attributes (id, min, aria-*) go to the input.
defineOptions({ inheritAttrs: false })
const model = defineModel<number | string>({ default: '' })
const props = defineProps<{ class?: HTMLAttributes['class'] }>()

const group = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })
const format = (v: number | string) => (v === '' || v === null || !Number.isFinite(Number(v)) ? '' : group.format(Math.floor(Number(v))))
const display = ref(format(model.value))
watch(model, (v) => {
  // outside changes (a reset, a computed default) are shown formatted
  if (Number(display.value.replace(/\D/g, '') || NaN) !== Number(v)) display.value = format(v)
})

const onInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  const caret = input.selectionStart ?? input.value.length
  const digitsBefore = input.value.slice(0, caret).replace(/\D/g, '').length
  const digits = input.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
  const formatted = digits ? group.format(Number(digits)) : ''
  display.value = formatted
  input.value = formatted
  model.value = digits ? Number(digits) : ''
  // keep the caret after the same digit it followed before the dots moved
  let pos = 0
  for (let seen = 0; pos < formatted.length && seen < digitsBefore; pos++) {
    if (/\d/.test(formatted[pos]!)) seen++
  }
  nextTick(() => input.setSelectionRange(pos, pos))
}
</script>

<template>
  <div class="relative w-full">
    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
    <input
      v-bind="$attrs"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :value="display"
      :class="cn('form-input pl-9', props.class)"
      @input="onInput"
    >
  </div>
</template>
