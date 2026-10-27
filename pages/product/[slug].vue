<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProductDetail } from "~/composables/useProductDetail";
import HeaderProduct from "~/components/HeaderProduct.vue";
import { ArrowLeftIcon, MessageCircle, Minus, Plus } from "lucide-vue-next";
import { toast } from "vue-sonner";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const slug = computed(() => String(route.params.slug || ""));
const {
  data: detail,
  loading,
  error,
  refetch,
  setSlug,
} = useProductDetail(slug.value);
const config = useRuntimeConfig();
const STORAGE_URL = config.public.STORAGE_URL;

const { token, createWishlist } = useWishlist();

const handleAddToWishlist = async () => {
  if (!token.value) {
    router.push("/console/auth");
    return;
  }

  const productId = (detail.value as any)?.id;
  if (!productId) return;
  await createWishlist(Number(productId));
};

const selectedColor = ref<string>("");
// variant is taken from additional name
const selectedVariantName = ref<string>("");

const namedVariants = computed(() => (detail.value?.additionals || []).filter((a) => a.name?.trim()));

// compute selected additional by name
const selectedAdditional = computed(() => {
  const adds = detail.value?.additionals || [];
  return adds.find((a) => a.name === selectedVariantName.value);
});

// helpers
const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const displayedPrice = computed(() => {
  const a = selectedAdditional.value;
  if (!a) return detail.value ? detail.value.price : 0;
  const base = Number(a.price) || 0;
  const disc = Number(a.discount) || 0;
  let final = base;
  if (disc > 0) {
    final =
      String(a.discount_type).toUpperCase() === "PERCENTAGE"
        ? base - (base * disc) / 100
        : base - disc;
  }
  return Math.max(0, Math.floor(final));
});

// no price set: the customer has to ask the admin
const isAskAdmin = computed(() => displayedPrice.value <= 0);

// quantity starts at, and never goes below, the variant's MOQ
const minQty = computed(() => Math.max(1, Number(selectedAdditional.value?.moq) || 1));
const quantity = ref(1);
watch(minQty, (moq) => { quantity.value = moq; }, { immediate: true });
const setQuantity = (value: number | string) => {
  const n = Math.floor(Number(value));
  quantity.value = Number.isFinite(n) ? Math.min(Math.max(n, minQty.value), 100000) : minQty.value;
};

const { add: addToCart } = useCart();
const adding = ref(false);
const handleAddToCart = async () => {
  const variant = selectedAdditional.value;
  if (!variant) {
    toast.error(t("app.cartPage.selectVariant"));
    return;
  }
  adding.value = true;
  try {
    await addToCart(Number(variant.id), quantity.value);
    toast.success(t("app.cartPage.added"), {
      description: `${detail.value?.name || ""} · ${variant.name} × ${quantity.value}`,
      action: { label: t("app.cartPage.viewCart"), onClick: () => router.push("/cart") },
    });
  } catch (e: any) {
    toast.error(cartErrorMessage(e, t("app.cartPage.failed")));
  } finally {
    adding.value = false;
  }
};
const { openChat } = useChatWidget();
const askAdmin = () => {
  const name = detail.value?.name || "";
  const variant = selectedVariantName.value ? ` (${selectedVariantName.value})` : "";
  openChat(t("app.productPage.detail.askPriceMessage", { name, variant }));
};

const displayedOriginal = computed(() => {
  const a = selectedAdditional.value;
  if (!a) return detail.value?.originalPrice || null;
  const base = Number(a.price) || 0;
  const disc = Number(a.discount) || 0;
  if (disc <= 0) return null;
  const final =
    String(a.discount_type).toUpperCase() === "PERCENTAGE"
      ? base - (base * disc) / 100
      : base - disc;
  return final < base ? Math.floor(base) : null;
});

const displayedStock = computed(() =>
  selectedAdditional.value
    ? Number(selectedAdditional.value.stock) || 0
    : detail.value?.inStock
    ? 1
    : 0
);
const displayedMoq = computed(() =>
  selectedAdditional.value ? Number(selectedAdditional.value.moq) || 0 : null
);
const displayedDiscountInfo = computed(() => {
  const a = selectedAdditional.value;
  if (!a) return null;
  const disc = Number(a.discount) || 0;
  if (disc <= 0) return null;
  const type = String(a.discount_type).toUpperCase();
  return type === "PERCENTAGE" ? `${disc}%` : formatIDR(disc);
});

// derive attributes/colors for the selected variant
const variantAttributes = computed<{ key: string; value: string }[] | null>(
  () => {
    const a = selectedAdditional.value;
    if (!a || !a.attributes) return null;
    try {
      const parsed = JSON.parse(a.attributes);
      if (!Array.isArray(parsed)) return null;
      return parsed
        .filter(
          (it: any) =>
            it && typeof it.key === "string" && typeof it.value === "string"
        )
        .map((it: any) => ({ key: it.key, value: it.value }));
    } catch {
      return null;
    }
  }
);

