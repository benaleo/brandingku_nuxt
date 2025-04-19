<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {Button} from '@/components/ui/button'
import type { PropType } from 'vue'

defineProps({
  title: String,
  description: String,
  addFn: {
    type: Function as PropType<(...args: any[]) => void>,
    required: true
  }
})

</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger as-child>
      <button class="dropdown-menu-item hover:bg-red-400 hover:text-white rounded-md w-full">
        <slot/>
      </button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title ? title : 'Apakah kamu yakin?' }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{
            description ? description :
                'Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun Anda secara permanen dan menghapus data Anda dari server kami.'
          }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Batal</AlertDialogCancel>
        <AlertDialogAction @click.prevent="addFn">Lanjutkan</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>