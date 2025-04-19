<script setup lang="ts">
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import {useCookie} from '#app'

const handleLogout = () => {
  const token = useCookie('token')
  token.value = null
  window.location.href = '/'
}
</script>

<template>
  <div class="w-full h-[40px] bg-slate-200 flex items-center px-4 justify-end">
    <p class="text-md mr-4">Hello, User</p>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Avatar>
          <AvatarImage src="https://github.com/unovue.png" alt="@unovue"/>
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56 mr-5">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator/>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <span>Profile</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>Settings</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator/>
        <DropdownMenuItem>
          <span>GitHub</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <span>API</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator/>
        <DropdownMenuItem @click="handleLogout">
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

  </div>
</template>