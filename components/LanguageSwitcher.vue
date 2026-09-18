<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const { locale, setLocale } = useI18n()

const languages = [
  { code: 'id', name: 'Indonesia', flag: '🇮🇩', label: 'ID' },
  { code: 'en', name: 'English', flag: '🇬🇧', label: 'EN' },
]

const currentLanguage = computed(() => {
  return languages.find((l) => l.code === locale.value) || languages[0]
})

const changeLocale = async (code: 'id' | 'en') => {
  await setLocale(code)
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="sm"
        class="flex items-center gap-1.5 px-2.5 py-1.5 text-xs md:text-sm font-semibold text-slate-700 hover:text-black hover:bg-slate-100 rounded-md border border-slate-200/80 shadow-xs cursor-pointer"
        aria-label="Switch Language"
      >
        <span>{{ currentLanguage.flag }}</span>
        <span>{{ currentLanguage.label }}</span>
        <svg
          class="w-3 h-3 text-slate-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="min-w-[150px] bg-white shadow-xl border border-slate-200 rounded-lg p-1 z-50">
      <DropdownMenuItem
        v-for="lang in languages"
        :key="lang.code"
        @click="changeLocale(lang.code as 'id' | 'en')"
        class="flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-slate-100 transition-colors"
        :class="{ 'font-semibold text-green-700 bg-green-50': locale === lang.code }"
      >
        <span class="flex items-center gap-2">
          <span>{{ lang.flag }}</span>
          <span>{{ lang.name }}</span>
        </span>
        <span v-if="locale === lang.code" class="text-xs text-green-600 font-bold">✓</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
