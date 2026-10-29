<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useFeaturedProduct } from "~/composables/useFeaturedProduct";
import { useIntersectionObserver } from '~/composables/useIntersectionObserver';
import { toast } from "vue-sonner";
import type { FeaturedProductItem } from "~/composables/useFeaturedProduct";

const router = useRouter();
const { data, loading, error, refetch } = useFeaturedProduct();
const isInitialLoad = ref(true);
const shouldLoad = ref(false);
const config = useRuntimeConfig();
const STORAGE_URL = config.public.STORAGE_URL;

const { t } = useI18n();
const { target } = useIntersectionObserver(() => {
  shouldLoad.value = true
  loadProducts()
})

const loadProducts = async () => {
  if (!shouldLoad.value) return
  await refetch()
  isInitialLoad.value = false
}

const tabs = computed(() => [
  {
    id: 1,
    key: "populer",
    label: t("app.products.tabs.popular"),
    count: data.value.filter((p) => p.is_highlight).length,
  },
  {
    id: 2,
    key: "rekomendasi",
    label: t("app.products.tabs.recommended"),
    count: data.value.filter((p) => p.is_recommended).length,
  },
]);

// cards per view at each breakpoint, matching the CarouselItem basis classes; the arrows only
// show where there are more products than fit
const ARROW_CLASSES: [number, string, string][] = [
  [2, 'inline-flex', 'hidden'],
  [3, 'sm:inline-flex', 'sm:hidden'],
  [4, 'md:inline-flex', 'md:hidden'],
  [5, 'lg:inline-flex', 'lg:hidden'],
  [6, 'xl:inline-flex', 'xl:hidden'],
];
const arrowClass = (count: number) => ARROW_CLASSES.map(([perView, show, hide]) => (count > perView ? show : hide)).join(' ');

const filteredProducts = (type: string) => {
  if (type === "populer") return data.value.filter((p) => p.is_highlight);
  if (type === "rekomendasi")
    return data.value.filter((p) => p.is_recommended);
  return [];
};

// Watch for data changes to complete initial load
watch(data, (newData) => {
  if (newData && newData.length > 0 && shouldLoad.value) {
    isInitialLoad.value = false;
  }
});

function goTo(slug: string) {
  if (!slug) return;
  router.push(`/product/${slug}`);
}

// products with several variants need a choice on the product page first
const { add: addToCart } = useCart();
const addingId = ref<string | null>(null);
async function quickAdd(product: FeaturedProductItem) {
  const variant = product.cartVariant;
  if (!variant) {
    goTo(product.slug);
    return;
  }
  addingId.value = product.id;
  try {
    await addToCart(variant.id, variant.moq);
    toast.success(t("app.cartPage.added", { name: product.name }));
  } catch (e: any) {
    toast.error(cartErrorMessage(e, t("app.cartPage.failed")));
  } finally {
    addingId.value = null;
  }
}
</script>

<template>
  <div ref="target" class="w-full px-4 py-12 md:py-16 bg-[#F2F4F7]">
    <div class="container max-w-6xl mx-auto py-4 md:py-8">
      <div v-if="error" class="text-center text-red-500">{{ error }}</div>
      <div v-else>
        <Tabs default-value="populer" class="w-full">
          <!-- heading stacks above the tabs on small screens -->
          <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div class="max-w-xl">
              <h2 class="text-2xl md:text-3xl font-bold text-black">{{ $t('app.products.title') }}</h2>
              <p class="mt-1 text-gray-600">
                {{ $t('app.products.description') }}
              </p>
            </div>
            <TabsList class="h-auto w-fit shrink-0 bg-slate-100 p-1.5">
              <TabsTrigger
                v-for="(trigger, index) in tabs"
                :key="index"
                :value="trigger.key"
                class="px-3 py-1.5"
              >
                {{ trigger.label.toLocaleUpperCase() }}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent
            v-for="(val, index) in tabs"
            :key="val.id"
            :value="val.key"
          >
            <Carousel
              class="relative w-full"
              :opts="{ align: 'start', loop: true }"
            >
              <CarouselContent>
                <!-- Skeleton Loading State -->
                <CarouselItem
                  v-if="loading || isInitialLoad"
                  v-for="n in 5"
                  :key="`skeleton-${n}`"
                  class="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                >
                  <div class="p-1">
                    <Card class="py-0">
                      <CardHeader class="relative p-0 aspect-square overflow-hidden">
                        <Skeleton class="w-full aspect-square rounded-t-lg" />
                      </CardHeader>
                      <CardContent class="p-3 space-y-2">
                        <Skeleton class="h-4 w-3/4" />
                        <Skeleton class="h-3 w-1/2" />
                        <div class="flex justify-between items-center mt-3">
                          <Skeleton class="h-4 w-16" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
                
                <!-- Actual Product Cards -->
                <CarouselItem
                  v-else
                  v-for="product in filteredProducts(val.key)"
                  :key="product.id"
                  class="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                >
                  <div class="p-1">
                    <Card
                      class="group cursor-pointer py-0"
                      @click="goTo(product.slug)"
                    >
                      <CardHeader
                        class="relative p-0 aspect-square overflow-hidden opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <img
                          :src="STORAGE_URL + product.image"
                          :alt="product.name"
                          class="w-full aspect-square object-cover rounded-t-lg"
                          loading="lazy"
                        />
                        <!-- center absolute -->
                        <div
                          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            class="rounded-full bg-white shadow"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <path
                                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                              ></path>
                            </svg>
                          </Button>
                          <Button
                            variant="outline"
                            class="opacity-0 group-hover:opacity-100 transition-opacity"
                            size="sm"
                            :disabled="addingId === product.id"
                            @click.stop="quickAdd(product)"
                          >
                            {{ $t('app.products.addToCart') }}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent class="p-3">
                        <h3 class="line-clamp-2 text-sm font-medium">{{ product.name }}</h3>
                        <p class="mt-0.5 truncate text-xs text-gray-500">
                          {{ product.category }}
                        </p>
                        <div class="flex justify-between items-center mt-2">
                          <span class="text-sm font-bold"
                            >Rp. {{ product.price }}
                            <span class="text-xs text-gray-500"
                              >{{ $t('app.products.perPcs') }}</span
                            ></span
                          >
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <!-- keep arrows inside the carousel; the default -left/-right-12 overflows the page -->
              <CarouselPrevious class="left-2 bg-white/90 shadow-md" :class="arrowClass(filteredProducts(val.key).length)" />
              <CarouselNext class="right-2 bg-white/90 shadow-md" :class="arrowClass(filteredProducts(val.key).length)" />
            </Carousel>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>
