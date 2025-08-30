<template>
  <div>
    <AppBreadcrumb />
    <AppTableHeader :pageTitle="'Add Child Category'" :create-path="''" />
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const parentId = computed(() => Number(route.params.id))

useHead({ title: 'Add Child Category' })

definePageMeta({ layout: 'console-secret' })
</script>
