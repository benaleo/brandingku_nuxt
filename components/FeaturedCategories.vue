<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useLandingFeaturedCategories } from "~/services/landing-page.service";
import type { ProductCategory } from "~/types/products.type";
import { Button } from "~/components/ui/button";
import SkeletonFeaturedCategory from "~/components/skeletons/SkeletonFeaturedCategory.vue";
import { useIntersectionObserver } from '~/composables/useIntersectionObserver';

const { data, loading, error, refetch } = useLandingFeaturedCategories();
const isInitialLoad = ref(true);
const shouldLoad = ref(false);

const featuredCategories = computed<ProductCategory[]>(() => data.value || []);

const config = useRuntimeConfig();
const STORAGE_URL = config.public.STORAGE_URL;

// Set up intersection observer to trigger data loading
const { target } = useIntersectionObserver(() => {
  shouldLoad.value = true
  loadCategories()
})

const loadCategories = async () => {
  if (!shouldLoad.value) return
  await refetch()
  isInitialLoad.value = false
}

// Watch for data changes to complete initial load
watch(data, (newData) => {
  if (newData && newData.length > 0 && shouldLoad.value) {
    isInitialLoad.value = false;
  }
});
</script>

<template>
  <section ref="target" class="md:pb-24 md:max-w-3/4 mx-auto">
    <div class="container px-4 mx-auto">
      <!-- <div class="relative flex justify-center items-center mb-8">
        <h2 class="text-2xl md:text-3xl font-bold">Shop by Category</h2>
      </div> -->
      <div v-if="loading || isInitialLoad" class="text-center">
        <SkeletonFeaturedCategory />
      </div>
      <div v-else-if="error" class="text-center py-8">
        <div class="text-red-500 mb-4">Failed to load categories</div>
        <Button @click="refetch" variant="outline"> Retry </Button>
      </div>
      <div v-else class="flex justify-center items-center gap-4 flex-wrap">
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
                <nuxt-img
                  :src="`${STORAGE_URL}${category.image}`"
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
