<script setup lang="ts">
import { Plus, X } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BrandingTier } from "~/types/branding.type";

// price per piece of one branding method, from a minimum quantity; the first row is the minimum order
const props = defineProps<{ disabled?: boolean; label?: string }>();
const tiers = defineModel<BrandingTier[]>({ required: true });

const MAX_TIERS = 20;

const addTier = () => {
  const last = tiers.value[tiers.value.length - 1];
  const next = last ? { min_qty: Math.max(last.min_qty * 2, last.min_qty + 1), price: last.price } : { min_qty: 50, price: 0 };
  tiers.value = [...tiers.value, next];
};

const update = (index: number, patch: Partial<BrandingTier>) => {
  tiers.value = tiers.value.map((t, i) => (i === index ? { ...t, ...patch } : t));
};

const remove = (index: number) => {
  tiers.value = tiers.value.filter((_, i) => i !== index);
};

const toInt = (v: string | number) => Math.max(0, Math.floor(Number(v) || 0));
const problem = computed(() => brandingTierProblem(tiers.value));
</script>

<template>
  <div class="space-y-2">
    <div v-if="tiers.length" class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] items-center gap-2 text-xs text-muted-foreground">
      <span>Min. qty</span>
      <span>Harga / pcs</span>
      <span class="w-8" />
    </div>
    <div
      v-for="(tier, i) in tiers"
      :key="i"
      class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] items-center gap-2"
    >
      <Input
        type="number"
        inputmode="numeric"
        min="1"
        :model-value="tier.min_qty"
        :disabled="props.disabled"
        :aria-label="`${props.label || 'Harga'}: min. qty baris ${i + 1}`"
        @update:model-value="(v: string | number) => update(i, { min_qty: toInt(v) })"
      />
      <Input
        type="number"
        inputmode="numeric"
        min="0"
        :model-value="tier.price"
        :disabled="props.disabled"
        :aria-label="`${props.label || 'Harga'}: harga per pcs baris ${i + 1}`"
        @update:model-value="(v: string | number) => update(i, { price: toInt(v) })"
      />
      <Button
        v-if="!props.disabled"
        type="button"
        variant="ghost"
        size="icon"
        class="size-8 text-muted-foreground hover:text-red-600"
        :aria-label="`Hapus baris ${i + 1}`"
        @click="remove(i)"
      >
        <X class="size-4" />
      </Button>
      <span v-else class="w-8" />
    </div>
    <p v-if="problem" class="text-xs text-red-600">{{ problem }}</p>
    <Button
      v-if="!props.disabled"
      type="button"
      variant="outline"
      size="sm"
      :disabled="tiers.length >= MAX_TIERS"
      @click="addTier"
    >
      <Plus class="size-4" /> {{ tiers.length ? "Tambah tier" : "Tambah harga" }}
    </Button>
  </div>
</template>
