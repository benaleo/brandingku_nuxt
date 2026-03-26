<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative bg-green-600 text-white overflow-hidden min-h-screen">
      <!-- Wave SVG at bottom -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
        </svg>
      </div>
      
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 container mx-auto px-6 py-20 z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div class="inline-block px-4 py-2 bg-white/20 rounded-full mb-6">
              <span class="text-sm font-semibold">OUR JOURNEY</span>
            </div>
            <h1 class="text-5xl font-bold mb-6">Crafting Identity Through Quality.</h1>
            <p class="text-xl leading-relaxed opacity-90">
              We transform your brand vision into tangible, memorable experiences through premium merchandise and strategic branding solutions that resonate with your audience.
            </p>
          </div>
          <div class="relative">
            <img src="/images/about/about-hero.png" alt="About Brandingku" class="rotate-3 rounded-lg shadow-2xl" />
            <div class="absolute bg-white text-green-600 px-4 py-3 rounded-lg shadow-lg" style="left: -40px; bottom: -15px">
              <div class="text-2xl font-bold">5+</div>
              <div class="text-xs">Years of experience</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- The Brandingku Legacy Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4 items-end">
            <img src="/images/about/legacy-1.png" alt="Legacy 1" class="rounded-lg shadow-md" />
            <img src="/images/about/legacy-2.png" alt="Legacy 2" class="rounded-lg shadow-md" />
          </div>
          <div class="grid grid-cols-2 gap-4 items-start">
            <img src="/images/about/legacy-3.png" alt="Legacy 3" class="rounded-lg shadow-md" />
            <img src="/images/about/legacy-4.png" alt="Legacy 4" class="rounded-lg shadow-md" />
          </div>
          </div>
          <div>
            <h2 class="text-4xl font-bold mb-6 text-gray-800">The Brandingku Legacy</h2>
            <p class="text-lg text-gray-600 mb-8 leading-relaxed">
              For over a decade, we've been the trusted partner for businesses seeking to make their mark. From startups to enterprises, we've helped thousands of brands create lasting impressions through thoughtful design and quality merchandise.
            </p>
            <div class="flex gap-8">
              <div>
                <div class="text-4xl font-bold text-green-600">100+</div>
                <div class="text-gray-600">Happy Clients</div>
              </div>
              <div>
                <div class="text-4xl font-bold text-green-600">100K+</div>
                <div class="text-gray-600">Products Delivered</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Vision and Mission Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Vision Card -->
          <div class="bg-white p-8 rounded-xl shadow-lg">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Icon name="lucide:eye" class="w-6 h-6 text-green-600" />
            </div>
            <h3 class="text-2xl font-bold mb-4 text-gray-800">Our Vision</h3>
            <p class="text-gray-600 leading-relaxed">
              To be the leading catalyst for brand transformation, empowering businesses to create meaningful connections through exceptional merchandise and innovative branding strategies.
            </p>
          </div>

          <!-- Mission Card -->
          <div class="bg-green-600 p-8 rounded-xl shadow-lg text-white">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-6">
              <Icon name="lucide:target" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-2xl font-bold mb-4">Our Mission</h3>
            <p class="leading-relaxed opacity-90">
              We deliver premium branding solutions that combine creativity, quality, and strategic thinking to help our clients stand out in competitive markets and build lasting brand equity.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Values Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold mb-4 text-gray-800">Core Values</h2>
          <p class="text-lg text-gray-600">The principles that guide everything we do</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Sustainable Impact -->
          <div class="col-span-2 bg-white border border-gray-200 p-6 rounded-xl shadow-md">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Icon name="lucide:leaf" class="w-6 h-6 text-green-600" />
            </div>
            <h4 class="text-xl font-semibold mb-3 text-gray-800">Sustainable Impact</h4>
            <p class="text-gray-600 mb-4">
              We prioritize eco-friendly materials and sustainable practices in all our production processes.
            </p>
            <div class="flex gap-2">
              <span class="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">Eco-Friendly</span>
              <span class="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">Green</span>
            </div>
          </div>

          <!-- Uncompromising Quality -->
          <div class="p-6 rounded-xl shadow-md text-white" style="background-color: #B14665;">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Icon name="lucide:award" class="w-6 h-6 text-white" />
            </div>
            <h4 class="text-xl font-semibold mb-3">Uncompromising Quality</h4>
            <p class="opacity-90">
              Every product we create meets the highest standards of craftsmanship and durability.
            </p>
          </div>

          <!-- Circular Innovation -->
          <div class="p-6 rounded-xl shadow-md text-slate-700" style="background-color: #E0E3E6;">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Icon name="lucide:refresh-cw" class="w-6 h-6 text-slate-700" />
            </div>
            <h4 class="text-xl font-semibold mb-3">Circular Innovation</h4>
            <p class="opacity-90">
              We embrace circular economy principles to minimize waste and maximize resource efficiency.
            </p>
          </div>

          <!-- Holistic Partnership -->
          <div class="col-span-2 bg-gray-800 p-6 rounded-xl shadow-md text-white">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Icon name="lucide:users" class="w-6 h-6 text-white" />
            </div>
            <h4 class="text-xl font-semibold mb-3">Holistic Partnership</h4>
            <p class="opacity-90">
              We work closely with clients as strategic partners, ensuring their brand vision is fully realized.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Meet the Visionaries Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="flex justify-between items-center mb-12">
          <div>
            <h2 class="text-4xl font-bold mb-4 text-gray-800">Meet the Visionaries</h2>
            <p class="text-lg text-gray-600">The creative minds behind Brandingku's success</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Team Member 1 -->
          <div class="p-2 rounded-xl text-center">
            <img src="/images/about/person-1.png" alt="Team Member" class="w-full rounded-md mx-auto mb-4 object-cover" />
            <h4 class="text-lg font-semibold text-gray-800">Sarah Johnson</h4>
            <p class="text-gray-600">Creative Director</p>
          </div>

          <!-- Team Member 2 -->
          <div class="p-2 rounded-xl text-center">
            <img src="/images/about/person-2.png" alt="Team Member" class="w-full rounded-md mx-auto mb-4 object-cover" />
            <h4 class="text-lg font-semibold text-gray-800">Michael Chen</h4>
            <p class="text-gray-600">Brand Strategist</p>
          </div>

          <!-- Team Member 3 -->
          <div class="p-2 rounded-xl text-center">
            <img src="/images/about/person-3.png" alt="Team Member" class="w-full rounded-md mx-auto mb-4 object-cover" />
            <h4 class="text-lg font-semibold text-gray-800">Emily Rodriguez</h4>
            <p class="text-gray-600">Design Lead</p>
          </div>

          <!-- Team Member 4 -->
          <div class="p-2 rounded-xl text-center">
            <img src="/images/about/person-4.png" alt="Team Member" class="w-full rounded-md mx-auto mb-4 object-cover" />
            <h4 class="text-lg font-semibold text-gray-800">David Kim</h4>
            <p class="text-gray-600">Operations Manager</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action Section -->
    <section class="py-20 bg-green-600 text-white">
      <div class="container mx-auto px-6 text-center">
        <h2 class="text-4xl font-bold mb-6">Ready to build your brand's physical legacy?</h2>
        <p class="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          Let's collaborate to create exceptional merchandise and branding solutions that will make your business unforgettable.
        </p>
        <div class="flex gap-4 justify-center">
          <button class="px-8 py-4 bg-black/80 text-white rounded-lg hover:bg-green-800 transition-colors font-semibold">
            Start Your Project
          </button>
          <button class="px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
            Download Catalog
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Page setup
useHead({
  title: 'About Us - Brandingku',
  meta: [
    { name: 'description', content: 'Learn about Brandingku - Your trusted partner for premium branding solutions and merchandise.' }
  ]
})
</script>

<style lang="css">
section{
    padding: 6rem 0;
}
</style>