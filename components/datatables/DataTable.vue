<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef } from '@tanstack/vue-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useVueTable,
} from "@tanstack/vue-table"
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

type PaginationProp = { page: number; limit: number; total: number }
// overrides for the built-in English copy, e.g. translated labels on public pages
type TableLabels = {
  noResults?: string
  summary?: (page: number, pages: number, total: number) => string
  rowsPerPage?: string
  previous?: string
  next?: string
}

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: any
  pagination?: PaginationProp
  loading?: boolean
  skeletonRows?: number
  labels?: TableLabels
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
}>()

const table = useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
  get manualPagination() { return !!props.pagination },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  meta: props.meta,
})

// normalize pagination to support passing a Ref or plain object
const pg = computed<PaginationProp | undefined>(() => {
  const p: any = props.pagination as any
  return p && typeof p === 'object' && 'value' in p ? p.value : props.pagination
})

const totalPages = computed(() => {
  const total = pg.value?.total ?? 0
  const limit = pg.value?.limit ?? 10
  const pages = Math.ceil((total || 0) / (limit || 1))
  return pages > 0 ? pages : 1
})

const skeletonRows = computed(() => Array.from({ length: props.skeletonRows ?? 10 }))

const canPrev = computed(() => (pg.value?.page ?? 0) > 0)
const canNext = computed(() => (pg.value ? (pg.value.page + 1) < totalPages.value : false))

const onPrev = () => {
  if (!pg.value) return
  const nextPage = pg.value.page - 1
  if (nextPage >= 0) emit('page-change', nextPage)
}
const onNext = () => {
  if (!pg.value) return
  const nextPage = pg.value.page + 1
  if ((nextPage + 1) <= totalPages.value) emit('page-change', nextPage)
}

const limits = [10, 20, 50, 100]
const onChangeLimit = (e: Event) => {
  const val = Number((e.target as HTMLSelectElement)?.value || 10)
  emit('limit-change', val)
}
</script>

<template>
  <div>
    <div class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                  v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                  :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="props.loading">
            <TableRow v-for="(_, rowIndex) in skeletonRows" :key="`skeleton-${rowIndex}`">
              <TableCell v-for="column in table.getVisibleLeafColumns()" :key="column.id">
                <Skeleton class="h-8 w-full" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="table.getRowModel().rows?.length">
            <TableRow
                v-for="row in table.getRowModel().rows" :key="row.id"
                :data-state="row.getIsSelected() ? 'selected' : undefined"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colspan="props.columns.length" class="h-24 text-center">
                {{ props.labels?.noResults ?? 'No results.' }}
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
    <!-- one row on wide screens; on phones the summary sits above a row of page size and arrows -->
    <div class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div v-if="props.labels?.summary" class="text-sm text-muted-foreground">
        {{ props.labels.summary((pg?.page ?? 0) + 1, totalPages, pg?.total ?? 0) }}
      </div>
      <div v-else class="text-sm text-muted-foreground">
        Halaman <span class="font-medium text-foreground">{{ (pg?.page ?? 0) + 1 }}</span> dari
        <span class="font-medium text-foreground">{{ totalPages }}</span> ·
        <span class="font-medium text-foreground">{{ pg?.total ?? 0 }}</span> data
      </div>
      <div class="flex items-center justify-between gap-2 sm:justify-end">
        <label class="flex items-center gap-2 whitespace-nowrap text-sm text-muted-foreground">
          {{ props.labels?.rowsPerPage ?? 'Per halaman' }}
          <select class="h-8 rounded-md border bg-background px-2 text-sm text-foreground" :value="pg?.limit" @change="onChangeLimit">
            <option v-for="opt in limits" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </label>
        <div class="flex items-center gap-1">
          <Button
              variant="outline"
              size="icon"
              class="size-8"
              :aria-label="props.labels?.previous ?? 'Sebelumnya'"
              :disabled="props.loading || !canPrev"
              @click="onPrev"
          >
            <ChevronLeft class="size-4"/>
          </Button>
          <span class="min-w-12 text-center text-sm tabular-nums">{{ (pg?.page ?? 0) + 1 }} / {{ totalPages }}</span>
          <Button
              variant="outline"
              size="icon"
              class="size-8"
              :aria-label="props.labels?.next ?? 'Berikutnya'"
              :disabled="props.loading || !canNext"
              @click="onNext"
          >
            <ChevronRight class="size-4"/>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
