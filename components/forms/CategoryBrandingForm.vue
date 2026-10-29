<script setup lang="ts">
import { useBrandingService } from "~/services/branding.service";
import type { BrandingDefault, BrandingMethod, BrandingTier } from "~/types/branding.type";
import BrandingTierEditor from "./BrandingTierEditor.vue";

// default branding prices of a category; products of the category and of its subcategories
// use them unless they set their own. Saved by the category form through save().
const props = defineProps<{ categoryId?: number | null; parentId?: number | null; disabled?: boolean }>();

const service = useBrandingService();
const methods = ref<BrandingMethod[]>([]);
const tiers = ref<Record<number, BrandingTier[]>>({});
// what a subcategory falls back to when it has no own price
const inherited = ref<Record<number, BrandingDefault>>({});
const loaded = ref(false);
const loadError = ref("");

onMounted(async () => {
  try {
    const [all, own, parent] = await Promise.all([
      service.getBrandingMethods(),
      props.categoryId ? service.getCategoryBrandingPrices(props.categoryId) : Promise.resolve([]),
      // only a hint; a role without product access may not read it
      props.parentId ? service.getBrandingDefaults(props.parentId).catch(() => []) : Promise.resolve([]),
    ]);
    methods.value = all;
    const byMethod: Record<number, BrandingTier[]> = {};
    for (const m of all) byMethod[m.id] = [];
    for (const p of own) byMethod[p.branding_method_id] = sortedTiers(p.tiers);
    tiers.value = byMethod;
    inherited.value = Object.fromEntries(parent.filter((d) => d.tiers.length).map((d) => [d.branding_method_id, d]));
    loaded.value = true;
  } catch (e) {
    loadError.value = getErrorMessage(e);
  }
});

// the first problem across the methods, for the form to refuse saving
const problem = () => {
  for (const m of methods.value) {
    const p = brandingTierProblem(tiers.value[m.id] || []);
    if (p) return `${m.name}: ${p}`;
  }
  return null;
};

const save = async (categoryId: number) => {
  if (!loaded.value) return;
  const prices = methods.value
    .filter((m) => (tiers.value[m.id] || []).length)
    .map((m) => ({ branding_method_id: m.id, tiers: sortedTiers(tiers.value[m.id] || []) }));
  await service.saveCategoryBrandingPrices(categoryId, prices);
};

defineExpose({ save, problem });
</script>

<template>
  <div class="space-y-3">
    <p v-if="loadError" class="text-sm text-red-600">Harga branding gagal dimuat: {{ loadError }}</p>
    <p v-else-if="!loaded" class="text-sm text-muted-foreground">Memuat metode branding…</p>
    <p v-else-if="!methods.length" class="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      Belum ada metode branding. Tambahkan dulu di menu Toko → Branding.
    </p>
    <template v-else>
      <p class="text-sm text-muted-foreground">
        Isi harga per pcs mulai dari jumlah minimal. Baris pertama adalah minimal order metode tersebut.
        <template v-if="props.parentId">Metode yang dikosongkan memakai harga kategori induk.</template>
      </p>
      <div class="grid gap-3 lg:grid-cols-2">
        <div v-for="m in methods" :key="m.id" class="space-y-3 rounded-lg border bg-card p-3">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-medium">{{ m.name }}</p>
            <UiBadge v-if="!m.is_active" class="bg-gray-100 text-gray-700">Nonaktif</UiBadge>
          </div>
          <p v-if="!(tiers[m.id] || []).length" class="text-xs text-muted-foreground">
            <template v-if="inherited[m.id]">
              Ikut {{ inherited[m.id]?.category_name }}: {{ describeBrandingTiers(inherited[m.id]?.tiers || []) }}
            </template>
            <template v-else>Belum ada harga.</template>
          </p>
          <BrandingTierEditor v-model="tiers[m.id]" :label="m.name" :disabled="props.disabled" />
        </div>
      </div>
    </template>
  </div>
</template>
