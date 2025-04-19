<template>
  <section class="py-16 md:py-24 md:max-w-3/4 mx-auto">
    <div class="container px-4 mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold mb-8 text-center">Shop by Category</h2>
      <div v-if="loading" class="text-center py-8">Loading...</div>
      <div v-else-if="error" class="text-center py-8 text-red-500">{{ error }}</div>
      <div v-else class="flex justify-center items-center gap-4">
        <Card v-for="category in featuredCategories" :key="category.slug" class="hover:shadow-md transition-shadow py-0 w-[120px]">
          <NuxtLink :to="`/category/${category.slug}`">
            <CardContent class="p-4 flex flex-col items-center">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <nuxt-img :src="`${category.image}`" width="100" height="100"/>
              </div>
              <h3 class="font-medium text-center">{{ category.name }}</h3>
            </CardContent>
          </NuxtLink>
        </Card>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {computed, onMounted} from 'vue'
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