<script setup lang="ts">
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'

// Five stars in half steps. Read-only by default; with `editable` a click on a star's left or
// right half picks x.5 or x, and the arrow keys move by half a star.
const props = withDefaults(defineProps<{ modelValue: number; editable?: boolean; size?: 'sm' | 'md' | 'lg'; label?: string }>(), { size: 'sm' })
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const sizeClass = computed(() => ({ sm: 'size-4', md: 'size-5', lg: 'size-8' })[props.size])
// how much of each star is filled: 0, 0.5 or 1
const fill = (i: number) => Math.max(0, Math.min(1, props.modelValue - (i - 1)))

const set = (v: number) => emit('update:modelValue', Math.min(5, Math.max(1, v)))
const pick = (i: number, e: MouseEvent) => {
  const el = e.currentTarget as HTMLElement
  const left = e.clientX - el.getBoundingClientRect().left < el.offsetWidth / 2
  set(left ? i - 0.5 : i)
}
const onKey = (e: KeyboardEvent) => {
  const step = { ArrowRight: 0.5, ArrowUp: 0.5, ArrowLeft: -0.5, ArrowDown: -0.5 }[e.key]
  if (step === undefined) return
  e.preventDefault()
  set(props.modelValue + step)
}
const display = computed(() => props.modelValue.toLocaleString('id-ID', { maximumFractionDigits: 1 }))
</script>

<template>
  <div
    v-if="editable"
    role="slider"
    tabindex="0"
    :aria-label="label"
    aria-valuemin="1"
    aria-valuemax="5"
    :aria-valuenow="modelValue"
    :aria-valuetext="`${display} / 5`"
    class="inline-flex items-center gap-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-green-600"
    @keydown="onKey"
  >
    <button v-for="i in 5" :key="i" type="button" tabindex="-1" class="relative" :aria-hidden="true" @click="pick(i, $event)">
      <Star :class="sizeClass" class="text-slate-300" />
      <span class="absolute inset-y-0 left-0 overflow-hidden" :style="{ width: `${fill(i) * 100}%` }">
        <Star :class="sizeClass" class="fill-amber-400 text-amber-400" />
      </span>
    </button>
    <span class="ml-1 min-w-8 text-sm font-semibold text-slate-700">{{ display }}</span>
  </div>
  <span v-else class="inline-flex items-center gap-0.5" role="img" :aria-label="label || `${display} / 5`">
    <span v-for="i in 5" :key="i" class="relative">
      <Star :class="sizeClass" class="text-slate-300" />
      <span class="absolute inset-y-0 left-0 overflow-hidden" :style="{ width: `${fill(i) * 100}%` }">
        <Star :class="sizeClass" class="fill-amber-400 text-amber-400" />
      </span>
    </span>
  </span>
</template>
