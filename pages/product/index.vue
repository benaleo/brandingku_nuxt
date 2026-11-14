<script setup lang="ts">
const { t } = useI18n();
const pageTitle = computed(() => t("app.productPage.title"));

usePageSeo({ title: pageTitle, description: () => t("app.productPage.metaDescription") });

definePageMeta({ layout: "page-layout" });
</script>

<template>
  <HeaderProduct :title="pageTitle" tag="h1" />
  <ElementsProductBrowser />
</template>
