<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FeaturesServices from "~/components/FeaturesServices.vue";
import FeaturesClient from "~/components/FeaturesClient.vue";
import FeaturesBenefitFaq from "~/components/FeaturesBenefitFaq.vue";
import { fetchFeaturedProducts } from "~/composables/useFeaturedProduct";
import type { ProductCategory } from "~/types/products.type";
import type { Client } from "~/types/client.type";
import type { Testimonial } from "~/types/testimonial.type";
import type { ReviewSummary } from "~/types/aftercare.type";

const { t } = useI18n();
const { gqlFetch } = useGql();

// a failing section resolves to null so it renders empty and the rest of the page still renders
const safe = async <T,>(label: string, fn: () => Promise<T>): Promise<T | null> => {
  try {
    return await fn();
  } catch (e) {
    console.error(`[home] ${label} failed`, e);
    return null;
  }
};

const { data: home } = await useAsyncData("home-sections", async () => {
  const [categories, products, clients, testimonials, score, benefits] = await Promise.all([
    safe("categories", async () =>
      (await gqlFetch<{ getProductCategories: ProductCategory[] }>(
        `query GetProductCategories { getProductCategories(is_landing_page: true) { id name image landing_image slug } }`,
      )).getProductCategories || [],
    ),
    safe("products", () => fetchFeaturedProducts(gqlFetch)),
    safe("clients", async () =>
      (await gqlFetch<{ getClients: { items: Client[] } }>(
        `query GetClients($page: Int!, $limit: Int!, $is_active: Boolean) { getClients(pagination: { page: $page, limit: $limit }, is_active: $is_active) { items { id name logo orders } } }`,
        { page: 1, limit: 10, is_active: true },
      )).getClients?.items || [],
    ),
    safe("testimonials", async () =>
      (await gqlFetch<{ getTestimonials: { items: Testimonial[] } }>(
        `query GetTestimonials($page: Int!, $limit: Int!, $is_active: Boolean, $placement: String) {
          getTestimonials(pagination: { page: $page, limit: $limit }, is_active: $is_active, placement: $placement) {
            items { id name job content rating orders is_active placement product_id product_name order_id public_consent created_at }
          }
        }`,
        { page: 1, limit: 12, is_active: true, placement: "landing_page" },
      )).getTestimonials?.items?.map((x) => ({ ...x, id: String(x.id) })) || [],
    ),
    safe("testimonial summary", async () =>
      (await gqlFetch<{ getTestimonialSummary: ReviewSummary }>(
        `query testimonialSummary($placement: String!, $product: Int) {
          getTestimonialSummary(placement: $placement, product_id: $product) { count average distribution { stars count } }
        }`,
        { placement: "landing_page", product: null },
      )).getTestimonialSummary,
    ),
    safe("benefits", async () =>
      (await gqlFetch<{ getBenefits: { items: { id: number; question: string; answer: string }[] } }>(
        `query GetBenefits($page: Int!, $limit: Int!) {
          getBenefits(pagination: { page: $page, limit: $limit }, sort: { column: ORDERS, direction: ASC }) {
            items { id question answer }
          }
        }`,
        { page: 1, limit: 10 },
      )).getBenefits?.items?.map((b) => ({ ...b, id: String(b.id) })) || [],
    ),
  ]);
  return { categories, products, clients, testimonials, score, benefits };
});

usePageSeo({
  title: () => t("app.meta.title"),
  description: () => t("app.meta.description"),
});
useOrganizationSchema();

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
    <FeaturedCategories :categories="home?.categories ?? null" />

    <!-- Featured Products -->
    <FeaturesProduct :products="home?.products ?? null" />

    <!-- Clients -->
    <FeaturesClient :clients="home?.clients ?? null" />

    <!-- Testimonials -->
    <FeaturesTestimonial :testimonials="home?.testimonials ?? null" :score="home?.score ?? null" />

    <!-- Benefit FAQ -->
    <FeaturesBenefitFaq :benefits="home?.benefits ?? null" />
    <!-- </section> -->

    <!-- Newsletter -->
    <BannerCTA />
  </div>
</template>
