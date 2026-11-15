<script setup lang="ts">
import { computed } from "vue";
import type { ProductCategory } from "~/types/products.type";

const props = defineProps<{ categories: ProductCategory[] | null }>();
const featuredCategories = computed<ProductCategory[]>(() => props.categories || []);

const config = useRuntimeConfig();
const STORAGE_URL = config.public.STORAGE_URL;
</script>

<template>
  <section class="md:pb-24 md:max-w-3/4 mx-auto">
    <div class="container px-4 mx-auto">
      <!-- <div class="relative flex justify-center items-center mb-8">
        <h2 class="text-2xl md:text-3xl font-bold">Shop by Category</h2>
      </div> -->
      <div v-if="featuredCategories.length" class="flex justify-center items-center gap-4 flex-wrap">
        <Card
          v-for="category in featuredCategories"
          :key="category.id"
          class="hover:shadow-md transition-shadow py-0 w-[120px]"
        >
          <NuxtLink :to="`/category/${category.slug}`">
            <CardContent class="p-4 flex flex-col items-center">
              <div
                class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"
              >
                <!-- landing image set in the category form; falls back to the list image -->
                <nuxt-img
                  :src="`${STORAGE_URL}${category.landing_image || category.image}`"
                  :alt="category.name"
                  width="100"
                  height="100"
                />
              </div>
              <h3 class="font-medium text-center">{{ category.name }}</h3>
            </CardContent>
          </NuxtLink>
        </Card>
      </div>
    </div>
  </section>
</template>
