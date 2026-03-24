<script lang="ts">
export default {
  name: 'FeaturesTestimonial'
}
</script>

<template>
  <div class="w-full px-4 py-12 bg-[#F2F4F7]">
    <div class="container max-w-6xl mx-auto py-12">
      <h2 class="text-3xl font-bold text-center mb-12 text-gray-800">Apa Kata Klien Kami</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Testimonial 1 -->
        <div class="bg-white rounded-lg p-6 shadow-sm relative">
          <div class="text-green-200 text-6xl absolute top-4 right-4 font-serif">"</div>
          <p class="text-gray-700 mb-6 relative z-10">
            "Kualitas merchandise sangat memuaskan. Brandingku mengerti kebutuhan detail dari corporate identity kami. Sangat direkomendasikan!"
          </p>
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
            <div>
              <h4 class="font-semibold text-gray-800">Andi Pratama</h4>
              <p class="text-sm text-gray-600">Marketing Manager, TechCorp</p>
            </div>
          </div>
        </div>

        <!-- Testimonial 2 -->
        <div class="bg-white rounded-lg p-6 shadow-sm relative">
          <div class="text-green-200 text-6xl absolute top-4 right-4 font-serif">"</div>
          <p class="text-gray-700 mb-6 relative z-10">
            "Pengerjaan sangat cepat dan hasil sablonnya rapi sekali. Tidak pernah kecewa order dalam jumlah besar sekalipun."
          </p>
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
            <div>
              <h4 class="font-semibold text-gray-800">Siska Amelia</h4>
              <p class="text-sm text-gray-600">Procurement, Global Logistics</p>
            </div>
          </div>
        </div>

        <!-- Testimonial 3 -->
        <div class="bg-white rounded-lg p-6 shadow-sm relative">
          <div class="text-green-200 text-6xl absolute top-4 right-4 font-serif">"</div>
          <p class="text-gray-700 mb-6 relative z-10">
            "Produk ramah lingkungannya sangat berkualitas. Sangat membantu CSR program perusahaan kami."
          </p>
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
            <div>
              <h4 class="font-semibold text-gray-800">Rendy Wijaya</h4>
              <p class="text-sm text-gray-600">Sustainability Lead, Green Life</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>