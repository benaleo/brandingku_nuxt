<template>
  <footer class="w-full bg-gray-900 text-white p-8 md:p-12">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 md:gap-8 max-w-7xl mx-auto">
      <!-- Brandingku Section -->
      <div class="mb-6 md:mb-0">
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

      <!-- Link sections: accordions on phones, all collapsed at first; always open from md -->
      <div v-for="section in sections" :key="section.key" class="border-t border-gray-800 md:border-0">
        <h3 class="text-base font-semibold md:mb-4 md:text-xl md:font-bold">
          <button
            type="button"
            class="flex w-full items-center justify-between py-3 md:hidden"
            :aria-expanded="openSection === section.key"
            :aria-controls="`footer-${section.key}`"
            @click="openSection = openSection === section.key ? null : section.key"
          >
            {{ $t(section.title) }}
            <ChevronDown class="size-5 text-gray-400 transition-transform" :class="openSection === section.key && 'rotate-180'" />
          </button>
          <span class="hidden md:inline">{{ $t(section.title) }}</span>
        </h3>
        <ul
          :id="`footer-${section.key}`"
          class="space-y-2 text-sm text-gray-300 md:block md:pb-0"
          :class="openSection === section.key ? 'block pb-4' : 'hidden'"
        >
          <li v-for="link in section.links" :key="link.label">
            <NuxtLink v-if="link.to" :to="link.to" class="hover:text-white transition-colors">{{ $t(link.label) }}</NuxtLink>
            <a v-else href="#" class="hover:text-white transition-colors">{{ $t(link.label) }}</a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Copyright Notice & Language Selection -->
    <div class="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto text-sm text-gray-400">
      <ElementsCopyright class="text-center" />
      <div role="group" :aria-label="$t('app.language.switch')" class="flex items-center gap-2">
        <button
          @click="changeLanguage('id')"
          class="px-2 py-1 rounded text-xs transition-colors"
          :class="locale === 'id' ? 'bg-green-700 text-white font-semibold' : 'text-gray-400 hover:text-white'"
          :aria-pressed="locale === 'id'"
        >
          🇮🇩 ID
        </button>
        <span class="text-gray-600" aria-hidden="true">|</span>
        <button
          @click="changeLanguage('en')"
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
import { ChevronDown } from 'lucide-vue-next';

const { locale, change: changeLanguage } = useLanguage();
// contact details are editable in the console Options menu
const { phone, email, address, mapsUrl, phoneHref, emailHref } = useSiteSettings();

const sections: { key: string; title: string; links: { label: string; to?: string }[] }[] = [
  {
    key: 'popular',
    title: 'app.footer.popular',
    links: [{ label: 'app.footer.links.usbDrive' }, { label: 'app.footer.links.tumbler' }, { label: 'app.footer.links.powerbank' }],
  },
  {
    key: 'support',
    title: 'app.footer.support',
    links: [{ label: 'app.footer.links.bulkOrders' }, { label: 'app.footer.links.contact' }, { label: 'app.footer.links.faq' }],
  },
  {
    key: 'quick-links',
    title: 'app.footer.quickLinks',
    links: [
      { label: 'app.footer.links.aboutUs' },
      { label: 'app.footer.links.portfolio', to: '/portfolio' },
      { label: 'app.footer.links.sustainability' },
      { label: 'app.footer.links.shippingPolicy' },
    ],
  },
];
// one section open at a time on phones
const openSection = ref<string | null>(null);
</script>