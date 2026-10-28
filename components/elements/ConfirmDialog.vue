<script setup lang="ts">
import type { Component } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

// a confirmation that stays open while the action runs; extra fields go in the default slot
const open = defineModel<boolean>('open', { default: false })
const props = withDefaults(defineProps<{
  title: string
  description?: string
  confirmLabel: string
  cancelLabel?: string
  tone?: 'primary' | 'danger'
  icon?: Component
  busy?: boolean
}>(), { tone: 'primary' })
const emit = defineEmits<{ confirm: [] }>()

const onOpenChange = (value: boolean) => {
  if (!props.busy) open.value = value
}
</script>

<template>
  <AlertDialog :open="open" @update:open="onOpenChange">
    <AlertDialogContent class="max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md">
      <div class="p-6 text-center sm:flex sm:gap-4 sm:text-left">
        <div
          v-if="icon"
          class="mx-auto mb-4 flex size-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:mb-0"
          :class="tone === 'danger' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'"
        >
          <component :is="icon" class="size-6" />
        </div>
        <div class="min-w-0 flex-1">
          <AlertDialogTitle class="text-lg font-semibold leading-snug text-slate-900">{{ title }}</AlertDialogTitle>
          <AlertDialogDescription v-if="description" class="mt-2 text-sm text-slate-600">{{ description }}</AlertDialogDescription>
          <slot />
        </div>
      </div>
      <div class="flex flex-col-reverse gap-2 border-t bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
        <AlertDialogCancel :disabled="busy" class="mt-0">{{ cancelLabel ?? $t('app.common.back') }}</AlertDialogCancel>
        <Button
          :disabled="busy"
          :class="tone === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'"
          @click="emit('confirm')"
        >
          <Loader2 v-if="busy" class="size-4 animate-spin" />
          {{ confirmLabel }}
        </Button>
      </div>
    </AlertDialogContent>
  </AlertDialog>
</template>
