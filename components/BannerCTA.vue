<template>
  <section class="py-16 md:py-24 bg-green-800 text-white rounded-2xl mx-4 mb-2">
    <div class="container px-4">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-2xl md:text-4xl font-bold mb-6">{{ $t('app.bannerCta.title') }}</h2>
        <p class="text-lg md:text-xl mb-8 text-gray-100">{{ $t('app.bannerCta.description') }}</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            class="bg-white rounded-md text-green-600 hover:bg-green-100 inline-flex items-center justify-center gap-2 px-6 py-3"
            @click="openChat()"
          >
            <MessageCircle class="w-5 h-5" />
            {{ $t('app.bannerCta.chatAdmin') }}
          </button>
          <NuxtLink to="/kontak" class="bg-green-600 rounded-md hover:bg-green-700 text-white inline-flex items-center justify-center px-6 py-3">
            {{ $t('app.bannerCta.requestQuote') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { MessageCircle } from 'lucide-vue-next'

const { openChat } = useChatWidget()
</script>