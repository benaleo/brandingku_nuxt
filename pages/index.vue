<script setup>
import { computed } from "vue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FeaturesServices from "~/components/FeaturesServices.vue";
import FeaturesClient from "~/components/FeaturesClient.vue";
import FeaturesBenefitFaq from "~/components/FeaturesBenefitFaq.vue";

const { t } = useI18n();

useHead({
  title: computed(() => t("app.meta.title")),
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

    <!-- Benefit FAQ -->
    <FeaturesBenefitFaq />
    <!-- </section> -->

    <!-- Newsletter -->
    <BannerCTA />
  </div>
</template>
