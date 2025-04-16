<template>
  <div class="w-full min-h-[50vh] flex gap-4">
    <div class="group relative bg-green-100 flex flex-col justify-center items-start flex-1 overflow-hidden rounded-bl-4xl">
      <nuxt-img :src="`${config.public.BASE_URL}/images/html/register.png`" class="w-full absolute inset-0 opacity-40 group-hover:opacity-100 transition-all duration-500"/>
      <div class="px-16 absolute z-10 text-right">
        <div class="text-2xl font-bold px-4 group-hover:bg-white rounded-t-2xl inline td-500ms">Hello,</div>
        <div class="text-lg font-bold px-4 group-hover:bg-white rounded-br-2xl rounded-l-2xl td-500ms"> yuk daftar sekarang menjadi mitra di brandingku!</div>
        <div class="flex gap-4 mt-8 items-center">
          <p class="text-xl group-hover:bg-white px-4 rounded-xl td-500ms">atau sudah punya akun ?</p>
          <Button @click="$emit('switchTab', 'login')">Masuk</Button>
        </div>
      </div>
    </div>
    <div class="flex-1">Form Register</div>
  </div>
</template>

<script setup>

const config = useRuntimeConfig()
console.log("baseUrl " + config.public.BASE_URL)

const emit = defineEmits(['switchTab'])

const feature = ref()
</script>
