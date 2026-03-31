<template>
  <div>
    <AppBreadcrumb />
    <AppTableHeader :pageTitle="pageTitle" :create-path="''" />
    <div class="max-w-3xl">
      <ProductCategoryForm :isChild="true" :parentId="parentId" :hideSubCategories="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/tailwind.css' // Ensure Tailwind CSS is loaded
import AppBreadcrumb from '~/components/elements/AppBreadcrumb.vue'
import AppTableHeader from '~/components/elements/AppTableHeader.vue'
import ProductCategoryForm from '~/components/forms/ProductCategoryForm.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const parentId = computed(() => Number(route.params.id))

const pageTitle = computed(() => {
  return 'Tambah Sub Kategori'
})

useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: pageTitle }
  ]
})

definePageMeta({ layout: 'console-secret' })
</script>
