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
</script>
