<script setup lang="ts">
const { t } = useI18n();
const pageTitle = computed(() => t("app.productPage.title"));

useHead({ title: pageTitle });

definePageMeta({ layout: "page-layout" });
</script>

<template>
  <HeaderProduct :title="pageTitle" tag="h1" />
  <ElementsProductBrowser />
</template>
