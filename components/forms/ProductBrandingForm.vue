<script setup lang="ts">
import { useBrandingService } from "~/services/branding.service";
import type { BrandingDefault, BrandingMethod, BrandingTier, ProductBrandingInput } from "~/types/branding.type";
import BrandingTierEditor from "./BrandingTierEditor.vue";
import { ImagePlus, Trash2 } from "lucide-vue-next";
import { toast } from "vue-sonner";

// which branding methods a product offers; each uses its category's price unless the product
// sets its own. A method with a category price is offered without a row; unchecking it saves an exclusion. The product form reads payload() and saves it after the product.
const props = defineProps<{ productId?: number | null; categoryId?: number | null; disabled?: boolean }>();

// upload holds a base64 picture chosen in this session; image is the stored path
type Draft = { enabled: boolean; custom: boolean; tiers: BrandingTier[]; image: string; upload: string | null };

const config = useRuntimeConfig();
const STORAGE_URL = config.public.STORAGE_URL;
const MAX_SAMPLE_BYTES = 2048 * 1024;
const { convertToBase64 } = useFileToBase64();

const samplePreview = (methodID: number): string => {
  const draft = drafts.value[methodID];
  if (!draft) return "";
  if (draft.upload) return draft.upload;
  return draft.image ? `${STORAGE_URL}${draft.image}` : "";
};

const pickSample = async (methodID: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    toast.error("Contoh branding harus berupa gambar.");
    return;
  }
  if (file.size > MAX_SAMPLE_BYTES) {
    toast.error("Ukuran contoh branding maksimal 2 MB.");
    return;
  }
  try {
    drafts.value[methodID].upload = await convertToBase64(file);
  } catch {
    toast.error("Gambar tidak dapat dibaca.");
  }
};

const clearSample = (methodID: number) => {
  const draft = drafts.value[methodID];
  if (!draft) return;
  draft.upload = null;
  draft.image = "";
};

const service = useBrandingService();
const methods = ref<BrandingMethod[]>([]);
const drafts = ref<Record<number, Draft>>({});
const defaults = ref<Record<number, BrandingDefault>>({});
const loaded = ref(false);
// methods the server already knows for this product (offered or excluded)
const known = ref<Set<number>>(new Set());
const loadError = ref("");

onMounted(async () => {
  try {
    const [all, offered] = await Promise.all([
      service.getBrandingMethods(),
      props.productId ? service.getProductBrandings(props.productId) : Promise.resolve([]),
    ]);
    const byMethod: Record<number, Draft> = {};
    for (const m of all) byMethod[m.id] = { enabled: false, custom: false, tiers: [], image: "", upload: null };
    for (const b of offered) {
      byMethod[b.branding_method_id] = {
        enabled: b.is_offered,
        custom: b.custom_price,
        tiers: b.custom_price ? sortedTiers(b.tiers) : [],
        image: b.image || "",
        upload: null,
      };
    }
    // offered methods first, in their saved order, then the rest
    const rank = new Map(offered.filter((b) => b.is_offered).map((b, i) => [b.branding_method_id, i]));
    methods.value = [...all].sort((a, b) => (rank.get(a.id) ?? 1e6 + a.orders) - (rank.get(b.id) ?? 1e6 + b.orders));
    drafts.value = byMethod;
    known.value = new Set(offered.map((b) => b.branding_method_id));
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
      if (props.categoryId !== id) return;
      defaults.value = Object.fromEntries(list.map((d) => [d.branding_method_id, d]));
      // a new product offers every method its category prices
      if (!props.productId) {
        for (const d of list) {
          const draft = drafts.value[d.branding_method_id];
          if (d.tiers.length && draft) draft.enabled = true;
        }
      }
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
  const out: ProductBrandingInput[] = [];
  for (const m of methods.value) {
    const d = drafts.value[m.id];
    if (!d) continue;
    if (d.enabled) {
      out.push({ branding_method_id: m.id, custom_tiers: d.custom ? sortedTiers(d.tiers) : [], image: d.upload ?? d.image, is_offered: true });
    } else if (known.value.has(m.id) || defaults.value[m.id]?.tiers.length) {
      out.push({ branding_method_id: m.id, is_offered: false });
    }
  }
  return out;
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

          <!-- contoh gambar teknik ini untuk produk tersebut -->
          <div class="flex items-center gap-3 border-t pt-3">
            <div class="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white">
              <img
                v-if="samplePreview(m.id)"
                :src="samplePreview(m.id)"
                :alt="m.name"
                class="h-full w-full object-contain"
              />
              <ImagePlus v-else class="size-6 text-muted-foreground" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-medium">Contoh gambar {{ m.name }}</p>
              <p class="text-xs text-muted-foreground">JPG/PNG maks 2 MB — otomatis dikonversi ke WebP.</p>
              <div class="mt-1 flex flex-wrap items-center gap-2">
                <label
                  class="inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted"
                  :class="props.disabled ? 'pointer-events-none opacity-50' : ''"
                >
                  <ImagePlus class="size-3.5" />
                  {{ samplePreview(m.id) ? "Ganti contoh" : "Unggah contoh" }}
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    :disabled="props.disabled"
                    @change="pickSample(m.id, $event)"
                  />
                </label>
                <button
                  v-if="samplePreview(m.id)"
                  type="button"
                  class="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  :disabled="props.disabled"
                  @click="clearSample(m.id)"
                >
                  <Trash2 class="size-3.5" /> Hapus
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
