<template>
  <Navbar />
  <main class="bg-green-100 min-h-screen">
    <slot />
  </main>
  <Footer />
</template>

<script setup lang="ts">
import Navbar from "~/components/Navbar.vue";
import Footer from "~/components/Footer.vue";
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Store the current route before navigating away
const storeCurrentRoute = () => {
  if (process.client) {
    localStorage.setItem('lastHistory', window.location.pathname);
  }
};

// Get the last stored route
const getLastHistory = (): string | null => {
  if (process.client) {
    return localStorage.getItem('lastHistory');
  }
  return null;
};

// Set up navigation guards
onMounted(() => {
  // Store the current route when component is mounted
  storeCurrentRoute();

  // Add before navigation guard to store the current route before navigating away
  router.beforeEach((to, from, next) => {
    storeCurrentRoute();
    next();
  });
});

// Expose the getter to be used in components
defineExpose({
  getLastHistory
});
</script>
