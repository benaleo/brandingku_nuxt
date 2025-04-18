<script setup lang="ts">
import {Button} from '@/components/ui/button'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger,} from '@/components/ui/dialog'
import {DialogClose, DialogTitle} from "~/components/ui/dialog";

defineProps({
  src: String,
  alt: String,
  class: String
})
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <button>
        <img :src :alt :class>
      </button>
    </DialogTrigger>
    <DialogContent class="">
      <DialogHeader class="p-6 pb-0">
        <DialogTitle>View Image</DialogTitle>

        <DialogDescription>
          <img :src :alt class="max-h-[50vh]">
        </DialogDescription>
      </DialogHeader>

      <DialogFooter class="p-6 pt-0">
        <DialogClose as-child>
          <Button type="button">
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>