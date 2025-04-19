<template>
  <section class="py-16 md:py-24 md:max-w-3/4 mx-auto">
    <div class="container px-4 mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold mb-8 text-center">Shop by Category</h2>
      <div v-if="loading" class="text-center py-8">Loading...</div>
      <div v-else-if="error" class="text-center py-8 text-red-500">{{ error }}</div>
      <div v-else class="flex justify-center items-center gap-4">
        <Card v-for="category in featuredCategories" :key="category.slug" class="hover:shadow-md transition-shadow">
          <CardContent class="p-4 flex flex-col items-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span class="text-2xl">
                <nuxt-img :src="`${category.image}`" width="100" height="100" />
              </span>
            </div>
            <h3 class="font-medium">{{ category.name }}</h3>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {onMounted, computed} from 'vue'
import {useLandingFeaturedCategories} from '~/services/landing-page.service'
import type {FeaturedCategory} from "~/types/LandingPage";

const {
  datas,
  loading,
  error,
  fetchFeaturedCategories
} = useLandingFeaturedCategories(true, null, true)

const featuredCategories = computed(() => (datas.value ?? []) as FeaturedCategory[])

onMounted(() => {
  fetchFeaturedCategories()
})
</script>