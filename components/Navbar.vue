<template>
  <!-- one navbar for every size: breakpoints are CSS so the server-rendered HTML always contains the links -->
  <nav class="fixed top-3 md:top-5 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-7xl">
    <div class="h-[60px] px-3 md:px-4 bg-yellow-50 rounded-md shadow flex justify-between items-center gap-3">
      <div class="flex min-w-0 items-center">
        <NuxtLink to="/" class="mr-6 xl:mr-8 shrink-0">
          <img class="h-[44px] md:h-[50px] w-auto" src="/images/html/logo.png" alt="Brandingku">
        </NuxtLink>
          <ul class="hidden lg:flex items-center gap-6">
            <li><NuxtLink class="text-slate-700 hover:text-black font-medium" to="/">{{ $t('app.nav.home') }}</NuxtLink></li>
            <li 
              class="relative group"
            >
              <button class="text-slate-700 hover:text-black font-medium">{{ $t('app.nav.category') }}</button>
              <div 
                class="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-lg shadow-2xl p-6 border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                style="z-index: 9999;"
              >
                <div class="grid grid-cols-3 gap-4">
                  <div v-for="category in categories.filter(cat => cat.sub_categories && cat.sub_categories.length > 0)" :key="category.id" class="space-y-2">
                    <h3 class="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer border-b pb-2 border-slate-200">
                      {{ category.name.toUpperCase() }}
                    </h3>
                    <div class="space-y-1">
                      <a 
                        v-for="sub in category.sub_categories" 
                        :key="sub.id"
                        :href="`/category/${category.slug || category.id}?sub=${sub.slug}`"
                        class="block text-sm text-gray-600 hover:text-green-600 hover:underline hover:bg-green-100 py-1 px-2"
                      >
                        {{ sub.name.charAt(0).toUpperCase() + sub.name.slice(1) }}
                      </a>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <h3 class="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer border-b pb-2 border-slate-200">
                      {{ $t('app.nav.other') }}
                    </h3>
                    <div class="space-y-1">
                      <a 
                        href="/category"
                        class="block text-sm text-gray-600 hover:text-green-600 hover:underline hover:bg-green-100 py-1 px-2"
                      >
                        {{ $t('app.nav.allCategories') }}
                      </a>
                    </div>
                  </div>
                </div>
                <div v-if="categories.length === 0" class="text-gray-500 text-center py-4">
                  {{ $t('app.nav.loadingCategories') }}
                </div>
              </div>
            </li>
            <li 
              class="relative group"
            >
              <button class="text-slate-700 hover:text-black font-medium">{{ $t('app.nav.service') }}</button>
              <div 
                class="absolute top-full left-0 mt-2 w-[300px] bg-white rounded-lg shadow-2xl p-6 border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                style="z-index: 9999;"
              >
                <div class="space-y-3">
                  <a 
                    v-for="service in services" 
                    :key="service.name"
                    :href="service.href"
                    class="block text-gray-700 hover:text-green-600 hover:underline py-2 px-3 rounded hover:bg-green-100"
                  >
                    {{ service.name }}
                  </a>
                </div>
              </div>
            </li>
            <li><NuxtLink class="text-slate-700 hover:text-black font-medium" to="/kontak">{{ $t('app.nav.contact') }}</NuxtLink></li>
            <li><NuxtLink class="text-slate-700 hover:text-black font-medium" to="/tentang">{{ $t('app.nav.about') }}</NuxtLink></li>
          </ul>
      </div>
      <div class="flex shrink-0 items-center gap-2 lg:gap-3">
        <!-- Wishlist -->
        <button @click="router.push('/wishlist')" class="hidden lg:block text-slate-700 hover:text-black" :title="$t('app.nav.cart')" :aria-label="$t('app.nav.cart')">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </button>
        <!-- Account -->
        <button @click="handleUserClick" class="hidden lg:block text-slate-700 hover:text-black" :title="$t('app.nav.account')" :aria-label="$t('app.nav.account')">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </button>
        <LanguageSwitcher />
        <Button @click="router.push('/product')" variant="primary" class="hidden sm:inline-flex bg-green-600 hover:bg-green-700">{{ $t('app.nav.searchProduct') }}</Button>
        <!-- Mobile / tablet menu toggle -->
        <button
          type="button"
          class="lg:hidden inline-flex size-10 items-center justify-center rounded-md text-slate-700 hover:bg-yellow-100"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-menu"
          :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
          @click="mobileOpen = !mobileOpen"
        >
          <X v-if="mobileOpen" class="size-6" />
          <MenuIcon v-else class="size-6" />
        </button>
      </div>
    </div>

    <!-- Mobile / tablet menu -->
    <div
      v-show="mobileOpen"
      id="mobile-menu"
      class="lg:hidden mt-2 max-h-[calc(100svh-6rem)] overflow-y-auto rounded-md bg-white p-4 shadow-xl"
    >
      <ul class="space-y-1 text-slate-700">
        <li><NuxtLink to="/" class="block rounded px-3 py-2 font-medium hover:bg-green-50">{{ $t('app.nav.home') }}</NuxtLink></li>
        <li>
          <NuxtLink to="/category" class="block rounded px-3 py-2 font-medium hover:bg-green-50">{{ $t('app.nav.category') }}</NuxtLink>
          <div v-if="categories.length" class="ml-3 grid grid-cols-2 gap-x-2 border-l pl-2 sm:grid-cols-3">
            <NuxtLink
              v-for="category in categories"
              :key="category.id"
              :to="`/category/${category.slug || category.id}`"
              class="block truncate rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-green-50 hover:text-green-700"
            >
              {{ category.name.charAt(0).toUpperCase() + category.name.slice(1) }}
            </NuxtLink>
          </div>
        </li>
        <li>
          <p class="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{{ $t('app.nav.service') }}</p>
          <a v-for="service in services" :key="service.name" :href="service.href" class="block rounded px-3 py-1.5 text-sm hover:bg-green-50" @click="mobileOpen = false">{{ service.name }}</a>
        </li>
        <li><NuxtLink to="/kontak" class="block rounded px-3 py-2 font-medium hover:bg-green-50">{{ $t('app.nav.contact') }}</NuxtLink></li>
        <li><NuxtLink to="/tentang" class="block rounded px-3 py-2 font-medium hover:bg-green-50">{{ $t('app.nav.about') }}</NuxtLink></li>
      </ul>
      <div class="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
        <button type="button" class="rounded-md border px-3 py-2 text-sm font-medium hover:bg-green-50" @click="router.push('/wishlist')">{{ $t('app.nav.cart') }}</button>
        <button type="button" class="rounded-md border px-3 py-2 text-sm font-medium hover:bg-green-50" @click="handleUserClick">{{ $t('app.nav.account') }}</button>
        <Button class="col-span-2 sm:hidden bg-green-600 hover:bg-green-700" @click="router.push('/product')">{{ $t('app.nav.searchProduct') }}</Button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { Menu as MenuIcon, X } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import { useProductCategoryService } from '~/services/product-category.service';
