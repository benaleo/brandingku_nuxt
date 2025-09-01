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
import {
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useVueTable,
} from "@tanstack/vue-table"
import { computed } from 'vue'

type PaginationProp = { page: number; limit: number; total: number }

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: any
  pagination?: PaginationProp
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'limit-change', limit: number): void
}>()

const table = useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
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
          <template v-if="table.getRowModel().rows?.length">
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
                No results.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
    <div class="flex items-center justify-between py-4 gap-4">
      <div class="text-sm text-muted-foreground">
        Page
        <span class="font-medium">{{ (pg?.page ?? 0) + 1 }}</span>
        of
        <span class="font-medium">{{ totalPages }}</span>
        • Total
        <span class="font-medium">{{ pg?.total ?? 0 }}</span>
        items
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2">
          <label class="text-sm">Rows per page</label>
          <select class="border rounded px-2 py-1 text-sm" :value="pg?.limit" @change="onChangeLimit">
            <option v-for="opt in limits" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>
        <Button
            variant="outline"
            size="sm"
            :disabled="!canPrev"
            @click="onPrev"
        >
          Previous
        </Button>
        <Button
            variant="outline"
            size="sm"
            :disabled="!canNext"
            @click="onNext"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>