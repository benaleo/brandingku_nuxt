<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { useRouter } from "vue-router";
import { ref, computed, onMounted, nextTick, watch } from "vue";

// The product list of /product: search, sort, wishlist, quick view and pages. Without
// `categoryId` visitors pick a category in a sheet; with it (a category page) the list stays
// in that category, its sub categories included, and the category filter is hidden.
const props = defineProps<{ categoryId?: number | null; title?: string }>();
const scoped = computed(() => props.categoryId !== undefined);
import { refDebounced } from "@vueuse/core";

import { useProductService } from "~/services/product.service";
import { useGql } from "~/composables/useGql";
import {
  ArrowDownUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-vue-next";
import ElementsProductQuickView from "~/components/elements/ElementsProductQuickView.vue";
import ChatProductButton from "~/components/elements/ChatProductButton.vue";
import { toast } from "vue-sonner";

const { t } = useI18n();
const { token, createWishlist, deleteWishlist } = useWishlist();

const handleWishlistToggle = async (product: any) => {
  if (!token.value) {
    router.push("/console/auth");
    return;
  }
  const productId = product?.id;
  if (!productId) return;
  try {
    if (product.is_wishlisted) {
      await deleteWishlist(Number(productId));
      toast.success(t("app.productPage.wishlistRemoved"));
      product.is_wishlisted = false;
    } else {
      await createWishlist(Number(productId));
      toast.success(t("app.productPage.wishlistAdded"));
      product.is_wishlisted = true;
    }
  } catch (e: any) {
    toast.error(e?.message || t("app.productPage.wishlistFailed"));
  }
};

const router = useRouter();
const config = useRuntimeConfig();
const STORAGE_URL = config.public.STORAGE_URL;

// MARK : SORT OPTIONS (backend whitelist: name, created_at, updated_at)
const sortOptions = [
  { value: "created_at,desc", labelKey: "newest" },
  { value: "updated_at,desc", labelKey: "updated" },
  { value: "name,asc", labelKey: "nameAsc" },
  { value: "name,desc", labelKey: "nameDesc" },
  { value: "created_at,asc", labelKey: "oldest" },
];
const sortLabel = (labelKey: string) => t(`app.productPage.sortOptions.${labelKey}`);
const DEFAULT_SORT = sortOptions[0]!.value;

const productService = useProductService(true, undefined, {
  params: { is_active: true, sortBy: DEFAULT_SORT, ...(props.categoryId != null ? { category_id: props.categoryId } : {}) },
});
const {
  datas: products,
  loading,
  pageInfo,
  pagination,
  params,
  setParams,
  changePage,
} = productService;

// filters reset to the first page; the params watcher in the service refetches
const applyParams = (next: Record<string, any>) => {
  pagination.value.page = 0;
  setParams(next);
};

// MARK : CATEGORIES
const { gqlFetch } = useGql();
const categoriesAll = ref<any[]>([]);
const categoriesLoading = ref(false);

const fetchAllCategories = async () => {
  categoriesLoading.value = true;
  try {
    const query = `
      query getProductCategories($only_parent: Boolean) {
        getProductCategories(only_parent: $only_parent) {
          id
          name
          slug
          is_active
          parent_id
        }
      }
    `;
    const res = await gqlFetch<{ getProductCategories: any[] }>(
      query,
      { only_parent: false },
      { auth: true }
    );
    categoriesAll.value = (res?.getProductCategories || []).filter(
      (c: any) => c?.is_active !== false
    );
  } catch {
    categoriesAll.value = [];
  } finally {
    categoriesLoading.value = false;
  }
};

onMounted(() => { if (!scoped.value) fetchAllCategories(); });

const parentCategories = computed(() =>
  categoriesAll.value.filter((c: any) => c?.parent_id == null)
);
const childrenMap = computed<Record<number, any[]>>(() => {
  const map: Record<number, any[]> = {};
  for (const c of categoriesAll.value) {
    if (c?.parent_id == null) continue;
    const pid = Number(c.parent_id);
    (map[pid] ||= []).push(c);
  }
  return map;
});

const selectedCategoryId = computed(() =>
  params.category_id != null ? Number(params.category_id) : null
);
const selectedCategory = computed(() =>
  categoriesAll.value.find((c: any) => Number(c.id) === selectedCategoryId.value)
);

const openParents = ref<Record<number, boolean>>({});
const toggleParent = (id: number) => {
  openParents.value[id] = !openParents.value[id];
};

const filterOpen = ref(false);
const openFilter = () => {
  // reveal the group that holds the current selection
  const pid = selectedCategory.value?.parent_id;
  if (pid != null) openParents.value[Number(pid)] = true;
  filterOpen.value = true;
};
const selectCategory = (id: number | null) => {
  applyParams({ category_id: id });
  filterOpen.value = false;
};

// MARK : SORT
const sortOpen = ref(false);
const activeSort = computed(() => params.sortBy || DEFAULT_SORT);
const activeSortLabel = computed(() => {
  const option = sortOptions.find((o) => o.value === activeSort.value);
  return option ? sortLabel(option.labelKey) : "";
});
const selectSort = (value: string) => {
  applyParams({ sortBy: value });
  sortOpen.value = false;
};

// MARK : SEARCH
const searchOpen = ref(false);
const searchInput = ref("");
const searchInputEl = ref<HTMLInputElement | null>(null);
const debouncedSearch = refDebounced(searchInput, 350);

watch(debouncedSearch, (kw) => {
  if ((params.keyword || "") !== kw.trim()) applyParams({ keyword: kw.trim() });
});

const openSearch = async () => {
  searchInput.value = params.keyword || "";
  searchOpen.value = true;
  await nextTick();
  searchInputEl.value?.focus();
};
const closeSearch = () => {
  searchOpen.value = false;
};
const submitSearch = () => {
  if ((params.keyword || "") !== searchInput.value.trim())
    applyParams({ keyword: searchInput.value.trim() });
  closeSearch();
  scrollToList();
};
const clearSearch = () => {
  searchInput.value = "";
  applyParams({ keyword: "" });
};
const searchPreview = computed(() => (products.value || []).slice(0, 6));

const onSearchKey = (e: KeyboardEvent) => {
  if (e.key === "Escape") closeSearch();
};
watch(searchOpen, (v) => {
  if (typeof document === "undefined") return;
  document.documentElement.style.overflow = v ? "hidden" : "";
  if (v) window.addEventListener("keydown", onSearchKey);
  else window.removeEventListener("keydown", onSearchKey);
});
onBeforeUnmount(() => {
  if (typeof document === "undefined") return;
  if (searchOpen.value) document.documentElement.style.overflow = "";
  window.removeEventListener("keydown", onSearchKey);
});

// a category page's own category is not a filter the visitor can clear
const hasActiveFilters = computed(
  () => (!scoped.value && selectedCategoryId.value != null) || !!params.keyword
);
const resetAll = () => {
  searchInput.value = "";
  applyParams(scoped.value ? { keyword: "" } : { category_id: null, keyword: "" });
};

// a category page switching sub category lists from the first page again
watch(() => props.categoryId, (id) => {
  if (scoped.value && id != null && Number(params.category_id) !== id) applyParams({ category_id: id });
});

// MARK : PRODUCT CARD
const productMinPrice = (p: any) => {
  const prices = (Array.isArray(p?.additionals) ? p.additionals : [])
    .map((a: any) => Number(a?.price) || 0)
    .filter((n: number) => n > 0);
  return prices.length ? Math.min(...prices) : 0;
};
const formatPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const brokenImages = ref<Record<string, boolean>>({});

const quickViewOpen = ref(false);
const selectedProduct = ref<any | null>(null);
const openQuickView = (product: any) => {
  selectedProduct.value = product;
  quickViewOpen.value = true;
};

// MARK : PAGINATION (UI uses 1-based labels)
const listTop = ref<HTMLElement | null>(null);
const scrollToList = () => {
  listTop.value?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const totalItems = computed(() => Number(pageInfo.value?.total_items || 0));
const totalPages = computed(() => Number(pageInfo.value?.total_pages || 1));
const currentPageLabel = computed(() =>
  Number(pageInfo.value?.current_page || pagination.value.page + 1)
);
// current page with one neighbour each side, plus first and last
const pageItems = computed<(number | "…")[]>(() => {
  const total = totalPages.value;
  const cur = currentPageLabel.value;
  const pages = new Set([1, total, cur - 1, cur, cur + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1]! > 1) out.push("…");
    out.push(p);
  });
  return out;
});
const goToPage = (p1: number) => {
  if (p1 < 1 || p1 > totalPages.value || p1 === currentPageLabel.value) return;
  changePage(p1 - 1);
  scrollToList();
};

