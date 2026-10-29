<script setup lang="ts">
import { computed, ref } from 'vue'
import { useElementSize } from '@vueuse/core'
import type { DashboardPoint } from '~/types/dashboard.type'

// Columns of one measure over time (revenue or orders), one hue, with a per-column tooltip.
// A hidden table carries the same numbers for screen readers.
const props = defineProps<{
  points: DashboardPoint[]
  measure: 'revenue' | 'orders'
  bucket: 'day' | 'week' | 'month'
  label: string
}>()

const box = ref<HTMLElement | null>(null)
const { width } = useElementSize(box)
const HEIGHT = 240
const PAD = { top: 12, right: 8, bottom: 28, left: 56 }

const values = computed(() => props.points.map(p => props.measure === 'revenue' ? p.revenue : p.orders))
// a clean top for the axis: 1, 2, 2.5 or 5 times a power of ten
const niceMax = computed(() => {
  const max = Math.max(...values.value, 0)
  if (max <= 0) return props.measure === 'orders' ? 4 : 1_000_000
  const pow = 10 ** Math.floor(Math.log10(max))
  const step = [1, 2, 2.5, 5, 10].find(s => s * pow >= max)!
  return step * pow
})
const ticks = computed(() => [0, 0.25, 0.5, 0.75, 1].map(f => f * niceMax.value))

const plotW = computed(() => Math.max(0, width.value - PAD.left - PAD.right))
const plotH = HEIGHT - PAD.top - PAD.bottom
const band = computed(() => (props.points.length ? plotW.value / props.points.length : 0))
const barW = computed(() => Math.max(2, Math.min(24, band.value - 2)))
const y = (v: number) => PAD.top + plotH - (v / niceMax.value) * plotH

// a column with a 4px rounded top and a square foot on the baseline
const barPath = (i: number) => {
  const v = values.value[i]!
  if (v <= 0) return ''
  const x = PAD.left + i * band.value + (band.value - barW.value) / 2
  const top = y(v)
  const h = PAD.top + plotH - top
  const r = Math.min(4, barW.value / 2, h)
  return `M${x},${top + h}V${top + r}Q${x},${top} ${x + r},${top}H${x + barW.value - r}Q${x + barW.value},${top} ${x + barW.value},${top + r}V${top + h}Z`
}

const compact = (v: number) => {
  if (props.measure === 'orders') return String(Math.round(v))
  if (v >= 1e9) return `${(v / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`
  if (v >= 1e6) return `${(v / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
  if (v >= 1e3) return `${(v / 1e3).toLocaleString('id-ID', { maximumFractionDigits: 0 })} rb`
  return String(v)
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const dateLabel = (iso: string) => {
  const day = formatDay(iso)
  const [d, m, y] = day.split('-')
  if (props.bucket === 'month') return `${MONTHS[Number(m) - 1]} ${y}`
  return `${Number(d)} ${MONTHS[Number(m) - 1]}`
}
// about six labels along the bottom, whatever the number of columns
const labelEvery = computed(() => Math.max(1, Math.ceil(props.points.length / Math.max(2, Math.floor(plotW.value / 70)))))
const valueText = (v: number) => (props.measure === 'revenue' ? formatRupiah(v) : `${v} pesanan`)

const hover = ref<number | null>(null)
const tooltip = computed(() => {
  if (hover.value === null) return null
  const p = props.points[hover.value]!
  const x = PAD.left + hover.value * band.value + band.value / 2
  return { x, left: x > width.value - 140, title: props.bucket === 'week' ? `Minggu ${dateLabel(p.date)}` : dateLabel(p.date), value: valueText(values.value[hover.value]!) }
})
</script>

<template>
  <div ref="box" class="relative w-full" @mouseleave="hover = null">
    <svg v-if="width" :width="width" :height="HEIGHT" role="img" :aria-label="label" class="block">
      <g class="text-[11px]">
        <template v-for="t in ticks" :key="t">
          <line :x1="PAD.left" :x2="width - PAD.right" :y1="y(t)" :y2="y(t)" class="stroke-slate-200" stroke-width="1" />
          <text :x="PAD.left - 8" :y="y(t)" dy="0.32em" text-anchor="end" class="fill-slate-500">{{ compact(t) }}</text>
        </template>
      </g>
      <rect
        v-if="hover !== null"
        :x="PAD.left + hover * band"
        :y="PAD.top"
        :width="band"
        :height="plotH"
        class="fill-slate-100"
      />
      <path v-for="(_, i) in points" :key="i" :d="barPath(i)" class="fill-green-600" />
      <g class="text-[11px]">
        <template v-for="(p, i) in points" :key="`l${i}`">
          <text
            v-if="i % labelEvery === 0"
            :x="PAD.left + i * band + band / 2"
            :y="HEIGHT - 8"
            text-anchor="middle"
            class="fill-slate-500"
          >{{ dateLabel(p.date) }}</text>
        </template>
      </g>
      <!-- hit targets span the whole column so thin bars are easy to hover -->
      <rect
        v-for="(_, i) in points"
        :key="`h${i}`"
        :x="PAD.left + i * band"
        :y="PAD.top"
        :width="band"
        :height="plotH"
        fill="transparent"
        @mouseenter="hover = i"
        @focus="hover = i"
      />
    </svg>
    <div
      v-if="tooltip"
      class="pointer-events-none absolute top-2 z-10 whitespace-nowrap rounded-md border bg-white px-3 py-2 text-xs shadow-lg"
      :style="tooltip.left ? { right: `${width - tooltip.x + 10}px` } : { left: `${tooltip.x + 10}px` }"
    >
      <p class="text-slate-500">{{ tooltip.title }}</p>
      <p class="font-semibold text-slate-900">{{ tooltip.value }}</p>
    </div>
    <table class="sr-only">
      <caption>{{ label }}</caption>
      <tbody>
        <tr v-for="(p, i) in points" :key="`t${i}`"><th scope="row">{{ dateLabel(p.date) }}</th><td>{{ valueText(values[i]!) }}</td></tr>
      </tbody>
    </table>
  </div>
</template>
