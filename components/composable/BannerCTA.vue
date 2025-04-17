<template>
  <section class="py-16 md:py-24 bg-primary text-white">
    <div class="container px-4">
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
        <p class="text-gray-200 mb-8">Get the latest updates on new products and upcoming sales</p>
        <div class="flex flex-col sm:flex-row gap-2">
          <Input type="email" placeholder="Your email address"
            class="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60" />
          <Button variant="secondary" class="w-full sm:w-auto">Subscribe</Button>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
</script>