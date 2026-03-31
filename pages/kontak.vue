<script lang="ts" setup>
import { Phone, Mail, MapPin, Globe, Users, Clock, ArrowRight } from 'lucide-vue-next'

useHead({
  title: "Kontak - Brandingku",
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="ps bg-linear-green relative text-white overflow-hidden min-h-screen ">
      <!-- Wave SVG at bottom -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="#F9FAFB"/>
        </svg>
      </div>
      
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 container mx-auto px-6 py-20 z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div class="inline-block px-4 py-2 bg-white/20 rounded-full mb-6">
              <span class="text-sm font-semibold">CONTACT US</span>
            </div>
            <h1 class="text-5xl font-bold mb-6">Get in touch with us.</h1>
            <p class="text-xl leading-relaxed opacity-90">
              We're here to help you start your next sustainable merchandise project. 
              Let's create something meaningful for the planet together.
            </p>
          </div>
          <div class="relative flex justify-center">
            <img src="/public/images/no-image.jpg" alt="Contact Brandingku" class="max-w-[500px] rotate-3 rounded-lg shadow-2xl" />
            <div class="absolute bg-white text-green-600 px-4 py-3 rounded-lg shadow-lg" style="left: 70px; bottom: -15px">
              <div class="text-2xl font-bold">24/7</div>
              <div class="text-xs">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Cards -->
    <div class="max-w-7xl mx-auto px-4 mb-12">
      <div class="relative z-1 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-[-7rem]">
        <!-- Call Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone class="w-6 h-6 text-green-600" />
          </div>
          <h3 class="font-semibold text-lg mb-2">Give us a call</h3>
          <p class="text-gray-600 mb-3">Mon-Fri from 8am to 5pm.</p>
          <p class="font-medium text-gray-900">+1 (234) 567-890</p>
        </div>

        <!-- Email Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail class="w-6 h-6 text-green-600" />
          </div>
          <h3 class="font-semibold text-lg mb-2">Send us an email</h3>
          <p class="text-gray-600 mb-3">Our friendly team is here to help.</p>
          <p class="font-medium text-gray-900">hello@brandingku.com</p>
        </div>

        <!-- Office Card -->
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin class="w-6 h-6 text-green-600" />
          </div>
          <h3 class="font-semibold text-lg mb-2">Visit our office</h3>
          <p class="text-gray-600 mb-3">Come say hello at our HQ.</p>
          <p class="font-medium text-gray-900">123 Eco Valley, Sustainable Dr. Green City, Earth 50291</p>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Contact Form -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-2xl font-bold mb-2">Send us a message</h2>
            <p class="text-gray-600 mb-6">We'll get back to you within 24 hours.</p>
            
            <form class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">FULL NAME</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  placeholder="john@example.com"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">SUBJECT</label>
                <select class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option>Sustainable Merchandise Inquiry</option>
                  <option>General Question</option>
                  <option>Partnership Opportunity</option>
                  <option>Support Request</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">MESSAGE</label>
                <textarea 
                  placeholder="Tell us about your project..."
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                ></textarea>
              </div>

              <button 
                type="submit"
                class="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Studio Image -->
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <div class="relative h-48 bg-gradient-to-br from-green-400 to-green-600">
              <div class="absolute inset-0 flex items-center justify-center text-white">
                <div class="text-center">
                  <div class="text-xs font-semibold mb-1">OUR STUDIO</div>
                  <div class="text-lg font-bold">The Greenhouse HQ</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Global Support -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-bold mb-3">Global Support</h3>
            <p class="text-gray-600 text-sm mb-4">
              Operating from the heart of the sustainable tech hub, we coordinate with eco-certified manufacturers worldwide to ensure your branding leaves a mark on the world, not the environment.
            </p>
            <div class="flex justify-around">
              <div class="text-center">
                <Globe class="w-8 h-8 text-green-600 mx-auto mb-1" />
                <div class="text-xs text-gray-600">Worldwide</div>
              </div>
              <div class="text-center">
                <Users class="w-8 h-8 text-green-600 mx-auto mb-1" />
                <div class="text-xs text-gray-600">Expert Team</div>
              </div>
              <div class="text-center">
                <Clock class="w-8 h-8 text-green-600 mx-auto mb-1" />
                <div class="text-xs text-gray-600">24/7 Support</div>
              </div>
            </div>
          </div>

          <!-- Sustainable Report -->
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-bold mb-3">Sustainable Report 2024</h3>
            <p class="text-gray-600 text-sm mb-4">
              Read about how we helped 500+ brands reduce their plastic waste by 40%.
            </p>
            <a href="#" class="inline-flex items-center text-green-600 font-semibold hover:text-green-700">
              View Report
              <ArrowRight class="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
