<template>
  <div :class="itemClass" class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-medium leading-none">{{ label }}</label>

    <div ref="containerRef" class="relative">
      <!-- Trigger -->
      <button
        type="button"
        :disabled="disabled"
        class="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        :class="{ 'border-destructive': !!fieldError }"
        @click="toggleOpen"
      >
        <span :class="selectedLabel ? 'text-foreground' : 'text-muted-foreground'">
          {{ selectedLabel ?? placeholder }}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" class="ml-2 h-4 w-4 shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>
        </svg>
      </button>

      <!-- Dropdown -->
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md"
      >
        <!-- Search -->
        <div class="flex items-center border-b px-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            ref="searchRef"
            v-model="search"
            type="text"
            :placeholder="searchPlaceholder"
            class="flex h-10 w-full bg-transparent py-3 pl-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <!-- Options list -->
        <div class="max-h-64 overflow-y-auto py-1">
          <template v-if="loading">
            <div class="px-4 py-2 text-sm text-muted-foreground">{{ loadingMessage }}</div>
          </template>
          <template v-else-if="error">
            <div class="px-4 py-2 text-sm text-destructive">{{ errorMessage }}</div>
          </template>
          <template v-else-if="filteredGroups.length === 0">
            <div class="px-4 py-2 text-sm text-muted-foreground">{{ emptyMessage }}</div>
          </template>
          <template v-else>
            <template v-for="group in filteredGroups" :key="group.parentName">
              <!-- Group header -->
              <div class="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {{ group.parentName || 'Other' }}
              </div>
              <!-- Group items -->
              <button
                v-for="item in group.items"
                :key="item.id"
                type="button"
                class="flex w-full items-center justify-between px-6 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                :class="{ 'bg-accent font-medium': item.id === currentValue }"
                @click="selectItem(item)"
              >
                <span>{{ item.label }}</span>
                <svg
                  v-if="item.id === currentValue"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                >
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </button>
            </template>
          </template>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <p v-if="fieldError" class="text-xs text-destructive">{{ fieldError }}</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useField } from 'vee-validate'
import type { PropType } from 'vue'
import type { ProductCategoryOption } from '~/composables/useOptionProductCategories'

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Select an option' },
  searchPlaceholder: { type: String, default: 'Search...' },
  emptyMessage: { type: String, default: 'No items found.' },
  loadingMessage: { type: String, default: 'Loading...' },
  errorMessage: { type: String, default: 'Failed to load data' },
  options: { type: Array as PropType<ProductCategoryOption[]>, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  isFieldDirty: { type: Boolean, default: false },
  itemClass: { type: String, default: 'w-full' },
})

const modelValue = defineModel<string>()

const { value: fieldValue, errorMessage: fieldError, handleChange } = useField<string>(() => props.name)

// Keep internal field value in sync with parent v-model
const currentValue = computed(() => modelValue.value ?? fieldValue.value ?? '')

const selectedLabel = computed(() => {
  const found = props.options.find((o) => o.id === currentValue.value)
  return found?.label ?? null
})

// Dropdown state
const isOpen = ref(false)
const search = ref('')
const containerRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)

function toggleOpen() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => searchRef.value?.focus())
  }
}

function selectItem(item: ProductCategoryOption) {
  handleChange(item.id)
  modelValue.value = item.id
  isOpen.value = false
  search.value = ''
}

// Click outside to close
function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))

// Sync external v-model changes into vee-validate
watch(
  () => modelValue.value,
  (val) => {
    if (val !== undefined && val !== fieldValue.value) {
      handleChange(val)
    }
  }
)

const filteredGroups = computed(() => {
  const q = search.value.toLowerCase().trim()

  const filtered = q
    ? props.options.filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          o.parentName.toLowerCase().includes(q)
      )
    : props.options

  const map = new Map<string, ProductCategoryOption[]>()
  for (const item of filtered) {
    const key = item.parentName ?? ''
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([parentName, items]) => ({
      parentName,
      items: [...items].sort((a, b) => a.label.localeCompare(b.label)),
    }))
})
</script>
