<script setup lang="ts">
import { ImagePlus, Plus, Trash2, X } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductColorDraft } from "~/types/products.type";

// Colour options of a product. Each colour may have its own picture; without one the
// storefront falls back to the product's main image, which the cards preview.
const props = defineProps<{
  // main product image (URL), shown on colours without their own picture
  fallbackImage?: string;
  disabled?: boolean;
}>();
const colors = defineModel<ProductColorDraft[]>({ required: true });

const MAX_COLORS = 50;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
let nextKey = Date.now();

const addColor = () => {
  if (colors.value.length >= MAX_COLORS) {
    toast.error(`Maksimal ${MAX_COLORS} warna`);
    return;
  }
  colors.value = [...colors.value, { key: nextKey++, name: "", image: "", file: null }];
};

const removeColor = (key: number) => {
  const c = colors.value.find((x) => x.key === key);
  if (c?.file && c.image.startsWith("blob:")) URL.revokeObjectURL(c.image);
  colors.value = colors.value.filter((x) => x.key !== key);
};

const update = (key: number, patch: Partial<ProductColorDraft>) => {
  colors.value = colors.value.map((x) => (x.key === key ? { ...x, ...patch } : x));
};

const pickImage = (key: number, e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    toast.error("File warna harus berupa gambar");
    return;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    toast.error("Gambar warna maksimal 2 MB");
    return;
  }
  const prev = colors.value.find((x) => x.key === key);
  if (prev?.file && prev.image.startsWith("blob:")) URL.revokeObjectURL(prev.image);
  update(key, { file, image: URL.createObjectURL(file) });
};

const clearImage = (key: number) => {
  const prev = colors.value.find((x) => x.key === key);
  if (prev?.file && prev.image.startsWith("blob:")) URL.revokeObjectURL(prev.image);
  update(key, { file: null, image: "" });
};
</script>

<template>
  <div class="space-y-3">
    <p v-if="!colors.length" class="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      Belum ada varian warna. Tambahkan warna jika produk tersedia dalam beberapa pilihan warna.
    </p>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <div
        v-for="(color, i) in colors"
        :key="color.key"
        class="relative flex flex-row-reverse items-center gap-3 rounded-lg border bg-card p-2 sm:flex-col sm:items-stretch sm:gap-2"
      >
        <!-- picture: own image or the product image as a dimmed fallback -->
        <label
          class="group relative block size-20 shrink-0 cursor-pointer overflow-hidden rounded-md border bg-muted sm:aspect-square sm:size-auto"
          :class="{ 'pointer-events-none': props.disabled }"
          :title="color.image ? 'Ganti gambar' : 'Pilih gambar (opsional)'"
        >
          <img
            v-if="color.image"
            :src="color.image"
            :alt="color.name || `Warna ${i + 1}`"
            class="h-full w-full object-cover"
          />
          <template v-else>
            <img
              v-if="props.fallbackImage"
              :src="props.fallbackImage"
              alt=""
              class="h-full w-full object-cover opacity-40"
            />
            <span class="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground">
              <ImagePlus class="size-5" />
              <span class="hidden sm:inline">Gambar produk</span>
            </span>
          </template>
          <input
            type="file"
            accept="image/*"
            class="sr-only"
            :disabled="props.disabled"
            :aria-label="`Gambar warna ${color.name || i + 1}`"
            @change="pickImage(color.key, $event)"
          />
        </label>

        <div class="min-w-0 flex-1 space-y-1.5">
          <Input
            :model-value="color.name"
            placeholder="Nama warna"
            maxlength="60"
            :disabled="props.disabled"
            :aria-label="`Nama warna ${i + 1}`"
            @update:model-value="(v: string | number) => update(color.key, { name: String(v) })"
          />
          <div class="flex items-center justify-between gap-1">
            <button
              v-if="color.image && !props.disabled"
              type="button"
              class="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-600"
              @click="clearImage(color.key)"
            >
              <X class="size-3" /> Pakai gambar produk
            </button>
            <span v-else class="text-xs text-muted-foreground">{{ color.image ? '' : 'Gambar opsional' }}</span>
            <Button
              v-if="!props.disabled"
              type="button"
              variant="ghost"
              size="icon"
              class="size-8 shrink-0 text-muted-foreground hover:text-red-600"
              :aria-label="`Hapus warna ${color.name || i + 1}`"
              @click="removeColor(color.key)"
            >
              <Trash2 class="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <Button v-if="!props.disabled" type="button" variant="outline" size="sm" :disabled="colors.length >= MAX_COLORS" @click="addColor">
      <Plus class="size-4" /> Tambah warna
    </Button>
  </div>
</template>
