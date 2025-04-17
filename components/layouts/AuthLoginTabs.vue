<template>
  <div class="w-full min-h-[50vh] flex gap-4">
    <div class="flex-1 justify-center pt-4">
      <LoginForm/>
    </div>
    <div class="hidden md:flex group relative bg-green-100 flex-col justify-center items-start flex-1 overflow-hidden rounded-br-4xl">
      <nuxt-img :src="`${config.public.BASE_URL}/images/html/login.png`"
                class="w-full absolute inset-0 opacity-40 group-hover:opacity-100 transition-all duration-500"/>
      <div class="px-16 absolute z-10">
        <div class="text-2xl font-bold group-hover:bg-white inline px-4 rounded-t-2xl td-500ms">Selamat datang,</div>
        <div class="text-xl font-bold group-hover:bg-white px-4 rounded-bl-2xl rounded-r-2xl td-500ms"> Mari kembali untuk menggunakan layanan kami
          !
        </div>
        <div class="flex gap-4 mt-8 items-center">
          <p class="text-xl group-hover:bg-white px-4 rounded-xl td-500ms">atau belum punya akun ?</p>
          <Button @click="$emit('switchTab', 'register')">Daftar</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoginForm from "~/components/forms/LoginForm.vue";

const config = useRuntimeConfig()
const emit = defineEmits(['switchTab'])

const feature = ref()
</script>