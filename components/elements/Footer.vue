<template>
  <div class="w-full bg-green-100 p-4 md:p-12 mt-12">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
      <div class="bg-slate-200 rounded-md px-4">
        <nuxt-img src="http://localhost:3000/images/html/logo.png" width="200"/>
        <div class="flex items-center gap-4">
          <Icon name="ic:baseline-location-on" size="20"/>
          <p class="text-sm">Avoria Estate, Kemang, Bogor</p>
        </div>
        <div class="flex items-center gap-4 mt-2">
          <Icon name="ic:sharp-phone" size="20"/>
          <p class="text-sm">08123456789</p>
        </div>
        <div class="flex items-center gap-4 mt-2">
          <Icon name="ic:baseline-mail-outline" size="20"/>
          <p class="text-sm">info@brandingku.com</p>
        </div>
      </div>
      <div class="bg-slate-200 rounded-md p-4">
        Menu
      </div>
      <div class="bg-slate-200 rounded-md p-4">
        Information Page
      </div>

    </div>
  </div>
</template>