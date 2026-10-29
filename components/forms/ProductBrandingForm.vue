<script setup lang="ts">
import { useBrandingService } from "~/services/branding.service";
import type { BrandingDefault, BrandingMethod, BrandingTier, ProductBrandingInput } from "~/types/branding.type";
import BrandingTierEditor from "./BrandingTierEditor.vue";

// which branding methods a product offers; each uses its category's price unless the product
// sets its own. The product form reads payload() and saves it after the product.
const props = defineProps<{ productId?: number | null; categoryId?: number | null; disabled?: boolean }>();

type Draft = { enabled: boolean; custom: boolean; tiers: BrandingTier[] };

const service = useBrandingService();
const methods = ref<BrandingMethod[]>([]);
const drafts = ref<Record<number, Draft>>({});
const defaults = ref<Record<number, BrandingDefault>>({});
const loaded = ref(false);
const loadError = ref("");

onMounted(async () => {
  try {
    const [all, offered] = await Promise.all([
      service.getBrandingMethods(),
      props.productId ? service.getProductBrandings(props.productId) : Promise.resolve([]),
    ]);
    const byMethod: Record<number, Draft> = {};
    for (const m of all) byMethod[m.id] = { enabled: false, custom: false, tiers: [] };
    for (const b of offered) {
      byMethod[b.branding_method_id] = { enabled: true, custom: b.custom_price, tiers: b.custom_price ? sortedTiers(b.tiers) : [] };
    }
    // offered methods first, in their saved order, then the rest
    const rank = new Map(offered.map((b, i) => [b.branding_method_id, i]));
    methods.value = [...all].sort((a, b) => (rank.get(a.id) ?? 1e6 + a.orders) - (rank.get(b.id) ?? 1e6 + b.orders));
    drafts.value = byMethod;
    loaded.value = true;
  } catch (e) {
    loadError.value = getErrorMessage(e);
  }
});

// the category price follows the category picked in the form
watch(
  () => props.categoryId,
  async (id) => {
    defaults.value = {};
    if (!id) return;
    try {
      const list = await service.getBrandingDefaults(id);
      if (props.categoryId === id) defaults.value = Object.fromEntries(list.map((d) => [d.branding_method_id, d]));
    } catch {
      // the hint is optional; saving does not depend on it
    }
  },
  { immediate: true },
);

const toggleCustom = (id: number, custom: boolean) => {
  const d = drafts.value[id];
  if (!d) return;
  d.custom = custom;
  // start from the category price so the admin only adjusts it
  if (custom && !d.tiers.length) d.tiers = (defaults.value[id]?.tiers || []).map((t) => ({ ...t }));
};

const problem = () => {
  for (const m of methods.value) {
    const d = drafts.value[m.id];
    if (!d?.enabled || !d.custom) continue;
    if (!d.tiers.length) return `${m.name}: isi harga khusus atau matikan "Harga khusus"`;
    const p = brandingTierProblem(d.tiers);
    if (p) return `${m.name}: ${p}`;
  }
  return null;
};

// undefined when the list never loaded, so a failed load does not wipe the saved offers
const payload = (): ProductBrandingInput[] | undefined => {
  if (!loaded.value) return undefined;
  return methods.value
    .filter((m) => drafts.value[m.id]?.enabled)
    .map((m) => {
      const d = drafts.value[m.id]!;
      return { branding_method_id: m.id, custom_tiers: d.custom ? sortedTiers(d.tiers) : [] };
    });
};

defineExpose({ payload, problem });
</script>

<template>
  <div class="space-y-3">
    <p v-if="loadError" class="text-sm text-red-600">Layanan branding gagal dimuat: {{ loadError }}</p>
    <p v-else-if="!loaded" class="text-sm text-muted-foreground">Memuat metode branding…</p>
    <p v-else-if="!methods.length" class="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      Belum ada metode branding. Tambahkan dulu di menu Toko → Branding.
    </p>
    <div v-else class="grid gap-3 lg:grid-cols-2">
      <div
        v-for="m in methods"
        :key="m.id"
        class="space-y-3 rounded-lg border p-3"
        :class="drafts[m.id]?.enabled ? 'border-green-600/60 bg-green-50/40' : 'bg-card'"
      >
        <label class="flex items-start gap-3">
          <input
            v-model="drafts[m.id].enabled"
            type="checkbox"
            class="mt-1 size-4 accent-green-600"
            :disabled="props.disabled"
          />
          <span class="min-w-0 flex-1">
            <span class="flex flex-wrap items-center gap-2">
              <span class="font-medium">{{ m.name }}</span>
              <UiBadge v-if="!m.is_active" class="bg-gray-100 text-gray-700">Nonaktif</UiBadge>
            </span>
            <span v-if="m.description" class="block text-xs text-muted-foreground">{{ m.description }}</span>
          </span>
        </label>

        <template v-if="drafts[m.id]?.enabled">
          <p v-if="!drafts[m.id]?.custom" class="text-xs" :class="defaults[m.id]?.tiers.length ? 'text-muted-foreground' : 'text-amber-700'">
            <template v-if="defaults[m.id]?.tiers.length">
              Harga kategori {{ defaults[m.id]?.category_name }}: {{ describeBrandingTiers(defaults[m.id]?.tiers || []) }}
            </template>
            <template v-else>
              Kategori belum punya harga untuk {{ m.name }}. Isi harga khusus, atau metode ini tidak tampil di website.
            </template>
          </p>
          <label class="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              class="size-4 accent-green-600"
              :checked="drafts[m.id]?.custom"
              :disabled="props.disabled"
              @change="toggleCustom(m.id, ($event.target as HTMLInputElement).checked)"
            />
            Harga khusus produk ini
          </label>
          <BrandingTierEditor v-if="drafts[m.id]?.custom" v-model="drafts[m.id].tiers" :label="m.name" :disabled="props.disabled" />
        </template>
      </div>
    </div>
  </div>
</template>
