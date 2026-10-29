<script setup lang="ts">
import { Check, Globe } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AppLocale } from '~/composables/useLanguage'

// a globe that opens the language choice; the active language is highlighted
const { locale, change } = useLanguage()

const languages: { code: AppLocale; name: string; label: string }[] = [
  { code: 'id', name: 'Indonesia', label: 'ID' },
  { code: 'en', name: 'English', label: 'EN' },
]
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="size-9 rounded-full text-slate-700 hover:bg-slate-100 hover:text-black"
        :aria-label="`Bahasa / Language (${locale.toUpperCase()})`"
        :title="locale === 'en' ? 'Language' : 'Bahasa'"
      >
        <Globe class="size-6" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="z-50 min-w-[160px] rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
      <DropdownMenuItem
        v-for="lang in languages"
        :key="lang.code"
        class="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm"
        :class="locale === lang.code ? 'bg-green-50 font-semibold text-green-700' : 'text-slate-700 hover:bg-slate-100'"
        @click="change(lang.code)"
      >
        <span class="flex items-center gap-2">
          <span class="w-6 text-xs font-bold">{{ lang.label }}</span>
          <span>{{ lang.name }}</span>
        </span>
        <Check v-if="locale === lang.code" class="size-4" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
