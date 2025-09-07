<script setup lang="ts">
// UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useRouter } from "vue-router";
import { ref, computed, onMounted } from "vue";

// Data/composables
import { useProductService } from "~/services/product.service";
import { useGql } from "~/composables/useGql";
import { ChevronDown, ChevronUp, MenuIcon } from "lucide-vue-next";
import ElementsProductQuickView from "~/components/elements/ElementsProductQuickView.vue";

const router = useRouter();
const config = useRuntimeConfig();
const STORAGE_URL = config.public.STORAGE_URL;

// Products: server-side pagination + optional category_id filter
const productService = useProductService(true);
const {
  datas: products,
  pageInfo,
  pagination,
  params,
  setParams,
  changePage,
} = productService;

// Categories: fetch all (parents + children) for sidebar
const { gqlFetch } = useGql();
const categoriesAll = ref<any[]>([]);
const categoriesLoading = ref(false);
const categoriesError = ref<string | null>(null);
const isMobileOpen = ref(false);

// if resolution < 768px
const isMobile = computed(
  () => typeof window !== "undefined" && window.innerWidth < 768
);

const fetchAllCategories = async () => {
  categoriesLoading.value = true;
  categoriesError.value = null;
  try {
    const query = `
      query getProductCategories($only_parent: Boolean) {
        getProductCategories(only_parent: $only_parent) {
          id
          name
          slug
          description
          image
          is_landing_page
          is_active
          created_at
          updated_at
          parent_id
        }
      }
    `;
    const res = await gqlFetch<{ getProductCategories: any[] }>(
      query,
      { only_parent: false },
      { auth: true }
    );
    categoriesAll.value = res?.getProductCategories || [];
  } catch (e: any) {
    categoriesError.value = e?.message || "Failed to load categories";
  } finally {
    categoriesLoading.value = false;
  }
};

onMounted(() => {
  fetchAllCategories();
});

const parentCategories = computed(() =>
  (categoriesAll.value || []).filter((c: any) => c?.parent_id == null)
);
const childrenMap = computed<Record<number, any[]>>(() => {
  const map: Record<number, any[]> = {};
  for (const c of categoriesAll.value || []) {
    if (c?.parent_id != null) {
      const pid = Number(c.parent_id);
      if (!map[pid]) map[pid] = [];
      map[pid].push(c);
    }
  }
  return map;
});

// Sidebar UI state: which parents are expanded, and which child is selected
const openParents = ref<Record<number, boolean>>({});
const selectedCategoryId = ref<number | null>(null);

const toggleParent = (parentId: number) => {
  const pid = Number(parentId);
  openParents.value[pid] = !openParents.value[pid];
};
const selectChild = (childId: number) => {
  selectedCategoryId.value = Number(childId);
  setParams({ category_id: Number(childId) });
  changePage(0);
};
const clearCategory = () => {
  selectedCategoryId.value = null;
  setParams({ category_id: null });
  changePage(0);
};

// Helper: min price from additionals
const productMinPrice = (p: any) => {
  const adds = Array.isArray(p?.additionals) ? p.additionals : [];
  const prices = adds.map((a: any) => Number(a?.price) || 0);
  if (!prices.length) return 0;
  return Math.min(...prices);
};

const viewProductDetail = (slug: string) => {
  router.push(`/product/${slug}`);
};

// Quick View modal state
const quickViewOpen = ref(false);
const selectedProduct = ref<any | null>(null);
const openQuickView = (product: any) => {
  selectedProduct.value = product;
  quickViewOpen.value = true;
};

// MARK : SORT OPTIONS
const sortOptions = [
  { value: "is_highlight,desc", label: "Popular" },
  { value: "created_at,desc", label: "Newest" },
  { value: "price,asc", label: "Price: Low to High" },
  { value: "price,desc", label: "Price: High to Low" },
];

// Pagination helpers (UI uses 1-based labels)
const totalPages = computed(() => Number(pageInfo.value?.total_pages || 1));
const currentPageLabel = computed(() =>
  Number(pageInfo.value?.current_page || pagination.value.page + 1)
);
const prevPage = () => {
  if (pageInfo.value?.has_previous_page)
    changePage(Math.max(0, pagination.value.page - 1));
};
const nextPage = () => {
  if (pageInfo.value?.has_next_page) changePage(pagination.value.page + 1);
};
const goToPage = (p1: number) => changePage(Math.max(0, p1 - 1));

const pageTitle = computed(() => `Brandingku Products`);

useHead({ title: pageTitle });

