<script setup lang="ts">
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {useSidebar} from '@/components/ui/sidebar'
import {Menu as MenuIcon} from 'lucide-vue-next'
import {useCookie} from '#app'
import {useProfileService} from '~/services/profile.service'

const { access } = useConsoleAccess()
const { openMobile, setOpenMobile } = useSidebar()
const service = useProfileService()
const config = useRuntimeConfig()
const name = ref('')
const avatarUrl = ref('')
const initials = computed(() => name.value.trim().slice(0, 2).toUpperCase() || 'U')

const load = async () => {
  if (!access.value?.user_id) return
  try {
    const profile = await service.myProfile(access.value.user_id).then(r => r.getUserDetail)
    name.value = profile?.name || ''
    avatarUrl.value = profile?.avatar ? (/^https?:\/\//.test(profile.avatar) ? profile.avatar : String(config.public.STORAGE_URL) + profile.avatar) : ''
  } catch { /* keep navbar usable even if profile fetch fails */ }
}
watch(() => access.value?.user_id, load, { immediate: true })

const handleLogout = () => {
  const token = useCookie('token')
  token.value = null
  window.location.href = '/'
}
</script>

<template>
  <header class="sticky top-0 z-30 flex h-14 w-full items-center justify-end border-b bg-background/80 px-4 backdrop-blur">
    <!-- up to 768px the sidebar is a sheet (sliding in from the left), opened from the right of the bar -->
    <button
      type="button"
      class="-mr-2 inline-flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-[769px]:hidden"
      aria-label="Buka menu"
      :aria-expanded="openMobile"
      @click="setOpenMobile(true)"
    >
      <MenuIcon class="size-6"/>
    </button>
    <!-- on phones the profile and logout live in the bottom navigation and the profile page -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child class="max-[768px]:hidden">
        <button
          type="button"
          class="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar class="size-8">
            <AvatarImage v-if="avatarUrl" :src="avatarUrl" :alt="name"/>
            <AvatarFallback class="bg-muted text-xs font-medium text-muted-foreground">{{ initials }}</AvatarFallback>
          </Avatar>
          <span class="hidden max-w-[10rem] truncate font-medium text-foreground sm:block">{{ name || 'User' }}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-56">
        <DropdownMenuLabel class="font-normal">
          <p class="truncate text-sm font-medium">{{ name || 'User' }}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator/>
        <DropdownMenuItem as-child>
          <NuxtLink to="/console/secret/profile">Profile</NuxtLink>
        </DropdownMenuItem>
        <DropdownMenuSeparator/>
        <DropdownMenuItem @click="handleLogout">
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </header>
</template>
