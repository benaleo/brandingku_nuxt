<template>
  <footer class="w-full bg-gray-900 text-white p-8 md:p-12">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
      <!-- Brandingku Section -->
      <div>
        <h3 class="text-xl font-bold mb-4">Brandingku</h3>
        <p class="text-gray-300 mb-4 text-sm">
          {{ $t('app.footer.tagline') }}
        </p>
        <div class="space-y-2 text-sm text-gray-300">
          <div class="flex items-start gap-2">
            <Icon name="ic:baseline-location-on" size="16" class="mt-1 flex-shrink-0" />
            <a v-if="mapsUrl" :href="mapsUrl" target="_blank" rel="noopener" class="hover:text-white transition-colors">{{ address }}</a>
            <span v-else>{{ address }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="ic:sharp-phone" size="16" />
            <a :href="phoneHref" class="hover:text-white transition-colors">{{ phone }}</a>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="ic:baseline-mail-outline" size="16" />
            <a :href="emailHref" class="hover:text-white transition-colors">{{ email }}</a>
          </div>
        </div>
      </div>

      <!-- Popular Section -->
      <div>
        <h3 class="text-xl font-bold mb-4">{{ $t('app.footer.popular') }}</h3>
        <ul class="space-y-2 text-sm text-gray-300">
          <li><a href="#" class="hover:text-white transition-colors">{{ $t('app.footer.links.usbDrive') }}</a></li>
          <li><a href="#" class="hover:text-white transition-colors">{{ $t('app.footer.links.tumbler') }}</a></li>
          <li><a href="#" class="hover:text-white transition-colors">{{ $t('app.footer.links.powerbank') }}</a></li>
        </ul>
      </div>

      <!-- Support Section -->
      <div>
        <h3 class="text-xl font-bold mb-4">{{ $t('app.footer.support') }}</h3>
        <ul class="space-y-2 text-sm text-gray-300">
          <li><a href="#" class="hover:text-white transition-colors">{{ $t('app.footer.links.bulkOrders') }}</a></li>
          <li><a href="#" class="hover:text-white transition-colors">{{ $t('app.footer.links.contact') }}</a></li>
          <li><a href="#" class="hover:text-white transition-colors">{{ $t('app.footer.links.faq') }}</a></li>
        </ul>
      </div>

      <!-- Quick Links Section -->
      <div>
        <h3 class="text-xl font-bold mb-4">{{ $t('app.footer.quickLinks') }}</h3>
        <ul class="space-y-2 text-sm text-gray-300">
          <li><a href="#" class="hover:text-white transition-colors">{{ $t('app.footer.links.aboutUs') }}</a></li>
          <li><NuxtLink to="/portfolio" class="hover:text-white transition-colors">{{ $t('app.footer.links.portfolio') }}</NuxtLink></li>
          <li><a href="#" class="hover:text-white transition-colors">{{ $t('app.footer.links.sustainability') }}</a></li>
          <li><a href="#" class="hover:text-white transition-colors">{{ $t('app.footer.links.shippingPolicy') }}</a></li>
        </ul>
      </div>
    </div>

    <!-- Copyright Notice & Language Selection -->
    <div class="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto text-sm text-gray-400">
      <p class="text-center">{{ $t('app.footer.copyright') }}</p>
      <div role="group" :aria-label="$t('app.language.switch')" class="flex items-center gap-2">
        <button
          @click="setLocale('id')"
          class="px-2 py-1 rounded text-xs transition-colors"
          :class="locale === 'id' ? 'bg-green-700 text-white font-semibold' : 'text-gray-400 hover:text-white'"
          :aria-pressed="locale === 'id'"
        >
          🇮🇩 ID
        </button>
        <span class="text-gray-600" aria-hidden="true">|</span>
        <button
          @click="setLocale('en')"
          class="px-2 py-1 rounded text-xs transition-colors"
          :class="locale === 'en' ? 'bg-green-700 text-white font-semibold' : 'text-gray-400 hover:text-white'"
          :aria-pressed="locale === 'en'"
        >
          🇬🇧 EN
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n();
// contact details are editable in the console Options menu
const { phone, email, address, mapsUrl, phoneHref, emailHref } = useSiteSettings();
</script>