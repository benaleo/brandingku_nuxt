<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { reactiveOmit } from '@vueuse/core'
import { DropdownMenuItem, type DropdownMenuItemProps, useForwardProps } from 'reka-ui'

const props = withDefaults(defineProps<DropdownMenuItemProps & {
  class?: HTMLAttributes['class']
  inset?: boolean
  variant?: 'default' | 'destructive'
}>(), {
  variant: 'default',
})

const delegatedProps = reactiveOmit(props, 'inset', 'variant')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <DropdownMenuItem
    data-slot="dropdown-menu-item"
    :data-inset="inset ? '' : undefined"
    :data-variant="variant"
    v-bind="forwardedProps"
    :class="cn(`dropdown-menu-item`, props.class)"
  >
    <slot />
  </DropdownMenuItem>
</template>
