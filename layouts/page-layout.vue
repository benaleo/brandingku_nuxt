<template>
<Navbar/>
  <main class="bg-white min-h-screen">
    <slot/>
  </main>
  <Footer class=""/>
</template>

<script setup lang="ts">
import Navbar from '~/components/Navbar.vue';

</script>