definePageMeta({ layout: "page-layout" });
</script>

<template>
  <!-- Header -->
  <HeaderProduct :title="pageTitle" />

  <div class="app-container flex flex-col md:flex-row gap-1">
    <!-- MARK : SIDEBAR -->
    <button
      v-if="isMobile"
      @click="isMobileOpen = !isMobileOpen"
      class="fixed right-5 top-24 z-20 bg-green-200 rounded-xl p-2 hover:bg-green-400 flex gap-2"
    >
      Category <MenuIcon class="w-6 h-6" />
    </button>
    <div
      v-if="isMobileOpen"
      class="min-w-48 bg-slate-200 h-fit rounded-md py-4 px-2 mt-18 sticky top-36 md:top-30 z-20"
    >
      <ul class="space-y-2">
        <li>
          <button
            class="block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            :class="{ 'bg-gray-100': selectedCategoryId === null }"
            @click="clearCategory()"
          >
            All
          </button>
        </li>
        <li
          v-for="parent in parentCategories"
          :key="parent.id"
          class="relative"
        >
          <button
            class="flex items-center gap-2 w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            @click="toggleParent(Number(parent.id))"
          >
            <ChevronUp v-if="openParents[parent.id]" />
            <ChevronDown v-else />
            {{ parent.name }}
          </button>
          <ul
            v-if="
              (childrenMap[parent.id] || []).length && openParents[parent.id]
            "
            class="mt-1 ml-4 space-y-1"
          >
            <li v-for="child in childrenMap[parent.id]" :key="child.id">
              <button
                class="block w-full px-3 py-1.5 text-left text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded"
                :class="{
                  'bg-gray-100': selectedCategoryId === Number(child.id),
                }"
                @click="selectChild(Number(child.id))"
              >
                {{ child.name }}
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div class="w-full pb-12">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 md:mb-8 gap-2 md:gap-4 w-full" >
        <h1 class="text-3xl font-bold mb-4 whitespace-nowrap">Daftar Produk</h1>
        <div class="flex flex-col-reverse md:flex-row justify-end items-end gap-1 md:gap-4 w-full" >
          <Input
            class="w-[260px]"
            placeholder="Cari produk..."
            v-model="params.keyword"
          />
          <div class="flex gap-2 items-center">
            <span class="text-sm text-gray-500">Sort by:</span>
            <Select>
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="Popular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in sortOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div
        class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 lg:gap-6"
      >
        <div v-for="product in products" :key="product.id">
          <Card
            @click="viewProductDetail(product.slug)"
            class="group overflow-hidden cursor-pointer p-0 gap-2 md:gap-4 lg:gap-6"
          >
            <div class="relative aspect-square overflow-hidden">
              <img
                :src="STORAGE_URL + product.image"
                :alt="product.name"
                class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              />
              <div
                class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Button
                  variant="outline"
                  class="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"
                  @click.stop="openQuickView(product)"
                >
                  Quick View
                </Button>
              </div>
            </div>
            <CardContent class="p-4">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium">{{ product.name }}</h3>
                  <p class="text-sm text-gray-500">
                    {{ product.category?.name }}
                  </p>
                </div>
              </div>
              <div class="mt-4 flex flex-col md:flex-row items-between lg:items-end justify-between">
                <div class="flex flex-col">
                  <span class="text-sm text-gray-500 italic">From</span>
                  <span class="font-bold">
                    Rp. {{ productMinPrice(product) }}
                    <span class="text-sm text-gray-500">/pcs</span>
                  </span>
                </div>
                <Button variant="outline" size="sm">Add to Cart</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div class="mt-12 flex justify-center">
        <div class="flex gap-2 items-center">
          <Button
            variant="outline"
            :disabled="!pageInfo?.has_previous_page"
            @click="prevPage"
            >Prev</Button
          >
          <Button
            v-for="p in totalPages"
            :key="p"
            :variant="p === currentPageLabel ? 'default' : 'outline'"
            @click="goToPage(p)"
          >
            {{ p }}
          </Button>
          <Button
            variant="outline"
            :disabled="!pageInfo?.has_next_page"
            @click="nextPage"
            >Next</Button
          >
        </div>
      </div>
    </div>
  </div>

  <!-- Quick View Modal -->
  <ElementsProductQuickView
    v-model="quickViewOpen"
    :product="selectedProduct"
    :base-url="config.public.BASE_URL"
    :storage-url="STORAGE_URL"
  />

  <!-- footer -->
  <ElementsFooter />
</template>