const variantColors = computed<string[] | null>(() => {
  const attrs = variantAttributes.value;
  if (!attrs) return null;
  const colorValues = attrs
    .filter((kv) => /color/i.test(kv.key))
    .flatMap((kv) =>
      kv.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
  const unique = Array.from(new Set(colorValues));
  return unique.length ? unique : null;
});

const handleBack = () => {
  if (process.client) {
    const lastHistory = localStorage.getItem('lastHistory') || '/';
    navigateTo(lastHistory);
  } else {
    navigateTo('/');
  }
}

watch(
  detail,
  (v) => {
    if (!v) return;
    if (!selectedColor.value && (v.colors?.length || 0) > 0)
      selectedColor.value = v.colors?.[0] || "";
    // default variant: first additional name
    if (!selectedVariantName.value && (v.additionals?.length || 0) > 0) {
      selectedVariantName.value = v.additionals?.[0]?.name || "";
    }
  },
  { immediate: true }
);

// when variant changes, adjust selectedColor to first variant color if available
watch(selectedVariantName, () => {
  if (variantColors.value && variantColors.value.length) {
    selectedColor.value = variantColors.value[0] || "";
  }
});

useHead(() => ({
  // lifts the chat widget above the mobile action bar
  htmlAttrs: { class: "has-bottom-bar" },
  title: detail.value?.name
    ? t("app.productPage.detail.metaTitle", { name: detail.value.name })
    : t("app.productPage.detail.metaFallback"),
}));

// Handle same-route param changes
watch(slug, (val) => {
  setSlug(val);
  refetch();
});

definePageMeta({
  layout: "page-layout",
});
</script>

<template>
  <HeaderProduct :title="detail?.name || ''" />

  <!-- back fixed button -->
  <button
    class="group fixed right-5 lg:right-20 top-24 z-50 p-4 bg-green-200 hover:bg-green-400 rounded-full flex gap-2"
    @click="handleBack"
  >
    <span class="group-hover:block hidden">{{ $t('app.productPage.detail.back') }}</span>
    <ArrowLeftIcon class="w-6 h-6" />
  </button>

  <div class="bg-white app-container px-4 pt-8 pb-28 md:pt-10 lg:pb-12">
    <div v-if="loading" class="flex justify-center">{{ $t('app.productPage.detail.loading') }}</div>
    <div v-else-if="error" class="flex flex-col items-center gap-4 py-10 text-center">
      <p class="text-lg font-semibold text-gray-900">
        {{ error === "Product not found" ? $t('app.productPage.detail.notFound') : $t('app.productPage.detail.loadFailed') }}
      </p>
      <NuxtLink
        to="/product"
        class="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
      >
        {{ $t('app.productPage.detail.browseAll') }}
      </NuxtLink>
    </div>

    <div v-else-if="detail" class="space-y-8">
      
    <!-- Breadcrumb -->
    <div class="app-container mx-auto text-sm text-gray-500">
      <NuxtLink to="/" class="hover:text-primary">{{ $t('app.productPage.detail.home') }}</NuxtLink>
      <span class="mx-1">/</span>
      <span class="hover:text-primary">{{
        detail.category || $t('app.productPage.detail.product')
      }}</span>
      <span class="mx-1">/</span>
      <span class="text-primary">{{ detail.name }}</span>
    </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Gallery -->
        <div class="-mx-4 sm:mx-0">
          <AtomsProductThumbnail
            :images="detail.images.map((img: string) => `${STORAGE_URL}${img}`)"
            class="lg:sticky lg:top-24"
          />
        </div>

        <!-- Info -->
        <div class="pr-0 md:pr-12">
          <h1 class="text-2xl md:text-3xl font-bold tracking-tight">
            {{ detail.name }}
          </h1>
          <p v-if="detail.category" class="text-gray-500 mt-1">
            {{ detail.category }}
          </p>

          <!-- Price -->
          <div class="mt-6 flex items-center gap-3">
            <span v-if="isAskAdmin" class="text-2xl font-bold text-green-600 md:text-3xl">
              {{ $t('app.productPage.detail.priceAskAdmin') }}
            </span>
            <span v-else class="text-3xl font-bold">
              {{ formatIDR(displayedPrice) }}
            </span>
            <span
              v-if="displayedOriginal"
              class="text-lg text-gray-500 line-through"
            >
              {{ formatIDR(displayedOriginal as number) }}
            </span>
          </div>

          <!-- Color (depends on selected variant) -->
          <div
            v-if="
              (variantColors && variantColors.length) || detail.colors?.length
            "
            class="mt-8"
          >
            <h3 class="text-sm font-medium mb-2">{{ $t('app.productPage.detail.color') }}</h3>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="color in variantColors && variantColors.length
                  ? variantColors
                  : detail.colors"
                :key="color"
                @click="selectedColor = color"
                class="px-3 py-1.5 border rounded-full text-sm transition-all"
                :class="{
                  'border-primary bg-primary/10 text-primary':
                    color === selectedColor,
                  'border-gray-200 hover:border-gray-300':
                    color !== selectedColor,
                }"
              >
                {{ color }}
              </button>
            </div>
          </div>

          <!-- Variant (from additional name) -->
          <div v-if="detail.additionals?.length" class="mt-6">
            <!-- an unnamed variant cannot be a select option (empty values throw and break navigation) -->
            <template v-if="namedVariants.length">
              <h3 class="text-sm font-medium mb-2">{{ $t('app.productPage.detail.variant') }}</h3>
              <Select v-model="selectedVariantName">
                <SelectTrigger class="w-[220px]">
                  <SelectValue :placeholder="$t('app.productPage.detail.selectVariant')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="a in namedVariants"
                    :key="a.id"
                    :value="a.name"
                  >
                    {{ a.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </template>
            <div v-if="selectedAdditional" class="mt-4">
              <h3 class="text-sm font-medium mb-2">{{ $t('app.cartPage.quantity') }}</h3>
              <div class="inline-flex items-center rounded-md border">
                <button
                  type="button"
                  class="inline-flex size-9 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  :aria-label="$t('app.cartPage.decrease')"
                  :disabled="quantity <= minQty"
                  @click="setQuantity(quantity - 1)"
                >
                  <Minus class="size-4" />
                </button>
                <input
                  :value="quantity"
                  type="number"
                  inputmode="numeric"
                  :min="minQty"
                  :aria-label="$t('app.cartPage.quantity')"
                  class="h-9 w-20 border-x text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  @change="setQuantity(($event.target as HTMLInputElement).value)"
                />
                <button
                  type="button"
                  class="inline-flex size-9 items-center justify-center text-gray-600 hover:bg-gray-50"
                  :aria-label="$t('app.cartPage.increase')"
                  @click="setQuantity(quantity + 1)"
                >
                  <Plus class="size-4" />
                </button>
              </div>
              <p v-if="minQty > 1" class="mt-1 text-xs text-gray-500">{{ $t('app.cartPage.minQty', { moq: minQty }) }}</p>
            </div>
            <div class="mt-3 text-sm text-gray-700 space-y-1">
              <div>
                <span class="text-gray-500">{{ $t('app.productPage.detail.stock') }}</span>
                <span class="font-medium">{{ displayedStock }}</span>
              </div>
              <div v-if="displayedMoq != null">
                <span class="text-gray-500">{{ $t('app.productPage.detail.moq') }}</span>
                <span class="font-medium">{{ displayedMoq }}</span>
              </div>
              <div v-if="displayedDiscountInfo">
                <span class="text-gray-500">{{ $t('app.productPage.detail.discount') }}</span>
                <span class="font-medium">{{ displayedDiscountInfo }}</span>
              </div>
            </div>
          </div>

          <!-- Add to Cart -->
          <!-- fixed action bar on mobile, inline from lg -->
          <div
            class="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur lg:static lg:z-auto lg:mt-8 lg:gap-6 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none"
          >
            <Button v-if="isAskAdmin" class="h-11 flex-1 gap-2 bg-green-600 text-white hover:bg-green-700 lg:h-9" @click="askAdmin">
              <MessageCircle class="h-4 w-4" />
              {{ $t('app.productPage.detail.askAdmin') }}
            </Button>
            <Button v-else class="h-11 flex-1 lg:h-9" :disabled="adding" @click="handleAddToCart">{{ $t('app.productPage.detail.addToCart') }}</Button>
            <Button variant="outline" :aria-label="$t('app.productPage.wishlistAdd')" class="h-11 w-11 border-green-200 text-green-700 hover:bg-green-50 lg:h-9 lg:w-auto" @click="handleAddToWishlist">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </Button>
          </div>

          <!-- Stock Status -->
          <div v-if="!isAskAdmin" class="mt-6 text-sm text-gray-600">
            <div class="flex items-center gap-2">
              <span v-if="displayedStock > 0">{{ $t('app.productPage.detail.inStock') }}</span>
              <span v-else>{{ $t('app.productPage.detail.outOfStock') }}</span>
            </div>
          </div>

          <!-- Description -->
          <div v-if="detail.description" class="mt-8">
            <h3 class="font-medium mb-3">{{ $t('app.productPage.detail.description') }}</h3>
            <div
              v-html="detail.description"
              class="prose prose-stone prose-a:text-primary prose-a:no-underline prose-a:hover:underline"
            ></div>
          </div>

          <!-- Details (Specifications depend on selected variant) -->
          <div
            v-if="
              (variantAttributes && variantAttributes.length) ||
              detail.details?.length
            "
            class="mt-8 pt-6 border-t"
          >
            <h3 class="font-medium mb-3">{{ $t('app.productPage.detail.specifications') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <div
                v-for="(kv, idx) in variantAttributes &&
                variantAttributes.length
                  ? variantAttributes
                  : detail.details"
                :key="idx"
                class="flex justify-between border-b py-2"
              >
                <span class="text-gray-500">{{ kv.key }}</span>
                <span class="font-medium">{{ kv.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- client projects that used this product -->
      <ElementsPortfolioCarousel :product-id="Number((detail as any).id) || null" />
    </div>
  </div>
</template>
