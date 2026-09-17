<script setup lang="ts">
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {useCookie} from '#app'
import {useProfileService} from '~/services/profile.service'

const { access } = useConsoleAccess()
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
  <div class="w-full h-[40px] bg-slate-200 flex items-center px-4 justify-end">
    <p class="text-md mr-4">Hello, {{ name || 'User' }}</p>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Avatar>
          <AvatarImage v-if="avatarUrl" :src="avatarUrl" :alt="name"/>
          <AvatarFallback>{{ initials }}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56 mr-5">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator/>
        <DropdownMenuGroup>
          <DropdownMenuItem as-child>
            <NuxtLink to="/console/secret/profile">Profile</NuxtLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator/>
        <DropdownMenuItem @click="handleLogout">
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

  </div>
</template>