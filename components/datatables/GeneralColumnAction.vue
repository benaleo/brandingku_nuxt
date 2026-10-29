  <script setup lang="ts">
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-vue-next'

const router = useRouter()
const { canAction } = useConsoleAccess()

const props = defineProps<{
  data: {
    id: string
  },
  isDelete: boolean,
  isView?: boolean,
  isEdit?: boolean,
  handleDelete: () => void | Promise<void>
}>()

const valIsDelete = computed(() => (props.isDelete ?? true) && canAction(router.currentRoute.value.path, 'delete'))
const valIsView = computed(() => (props.isView ?? true) && canAction(router.currentRoute.value.path, 'index'))
const valIsEdit = computed(() => (props.isEdit ?? true) && canAction(router.currentRoute.value.path, 'update'))

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
      <DropdownMenuSeparator />
      <DropdownMenuItem v-if="valIsView" @click="router.push(router.currentRoute.value.path + '/' + data.id + '/detail')">View Details</DropdownMenuItem>
      <DropdownMenuItem v-if="valIsEdit" @click="router.push(router.currentRoute.value.path + '/' + data.id + '/edit')">Edit</DropdownMenuItem>
      <AppConfirmDeleteDialog v-if="valIsDelete" :add-fn="handleDelete">Hapus</AppConfirmDeleteDialog>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
