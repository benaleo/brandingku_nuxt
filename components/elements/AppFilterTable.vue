<script setup lang="ts" generic="F extends Record<string, any>">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { Filter, Search, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import FieldXSearch from '~/components/forms/fields/FieldXSearch.vue'

// The toolbar above a console table: a search icon that opens into the search box, and a Filter
// button whose popup edits a draft of the filters; nothing changes until Terapkan is pressed.
// Filters: pass `filters` (current values) and `filter-defaults`, render the fields in the
// default slot against `draft`, and apply the values the `apply` event hands back.
const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  disabled?: boolean
  searchWidthClass?: string
  filters?: F
  filterDefaults?: F
}>(), { placeholder: 'Cari…', searchWidthClass: 'sm:w-72' })

const emit = defineEmits<{ 'update:modelValue': [value: string]; apply: [filters: F] }>()
const slots = useSlots()

// search: an icon until opened; it stays open while it holds a keyword
const searchOpen = ref(!!props.modelValue)
const searchBox = ref<HTMLElement | null>(null)
const openSearch = async () => {
  searchOpen.value = true
  await nextTick()
  searchBox.value?.querySelector('input')?.focus()
}
const closeSearch = () => {
  if (props.modelValue) emit('update:modelValue', '')
  searchOpen.value = false
}
watch(() => props.modelValue, (v) => { if (v) searchOpen.value = true })

// filters: edited on a copy and handed back on apply
const filterOpen = ref(false)
const draft = reactive({ ...(props.filters ?? {}) }) as F
watch(filterOpen, (open) => { if (open) Object.assign(draft, props.filters ?? {}) })
const same = (a: unknown, b: unknown) => (a ?? '') === (b ?? '') || JSON.stringify(a ?? '') === JSON.stringify(b ?? '')
const activeCount = computed(() => {
  if (!props.filters || !props.filterDefaults) return 0
  return Object.keys(props.filterDefaults).filter(k => !same(props.filters![k], props.filterDefaults![k])).length
})
const apply = () => {
  if (props.filters) emit('apply', { ...draft })
  filterOpen.value = false
}
const reset = () => { Object.assign(draft, props.filterDefaults ?? {}) }
</script>

<template>
  <section class="mt-2 flex items-center justify-end gap-2">
    <div v-if="searchOpen" ref="searchBox" class="flex min-w-0 flex-1 items-center gap-1 sm:flex-none">
      <FieldXSearch
        name="search"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :width-class="props.searchWidthClass"
        :model-value="props.modelValue"
        @update:model-value="emit('update:modelValue', $event)"
        @keydown.esc="closeSearch"
      />
      <Button v-if="!props.modelValue" variant="ghost" size="icon" class="size-10 shrink-0" aria-label="Tutup pencarian" @click="closeSearch">
        <X class="size-4" />
      </Button>
    </div>
    <Button v-else variant="outline" size="icon" class="size-10 shrink-0" aria-label="Cari" title="Cari" :disabled="props.disabled" @click="openSearch">
      <Search class="size-4" />
    </Button>

    <Button v-if="slots.default" variant="outline" class="relative h-10 shrink-0 gap-2" :disabled="props.disabled" @click="filterOpen = true">
      <Filter class="size-4" />
      <span>Filter</span>
      <span
        v-if="activeCount"
        class="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1 text-[11px] font-semibold text-white"
        :aria-label="`${activeCount} filter aktif`"
      >{{ activeCount }}</span>
    </Button>

    <Dialog v-model:open="filterOpen">
      <DialogContent class="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogTitle>Filter</DialogTitle>
        <DialogDescription class="sr-only">Pilih filter lalu tekan Terapkan.</DialogDescription>
        <form class="space-y-4" @submit.prevent="apply">
          <div class="flex flex-col gap-3 [&_select]:w-full [&>*]:w-full">
            <slot :draft="draft" />
          </div>
          <div class="flex justify-end gap-2 border-t pt-4">
            <Button v-if="props.filterDefaults" type="button" variant="ghost" @click="reset">Reset</Button>
            <Button type="submit" class="bg-green-600 hover:bg-green-700">Terapkan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </section>
</template>
