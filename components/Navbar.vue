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
                  <NuxtLink
                    v-for="service in services"
                    :key="service.name"
                    :to="service.href"
                    class="block text-gray-700 hover:text-green-600 hover:underline py-2 px-3 rounded hover:bg-green-100"
                  >
                    {{ service.name }}
                  </NuxtLink>
                </div>
              </div>
            </li>
            <li><NuxtLink class="text-slate-700 hover:text-black font-medium" to="/kontak">{{ $t('app.nav.contact') }}</NuxtLink></li>
            <li><NuxtLink class="text-slate-700 hover:text-black font-medium" to="/tentang">{{ $t('app.nav.about') }}</NuxtLink></li>
          </ul>
      </div>
      <div class="flex shrink-0 items-center gap-2 lg:gap-3">
        <!-- Cart -->
        <NuxtLink to="/cart" class="relative inline-flex text-slate-700 hover:text-black" :title="$t('app.nav.cart')" :aria-label="cartCount ? `${$t('app.nav.cart')} (${cartCount})` : $t('app.nav.cart')">
          <ShoppingCart class="size-6" />
          <span v-if="cartCount" class="absolute -right-2 -top-2 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-green-600 px-1 text-[11px] font-semibold leading-none text-white" aria-hidden="true">
            {{ cartCount > 99 ? '99+' : cartCount }}
          </span>
        </NuxtLink>
        <ElementsNotificationBell />
        <!-- Account -->
        <button @click="handleUserClick" class="hidden lg:block text-slate-700 hover:text-black" :title="$t('app.nav.account')" :aria-label="$t('app.nav.account')">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </button>
        <!-- below lg the language toggle lives in the hamburger menu -->
        <div class="hidden lg:block">
          <LanguageSwitcher />
        </div>
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

  </nav>

  <!-- Mobile / tablet menu: full-screen panel sliding in from the right.
       Teleported to <body> because the nav's transform would otherwise trap position:fixed. -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      leave-active-class="transition-transform duration-200 ease-in"
      enter-from-class="translate-x-full"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="mobileOpen"
        id="mobile-menu"
        class="fixed inset-0 z-[70] flex flex-col bg-white lg:hidden"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('app.nav.home')"
      >
        <div class="flex h-[72px] shrink-0 items-center justify-between border-b px-4">
          <NuxtLink to="/" @click="mobileOpen = false">
            <img class="h-[44px] w-auto" src="/images/html/logo.png" alt="Brandingku">
          </NuxtLink>
          <div class="flex items-center gap-2">
            <!-- plain toggle: the LanguageSwitcher dropdown would open behind this full-screen layer -->
            <div class="flex rounded-lg border p-0.5 text-sm font-medium">
              <button
                v-for="code in ['id', 'en']"
                :key="code"
                type="button"
                class="rounded-md px-2.5 py-1 uppercase"
                :class="locale === code ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-slate-100'"
                :aria-pressed="locale === code"
                @click="changeLanguage(code as AppLocale)"
              >
                {{ code }}
              </button>
            </div>
            <button
              type="button"
              class="inline-flex size-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100"
              aria-label="Close menu"
              @click="mobileOpen = false"
            >
              <X class="size-6" />
            </button>
          </div>
        </div>

        <nav class="flex-1 overflow-y-auto px-2 py-3 text-slate-800">
          <ul>
            <li>
              <NuxtLink to="/" class="flex items-center rounded-lg px-3 py-3 text-base font-medium hover:bg-green-50">{{ $t('app.nav.home') }}</NuxtLink>
            </li>

            <!-- categories: expandable, each parent expands to its sub categories -->
            <li>
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-medium hover:bg-green-50"
                :aria-expanded="openSection === 'categories'"
                @click="toggleSection('categories')"
              >
                {{ $t('app.nav.category') }}
                <ChevronDown class="size-5 text-slate-400 transition-transform duration-200" :class="openSection === 'categories' && 'rotate-180'" />
              </button>
              <!-- inert keeps collapsed links out of the tab order -->
              <div class="grid transition-[grid-template-rows] duration-200" :class="openSection === 'categories' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'" :inert="openSection !== 'categories'">
                <ul class="overflow-hidden pl-3">
                  <li v-for="category in categories" :key="category.id">
                    <!-- with sub categories the whole row toggles; the parent page is the first child link -->
                    <button
                      v-if="category.sub_categories?.length"
                      type="button"
                      class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[15px] hover:bg-green-50"
                      :aria-expanded="openCategory === category.id"
                      @click="openCategory = openCategory === category.id ? null : category.id"
                    >
                      <span class="truncate">{{ category.name.charAt(0).toUpperCase() + category.name.slice(1) }}</span>
                      <ChevronDown class="size-4 shrink-0 text-slate-400 transition-transform duration-200" :class="openCategory === category.id && 'rotate-180'" />
                    </button>
                    <NuxtLink
                      v-else
                      :to="`/category/${category.slug || category.id}`"
                      class="block truncate rounded-lg px-3 py-2.5 text-[15px] hover:bg-green-50"
                    >
                      {{ category.name.charAt(0).toUpperCase() + category.name.slice(1) }}
                    </NuxtLink>
                    <div
                      v-if="category.sub_categories?.length"
                      class="grid transition-[grid-template-rows] duration-200"
                      :class="openCategory === category.id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
                      :inert="openCategory !== category.id"
                    >
                      <ul class="ml-3 overflow-hidden border-l border-slate-200 pl-2">
                        <li>
                          <NuxtLink
                            :to="`/category/${category.slug || category.id}`"
                            class="block rounded-lg px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                          >
                            {{ $t('app.nav.allInCategory', { name: category.name.charAt(0).toUpperCase() + category.name.slice(1) }) }}
                          </NuxtLink>
                        </li>
                        <li v-for="sub in category.sub_categories" :key="sub.id">
                          <NuxtLink
                            :to="`/category/${category.slug || category.id}?sub=${sub.slug}`"
                            class="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-green-50 hover:text-green-700"
                          >
                            {{ sub.name.charAt(0).toUpperCase() + sub.name.slice(1) }}
                          </NuxtLink>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <NuxtLink to="/category" class="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-green-700 hover:bg-green-50">{{ $t('app.nav.allCategories') }}</NuxtLink>
                  </li>
                </ul>
              </div>
            </li>

            <!-- services: expandable -->
            <li>
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-medium hover:bg-green-50"
                :aria-expanded="openSection === 'services'"
                @click="toggleSection('services')"
              >
                {{ $t('app.nav.service') }}
                <ChevronDown class="size-5 text-slate-400 transition-transform duration-200" :class="openSection === 'services' && 'rotate-180'" />
              </button>
              <div class="grid transition-[grid-template-rows] duration-200" :class="openSection === 'services' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'" :inert="openSection !== 'services'">
                <ul class="overflow-hidden pl-3">
                  <li v-for="service in services" :key="service.name">
                    <NuxtLink :to="service.href" class="block rounded-lg px-3 py-2.5 text-[15px] hover:bg-green-50" @click="mobileOpen = false">{{ service.name }}</NuxtLink>
                  </li>
                </ul>
              </div>
            </li>

            <li>
              <NuxtLink to="/kontak" class="flex items-center rounded-lg px-3 py-3 text-base font-medium hover:bg-green-50">{{ $t('app.nav.contact') }}</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/tentang" class="flex items-center rounded-lg px-3 py-3 text-base font-medium hover:bg-green-50">{{ $t('app.nav.about') }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="shrink-0 space-y-2 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div class="grid grid-cols-2 gap-2">
            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium hover:bg-green-50" @click="router.push('/cart')">
              <ShoppingCart class="size-4 shrink-0" /> {{ $t('app.nav.cart') }}<span v-if="cartCount"> ({{ cartCount }})</span>
            </button>
            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium hover:bg-green-50" @click="router.push('/wishlist')">
              <Heart class="size-4 shrink-0" /> {{ $t('app.nav.wishlist') }}
            </button>
            <button type="button" class="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium hover:bg-green-50" @click="handleUserClick">
              <User class="size-4 shrink-0" /> {{ $t('app.nav.account') }}
            </button>
          </div>
          <Button class="h-11 w-full bg-green-600 hover:bg-green-700" @click="router.push('/product')">{{ $t('app.nav.searchProduct') }}</Button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { ChevronDown, Heart, Menu as MenuIcon, ShoppingCart, User, X } from 'lucide-vue-next';