import { getSecureIdFromToken } from '~/utils/token.helper';
import LanguageSwitcher from '~/components/LanguageSwitcher.vue';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const mobileOpen = ref(false);
// close the mobile menu after navigating
watch(() => route.fullPath, () => { mobileOpen.value = false; });
const categories = ref<any[]>([]);
const loading = ref(false);

// Authentication check
const token = useCookie<string | null>('token', { sameSite: 'lax' });

// Handle user icon click
const handleUserClick = () => {
  if (token.value) {
    // User is logged in, get secure_id from token using helper
    const secureId = getSecureIdFromToken(token.value);
    
    if (secureId) {
      // Redirect to profile page with secure_id
      router.push(`/profile/${secureId}`);
    } else {
      // Token is invalid or doesn't contain secure_id, redirect to login
      router.push('/console/auth');
    }
  } else {
    // User is not logged in, redirect to auth login
    router.push('/console/auth');
  }
};

const services = computed(() => [
  { name: t('app.services.menu.bestService'), href: '#servis-terbaik' },
  { name: t('app.services.menu.freeLogoDesign'), href: '#desain-logo' },
  { name: t('app.services.menu.qualityCheck'), href: '#cek-kualitas' },
  { name: t('app.services.menu.timelyProduction'), href: '#produksi-tepat-waktu' },
  { name: t('app.services.menu.warranty'), href: '#garansi' }
]);

const getFromLocalStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const parsed = JSON.parse(item);
    const now = new Date().getTime();
    
    if (parsed.expiry && now > parsed.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return parsed.data;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

const setToLocalStorage = (key: string, data: any, expiryInHours: number = 24) => {
  try {
    const now = new Date().getTime();
    const expiry = now + (expiryInHours * 60 * 60 * 1000);
    
    localStorage.setItem(key, JSON.stringify({
      data,
      expiry
    }));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

const fetchCategories = async () => {
  const cachedData = getFromLocalStorage('categories');

  if (cachedData) {
    categories.value = cachedData;
    return;
  }

  loading.value = true;
  try {
    const { getProductCategoriesParentNavbar } = useProductCategoryService({ autoFetchParents: false });
    const result = await getProductCategoriesParentNavbar();
    categories.value = result;
    setToLocalStorage('categories', result, 24);
  } catch (error) {
    console.error('Error fetching categories:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});
</script>