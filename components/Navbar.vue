<template>
  <nav v-if="isDesktop" class="fixed top-5 left-1/2 transform -translate-x-1/2 z-10">
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
  <nav v-if="!isDesktop" class="fixed top-5 left-1/2 w-[90vw] transform -translate-x-1/2 z-20">
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isDesktop = ref(false);

const checkScreenWidth = () => {
  isDesktop.value = window.innerWidth >= 768; // md breakpoint
};

onMounted(() => {
  checkScreenWidth();
  window.addEventListener('resize', checkScreenWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenWidth);
});
</script>