import { useRoute, useRouter } from 'vue-router';
import { useProductCategoryService } from '~/services/product-category.service';
import { getSecureIdFromToken } from '~/utils/token.helper';
import LanguageSwitcher from '~/components/LanguageSwitcher.vue';
import type { AppLocale } from '~/composables/useLanguage';

const { t } = useI18n();
const { locale, change: changeLanguage } = useLanguage();
const router = useRouter();
const route = useRoute();
const mobileOpen = ref(false);

// the navbar is on every storefront page, so it keeps the cart badge current
const { count: cartCount, refresh: refreshCart } = useCart();
const loadCart = () => refreshCart().catch((e) => console.error('Failed to load cart', e));
onMounted(loadCart);
// mobile menu accordions start collapsed
const openSection = ref<'categories' | 'services' | null>(null);
const openCategory = ref<number | string | null>(null);
const toggleSection = (key: 'categories' | 'services') => {
  openSection.value = openSection.value === key ? null : key;
};
// close the mobile menu after navigating
watch(() => route.fullPath, () => { mobileOpen.value = false; });
// lock page scroll behind the full-screen menu and reset accordions when it closes
watch(mobileOpen, (open) => {
  if (typeof document !== 'undefined') document.documentElement.style.overflow = open ? 'hidden' : '';
  if (!open) {
    openSection.value = null;
    openCategory.value = null;
  }
});
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') mobileOpen.value = false;
};
const categories = ref<any[]>([]);
const loading = ref(false);

// Authentication check
const token = useCookie<string | null>('token', { sameSite: 'lax' });
// login merges the guest cart into the account; logout switches back to the guest cart
watch(token, loadCart);

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

const services = computed(() => SERVICES.map(s => ({ name: t(`app.services.menu.${s.key}`), href: `/services#${s.id}` })));

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
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  document.documentElement.style.overflow = '';
});
</script>