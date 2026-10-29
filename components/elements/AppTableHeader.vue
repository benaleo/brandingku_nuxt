<script setup lang="ts">
defineProps({
  pageTitle: {
    type: String,
    required: true
  },
  createPath:{
    type: String
  }
})
const router = useRouter()
const { canVisit } = useConsoleAccess()
const handleAdd = (path : string) => {
  router.push(path)
}
</script>

<template>
  <div class="flex justify-between items-center mb-2">
    <h1 class="text-2xl font-bold mt-4">{{ pageTitle }}</h1>
    <Button v-if="createPath && canVisit(createPath)" @click="handleAdd(createPath)" variant="primary">Tambah +</Button>
  </div>
</template>

<style scoped>

</style>
