<script setup lang="ts">
import {useRoute} from 'vue-router'
import {computed, onMounted, ref} from 'vue'
import type {FeaturedCategory} from '~/types/LandingPage'
import {useLandingFeaturedCategories} from '~/services/landing-page.service'

const route = useRoute()
const slug = route.params.slug as string

const category = ref<FeaturedCategory | null>(null)

const {
  datas,
  loading,
  error,
  fetchFeaturedCategories
} = useLandingFeaturedCategories(true, slug, true)

const featuredCategories = computed(() => (datas.value ?? []) as FeaturedCategory[])

onMounted(async () => {
  await fetchFeaturedCategories()
  category.value = featuredCategories.value.find(c => c.slug === slug) ?? null
})

const pageTitle = computed(() => {
  return category.value ? `Category: ${category.value.name}` : 'Category'
})

useHead({
  title: pageTitle,
})

definePageMeta({
  layout: 'page-layout'
})
</script>

<template>
  <HeaderProduct :title="pageTitle"/>
  <div class="app-container">
    <div v-if="category">
      <h1 class="text-2xl font-bold mb-4">{{ category.name }}</h1>
      <img :src="category.image" alt="" class="mb-4 w-48 h-48 object-contain"/>
      <p class="text-gray-700">{{ category.description }}</p>
    </div>
    <div v-else>
      <p>Category not found.</p>
    </div>
  </div>
</template>

