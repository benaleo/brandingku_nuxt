  <script setup lang="ts">
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-vue-next'

const router = useRouter()

const props = defineProps<{
  data: {
    id: string
  },
  isDelete: boolean,
  isView?: boolean,
  isEdit?: boolean,
  handleDelete: () => void | Promise<void>
}>()

const valIsDelete = props.isDelete ?? true
const valIsView = props.isView ?? true
const valIsEdit = props.isEdit ?? true

console.log('valIsDelete', valIsDelete)
console.log('valIsView', valIsView)
console.log('valIsEdit', valIsEdit)

function copy(id: string) {
  navigator.clipboard.writeText(id)
}

import AppConfirmDeleteDialog from "~/components/elements/AppConfirmDeleteDialog.vue";
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="w-8 h-8 p-0">
        <span class="sr-only">Open menu</span>
        <MoreHorizontal class="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      <DropdownMenuItem @click="copy(data.id)">
        Copy payment ID
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem v-if="valIsView" @click="router.push(router.currentRoute.value.path + '/' + data.id + '/detail')">View Details</DropdownMenuItem>
      <DropdownMenuItem v-if="valIsEdit" @click="router.push(router.currentRoute.value.path + '/' + data.id + '/edit')">Edit</DropdownMenuItem>
      <AppConfirmDeleteDialog v-if="valIsDelete" :add-fn="handleDelete">Hapus</AppConfirmDeleteDialog>
    </DropdownMenuContent>
  </DropdownMenu>
</template>