</script>

<template>
  <div>
  <section class="app-container px-4 pb-16 pt-6 sm:px-6 md:pt-4 lg:px-8">
    <div ref="listTop" class="scroll-mt-28">
      <h2 class="text-2xl font-bold capitalize text-gray-900 sm:text-3xl">{{ title || $t('app.productPage.listTitle') }}</h2>
      <p class="mt-1 text-sm text-gray-500">
        <template v-if="loading && !totalItems">{{ $t('app.productPage.loading') }}</template>
        <template v-else>{{ $t('app.productPage.found', { count: totalItems }, totalItems) }}</template>
      </p>

      <!-- MARK : TOOLBAR -->
      <div class="mt-4 flex items-center gap-2">
        <button
          v-if="!scoped"
          type="button"
          class="inline-flex h-10 min-w-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors"
          :class="
            selectedCategoryId != null
              ? 'border-green-600 bg-green-50 text-green-800'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          "
          @click="openFilter"
        >
          <SlidersHorizontal class="h-4 w-4 shrink-0" />
          <span class="truncate">{{ selectedCategory?.name || $t('app.productPage.filter') }}</span>
          <span
            v-if="selectedCategoryId != null"
            class="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1 text-xs text-white"
            >1</span
          >
        </button>
        <button
          type="button"
          class="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:px-4"
          :aria-label="$t('app.productPage.sort')"
          @click="sortOpen = true"
        >
          <ArrowDownUp class="h-4 w-4" />
          <span class="hidden sm:inline">{{ activeSortLabel }}</span>
        </button>
        <button
          type="button"
          class="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors"
          :class="
            params.keyword
              ? 'border-green-600 bg-green-50 text-green-800'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          "
          :aria-label="$t('app.productPage.search')"
          @click="openSearch"
        >
          <Search class="h-4 w-4" />
        </button>
      </div>

      <!-- MARK : ACTIVE FILTERS -->
      <div v-if="hasActiveFilters" class="mt-3 flex flex-wrap items-center gap-2">
        <span
          v-if="params.keyword"
          class="inline-flex max-w-full items-center gap-1 rounded-full bg-gray-100 py-1 pl-3 pr-1 text-xs text-gray-700"
        >
          <span class="truncate">"{{ params.keyword }}"</span>
          <button
            type="button"
            class="rounded-full p-1 hover:bg-gray-200"
            :aria-label="$t('app.productPage.clearSearch')"
            @click="clearSearch"
          >
            <X class="h-3 w-3" />
          </button>
        </span>
        <span
          v-if="selectedCategory && !scoped"
          class="inline-flex max-w-full items-center gap-1 rounded-full bg-gray-100 py-1 pl-3 pr-1 text-xs text-gray-700"
        >
          <span class="truncate">{{ selectedCategory.name }}</span>
          <button
            type="button"
            class="rounded-full p-1 hover:bg-gray-200"
            :aria-label="$t('app.productPage.clearCategory')"
            @click="applyParams({ category_id: null })"
          >
            <X class="h-3 w-3" />
          </button>
        </span>
        <button
          type="button"
          class="text-xs font-medium text-green-700 hover:underline"
          @click="resetAll"
        >
          {{ $t('app.productPage.resetAll') }}
        </button>
      </div>
    </div>

    <!-- MARK : GRID -->
    <div
      v-if="loading && !(products || []).length"
      class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6"
    >
      <div v-for="i in 8" :key="i" class="overflow-hidden rounded-2xl border bg-white">
        <div class="aspect-square animate-pulse bg-gray-100" />
        <div class="space-y-2 p-3 sm:p-4">
          <div class="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
          <div class="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
          <div class="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    </div>

    <div
      v-else-if="(products || []).length"
      class="mt-6 grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6"
      :class="{ 'opacity-60': loading }"
    >
      <article
        v-for="product in products"
        :key="product.id"
        class="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
      >
        <NuxtLink :to="`/product/${product.slug}`" class="flex flex-1 flex-col">
          <div class="relative aspect-square overflow-hidden bg-gray-50">
            <img
              v-if="product.image && !brokenImages[product.id]"
              :src="STORAGE_URL + product.image"
              :alt="product.name"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              @error="brokenImages[product.id] = true"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-4xl font-bold uppercase text-green-700/40"
            >
              {{ product.name?.charAt(0) }}
            </div>
            <button
              type="button"
              class="absolute inset-x-3 bottom-3 hidden translate-y-2 rounded-full bg-white/95 py-2 text-sm font-medium text-gray-900 opacity-0 shadow transition-all group-hover:translate-y-0 group-hover:opacity-100 lg:block"
              @click.prevent.stop="openQuickView(product)"
            >
              {{ $t('app.productPage.quickView') }}
            </button>
          </div>
          <div class="flex flex-1 flex-col p-3 sm:p-4">
            <p
              v-if="product.category?.name"
              class="truncate text-[11px] font-medium uppercase tracking-wide text-green-700 sm:text-xs"
            >
              {{ product.category.name }}
            </p>
            <h3 class="mt-0.5 line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base">
              {{ product.name }}
            </h3>
            <div class="mt-auto pt-2">
              <template v-if="productMinPrice(product) > 0">
                <span class="block text-[11px] text-gray-500">{{ $t('app.productPage.startingFrom') }}</span>
                <span class="text-sm font-bold text-gray-900 sm:text-base">
                  {{ formatPrice(productMinPrice(product)) }}
                </span>
                <span class="text-xs text-gray-500">{{ $t('app.productPage.perPcs') }}</span>
              </template>
              <span v-else class="text-sm font-bold text-green-600">{{ $t('app.productPage.askNow') }}</span>
            </div>
          </div>
        </NuxtLink>
        <div class="flex gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
          <ChatProductButton :product="product" class="min-w-0 flex-1" />
          <Button
            variant="outline"
            size="sm"
            :aria-label="product.is_wishlisted ? $t('app.productPage.wishlistRemove') : $t('app.productPage.wishlistAdd')"
            :class="
              product.is_wishlisted
                ? 'border-red-200 text-red-700 hover:bg-red-50'
                : 'border-green-200 text-green-700 hover:bg-green-50'
            "
            @click.stop="handleWishlistToggle(product)"
          >
            <svg
              class="h-4 w-4"
              :fill="product.is_wishlisted ? 'currentColor' : 'none'"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </Button>
        </div>
      </article>
    </div>

    <div
      v-else
      class="mt-6 flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center"
    >
      <PackageSearch class="h-10 w-10 text-gray-400" />
      <p class="mt-3 font-semibold text-gray-900">{{ $t('app.productPage.emptyTitle') }}</p>
      <p class="mt-1 max-w-sm text-sm text-gray-500">
        {{ $t('app.productPage.emptyDescription') }}
      </p>
      <Button v-if="hasActiveFilters" variant="outline" class="mt-4" @click="resetAll">
        {{ $t('app.productPage.resetFilter') }}
      </Button>
    </div>

    <!-- MARK : PAGINATION -->
    <nav
      v-if="totalPages > 1"
      class="mt-10 flex items-center justify-center gap-1 sm:gap-2"
      :aria-label="$t('app.productPage.pagination')"
    >
      <Button
        variant="outline"
        size="icon"
        :aria-label="$t('app.productPage.prevPage')"
        :disabled="!pageInfo?.has_previous_page"
        @click="goToPage(currentPageLabel - 1)"
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>
      <template v-for="(p, i) in pageItems" :key="`${p}-${i}`">
        <span v-if="p === '…'" class="px-1 text-gray-400">…</span>
        <Button
          v-else
          size="icon"
          :variant="p === currentPageLabel ? 'default' : 'outline'"
          :aria-current="p === currentPageLabel ? 'page' : undefined"
          @click="goToPage(p)"
        >
          {{ p }}
        </Button>
      </template>
      <Button
        variant="outline"
        size="icon"
        :aria-label="$t('app.productPage.nextPage')"
        :disabled="!pageInfo?.has_next_page"
        @click="goToPage(currentPageLabel + 1)"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
    </nav>
  </section>

  <!-- MARK : FILTER SHEET -->
  <ElementsInsetSheet
    v-model:open="filterOpen"
    :title="$t('app.productPage.filter')"
    :description="$t('app.productPage.filterDescription')"
  >
    <div v-if="categoriesLoading" class="space-y-2">
      <div v-for="i in 5" :key="i" class="h-10 animate-pulse rounded-lg bg-gray-100" />
    </div>
    <ul v-else class="space-y-1">
      <li>
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-gray-50"
          :class="selectedCategoryId === null ? 'bg-green-50 text-green-800' : 'text-gray-800'"
          @click="selectCategory(null)"
        >
          {{ $t('app.productPage.allProducts') }}
          <Check v-if="selectedCategoryId === null" class="h-4 w-4" />
        </button>
      </li>
      <li v-for="parent in parentCategories" :key="parent.id">
        <button
          v-if="(childrenMap[parent.id] || []).length"
          type="button"
          class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"
          :aria-expanded="!!openParents[parent.id]"
          @click="toggleParent(Number(parent.id))"
        >
          <span class="capitalize">{{ parent.name }}</span>
          <ChevronDown
            class="h-4 w-4 text-gray-400 transition-transform"
            :class="{ 'rotate-180': openParents[parent.id] }"
          />
        </button>
        <button
          v-else
          type="button"
          class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-gray-50"
          :class="
            selectedCategoryId === Number(parent.id) ? 'bg-green-50 text-green-800' : 'text-gray-800'
          "
          @click="selectCategory(Number(parent.id))"
        >
          <span class="capitalize">{{ parent.name }}</span>
          <Check v-if="selectedCategoryId === Number(parent.id)" class="h-4 w-4" />
        </button>
        <ul
          v-if="(childrenMap[parent.id] || []).length && openParents[parent.id]"
          class="mb-1 ml-3 space-y-0.5 border-l pl-2"
        >
          <li v-for="child in childrenMap[parent.id]" :key="child.id">
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
              :class="
                selectedCategoryId === Number(child.id)
                  ? 'bg-green-50 font-medium text-green-800'
                  : 'text-gray-600'
              "
              @click="selectCategory(Number(child.id))"
            >
              <span class="capitalize">{{ child.name }}</span>
              <Check v-if="selectedCategoryId === Number(child.id)" class="h-4 w-4" />
            </button>
          </li>
        </ul>
      </li>
    </ul>
  </ElementsInsetSheet>

  <!-- MARK : SORT SHEET -->
  <ElementsInsetSheet v-model:open="sortOpen" :title="$t('app.productPage.sort')">
    <ul class="space-y-1">
      <li v-for="option in sortOptions" :key="option.value">
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium hover:bg-gray-50"
          :class="activeSort === option.value ? 'bg-green-50 text-green-800' : 'text-gray-800'"
          @click="selectSort(option.value)"
        >
          {{ sortLabel(option.labelKey) }}
          <Check v-if="activeSort === option.value" class="h-4 w-4" />
        </button>
      </li>
    </ul>
  </ElementsInsetSheet>

  <!-- MARK : SEARCH OVERLAY -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      leave-active-class="transition duration-200 ease-in"
      enter-from-class="opacity-0 -translate-y-full"
      leave-to-class="opacity-0 -translate-y-full"
    >
      <div
        v-if="searchOpen"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('app.productPage.search')"
        class="fixed inset-0 z-[80] flex flex-col bg-white"
      >
        <form
          class="app-container flex w-full items-center gap-2 border-b py-4"
          @submit.prevent="submitSearch"
        >
          <div class="relative flex-1">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              ref="searchInputEl"
              v-model="searchInput"
              type="text"
              inputmode="search"
              enterkeyhint="search"
              autocomplete="off"
              :placeholder="$t('app.productPage.searchPlaceholder')"
              class="h-12 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-10 text-base outline-none focus:border-green-600 focus:bg-white"
            />
            <button
              v-if="searchInput"
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 hover:bg-gray-200"
              :aria-label="$t('app.common.clear')"
              @click="clearSearch"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            @click="closeSearch"
          >
            {{ $t('app.common.close') }}
          </button>
        </form>

        <div class="flex-1 overflow-y-auto overscroll-contain">
          <div class="app-container py-4">
            <p v-if="!searchInput.trim()" class="py-10 text-center text-sm text-gray-500">
              {{ $t('app.productPage.searchHint') }}
            </p>
            <template v-else>
              <p class="mb-3 text-sm text-gray-500">
                <template v-if="loading">{{ $t('app.productPage.searching') }}</template>
                <template v-else>{{ $t('app.productPage.searchResults', { count: totalItems, keyword: params.keyword }, totalItems) }}</template>
              </p>
              <ul
                v-if="searchPreview.length"
                class="grid gap-2 sm:grid-cols-2"
                :class="{ 'opacity-60': loading }"
              >
                <li v-for="product in searchPreview" :key="product.id">
                  <NuxtLink
                    :to="`/product/${product.slug}`"
                    class="flex items-center gap-3 rounded-xl p-2 hover:bg-gray-50"
                    @click="closeSearch"
                  >
                    <div class="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        v-if="product.image && !brokenImages[product.id]"
                        :src="STORAGE_URL + product.image"
                        :alt="product.name"
                        class="h-full w-full object-cover"
                        @error="brokenImages[product.id] = true"
                      />
                    </div>
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-gray-900">{{ product.name }}</p>
                      <p class="truncate text-xs text-gray-500">{{ product.category?.name }}</p>
                    </div>
                  </NuxtLink>
                </li>
              </ul>
              <p v-else-if="!loading" class="py-10 text-center text-sm text-gray-500">
                {{ $t('app.productPage.noMatch') }}
              </p>
              <Button
                v-if="totalItems > searchPreview.length && !loading"
                class="mt-4 w-full sm:w-auto"
                @click="submitSearch"
              >
                {{ $t('app.productPage.seeAll', { count: totalItems }) }}
              </Button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <ElementsProductQuickView
    v-model="quickViewOpen"
    :product="selectedProduct"
    :base-url="config.public.BASE_URL"
    :storage-url="STORAGE_URL"
  />
  </div>
</template>
