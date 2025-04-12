<template>
  <div class="flex justify-center items-center gap-5 flex-col">
    <Hero/>
    <FeaturedCategories/>
    <FeaturesProduct/>
    <Footer/>
  </div>
</template>

<script setup lang="ts">
import Hero from "~/components/elements/Hero.vue";
import FeaturedCategories from "~/components/elements/FeaturedCategories.vue";
import FeaturesProduct from "~/components/elements/FeaturesProduct.vue";
import Footer from "~/components/elements/Footer.vue";
</script>