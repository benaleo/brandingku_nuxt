<script setup>
// Import shadcn-vue components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FeaturesServices from "~/components/FeaturesServices.vue";
import FeaturesClient from "~/components/FeaturesClient.vue";

const pageTitle = "Brandingku - Best Merchandise Supplier";

useHead({
  title: pageTitle,
});

definePageMeta({
  layout: "default",
});
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Section -->
    <Hero />

    <!-- <section class="app-container"> -->
      <!-- Our Services -->
      <FeaturesServices />

      <!-- Featured Categories -->
      <FeaturedCategories />

      <!-- Featured Products -->
      <FeaturesProduct />

      <!-- Clients -->
      <FeaturesClient />

      <!-- Testimonials -->
      <FeaturesTestimonial />
    <!-- </section> -->

    <!-- Benefit FAQ -->

    <!-- Newsletter -->
    <BannerCTA />
  </div>
</template>
