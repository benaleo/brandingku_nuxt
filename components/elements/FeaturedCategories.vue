<template>
  <section class="py-16 md:py-24 md:max-w-3/4 mx-auto">
    <div class="container px-4 mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold mb-8 text-center">Shop by Category</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card v-for="category in categories" :key="category.id" class="hover:shadow-md transition-shadow">
          <CardContent class="p-4 flex flex-col items-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span class="text-2xl">{{ category.icon }}</span>
            </div>
            <h3 class="font-medium">{{ category.name }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ category.count }} items</p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Data would typically come from an API in a real app
const categories = [
  { id: 1, name: "Electronics", icon: "📱", count: 42 },
  { id: 2, name: "Home", icon: "🏠", count: 36 },
  { id: 3, name: "Fashion", icon: "👕", count: 58 },
  { id: 4, name: "Beauty", icon: "💄", count: 27 }
]
</script>