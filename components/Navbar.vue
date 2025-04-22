<template>
  <nav class="fixed top-5 left-1/2 transform -translate-x-1/2 z-10 hidden md:block">
    <div class="overflow-hidden w-full md:w-[90vw] h-[60px] px-2 md:px-4 bg-yellow-50 rounded-md shadow md:sticky top-0 flex justify-between items-center">
      <div class="flex items-center justify-start">
        <NuxtLink to="/">
          <img class="h-[50px]" src="/images/html/logo.png" alt="logo">
        </NuxtLink>
        <ul class="flex space-x-4">
          <li><NuxtLink class="text-slate-400 hover:text-black" href="#">Tumbler</NuxtLink></li>
          <li><NuxtLink class="text-slate-400 hover:text-black" href="#">Powerbank</NuxtLink></li>
          <li><NuxtLink class="text-slate-400 hover:text-black" href="#">Stationary</NuxtLink></li>
          <li><NuxtLink class="text-slate-400 hover:text-black" href="#">Fashion</NuxtLink></li>
        </ul>
      </div>
      <div>
        <Button @click="router.push('/product')" variant="primary">Products</Button>
      </div>
    </div>
  </nav>
  <nav class="fixed top-5 left-1/2 w-[90vw] transform -translate-x-1/2 z-10 md:hidden block z-20">
    <div class="overflow-hidden w-full h-[60px] px-2 md:px-4 bg-yellow-50 rounded-md shadow md:sticky top-0 flex justify-between items-center">
      <div class="flex items-center justify-start">
        <NuxtLink to="/">
          <img class="h-[50px]" src="/images/html/logo.png" alt="logo">
        </NuxtLink>
  
      </div>
      <div>
        <Button @click="router.push('/product')" variant="primary">Products</Button>
      </div>
    </div>
  </nav>

</template>

<script setup lang="ts">
const router = useRouter();
</script>