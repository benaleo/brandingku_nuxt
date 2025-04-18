<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-vue-next'
import AppConfirmDeleteDialog from "~/components/elements/AppConfirmDeleteDialog.vue";
import type { PropType } from 'vue'

const router = useRouter()

defineProps<{
  data: {
    id: string
  },
  isDelete: boolean,
  handleDelete: () => void | Promise<void>
}>()

let isDelete = ref(true)

function copy(id: string) {
  navigator.clipboard.writeText(id)
}

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
      <DropdownMenuItem @click="router.push(router.currentRoute.value.path + '/' + data.id + '/detail')">View Details</DropdownMenuItem>
      <DropdownMenuItem @click="router.push(router.currentRoute.value.path + '/' + data.id + '/edit')">Edit</DropdownMenuItem>
      <AppConfirmDeleteDialog v-if="isDelete" :add-fn="handleDelete">Hapus</AppConfirmDeleteDialog>
    </DropdownMenuContent>
  </DropdownMenu>
</template>