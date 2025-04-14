<template>
  <div class="w-full bg-green-200 p-4 md:p-12">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
      <div class="rounded-md px-4">
        <nuxt-img src="http://localhost:3000/images/html/logo.png" width="200" />
        <div class="flex items-center gap-4">
          <Icon name="ic:baseline-location-on" size="20" />
          <p class="text-sm">Avoria Estate, Kemang, Bogor</p>
        </div>
        <div class="flex items-center gap-4 mt-2">
          <Icon name="ic:sharp-phone" size="20" />
          <p class="text-sm">08123456789</p>
        </div>
        <div class="flex items-center gap-4 mt-2">
          <Icon name="ic:baseline-mail-outline" size="20" />
          <p class="text-sm">info@brandingku.com</p>
        </div>
      </div>
      <div class="rounded-md p-4">
        Menu
      </div>
      <div class="rounded-md p-4">
        Information Page
      </div>
      <div class="rounded-md p-4">
        Social Media
      </div>

    </div>
  </div>
</template>