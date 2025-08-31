<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X } from "lucide-vue-next";
import FieldXText from "~/components/forms/fields/FieldXText.vue";
import type { OptionType } from "~/types/options.type";
import type { ProductAdditional } from "~/types/products.type";

const props = defineProps<{
  modelValue: ProductAdditional[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: ProductAdditional[]): void;
}>();

const dtypes = ref<OptionType[]>([]);

const list = ref<ProductAdditional[]>(props.modelValue || []);

// Parse attributes string to array of objects
const parseAttributes = (attributes: string) => {
  try {
    if (!attributes) return [];
    const parsed = JSON.parse(attributes);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

// Update attributes array back to string
const updateAttributes = (idx: number, attributes: any[]) => {
  list.value[idx].attributes = JSON.stringify(attributes);
};

// Initialize attributes if empty
watch(
  () => props.modelValue,
  (v) => {
    list.value = (v || []).map((item) => ({
      ...item,
      attributes: item.attributes || "[]",
    }));
  },
  { immediate: true }
);

watch(list, (v) => emit("update:modelValue", v), { deep: true });

function addAdditional() {
  list.value.push({
    name: "",
    price: 0,
    moq: 0,
    stock: 0,
    discount: 0,
    discount_type: "AMOUNT",
    attributes: "[]",
  });
}

function addAttribute(additionalIdx: number) {
  const attributes = parseAttributes(list.value[additionalIdx].attributes);
  attributes.push({ key: "", value: "" });
  updateAttributes(additionalIdx, attributes);
}

function removeAttribute(additionalIdx: number, attrIdx: number) {
  const attributes = parseAttributes(list.value[additionalIdx].attributes);
  attributes.splice(attrIdx, 1);
  updateAttributes(additionalIdx, attributes);
}

function updateAttribute(
  additionalIdx: number,
  attrIdx: number,
  field: "key" | "value",
  value: string
) {
  const attributes = parseAttributes(list.value[additionalIdx].attributes);
  attributes[attrIdx][field] = value;
  updateAttributes(additionalIdx, attributes);
}
function removeAdditional(idx: number) {
  if (list.value.length > 1) list.value.splice(idx, 1);
}

</script>

<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-bold">Additionals</h3>
      <Button type="button" @click="addAdditional">Add Additional</Button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      <div
        v-for="(additional, addIdx) in list"
        :key="addIdx"
        class="border rounded p-4 relative w-full"
      >
        <Button
          type="button"
          variant="destructive"
          class="absolute top-2 right-2 cursor-pointer"
          @click="removeAdditional(addIdx)"
          v-if="list.length > 1"
        >
          <Trash2 />
        </Button>
        <div class="w-full grid grid-cols-2 gap-2 mt-4">
          <FieldXText
            item-class="w-full"
            name="additional_name"
            label="Name"
            placeholder="Name"
            v-model="additional.name"
          />
          <FieldXText
            item-class="w-full"
            name="price"
            label="Price"
            placeholder="Price"
            v-model="additional.price"
          />
          <FieldXText
            item-class="w-full"
            name="moq"
            label="MOQ"
            placeholder="MOQ"
            v-model="additional.moq"
          />
          <FieldXText
            item-class="w-full"
            name="stock"
            label="Stock"
            placeholder="Stock"
            v-model="additional.stock"
          />
          <FieldXText
            item-class="w-full"
            name="discount"
            label="Discount"
            placeholder="Discount"
            v-model="additional.discount"
          />
          <div class="w-full px-1">
            <label class="block form-label mb-2">Discount Type</label>
            <select v-model="additional.discount_type" class="form-input">
              <option v-for="type in dtypes" :key="type.id" :value="type.id">
                {{ type.label }}
              </option>
            </select>
          </div>
          <div class="w-full px-1 col-span-2">
            <label class="block form-label mb-2">Attributes</label>
            <div class="space-y-2">
              <Card
                v-for="(attr, attrIdx) in parseAttributes(
                  additional.attributes
                )"
                :key="attrIdx"
                class="relative"
              >
                <button
                  type="button"
                  class="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                  @click="removeAttribute(addIdx, attrIdx)"
                >
                  <X class="h-4 w-4" />
                </button>
                <CardContent class="pt-2">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="text-sm font-medium mb-1 block">Key</label>
                      <Input
                        :value="attr.key"
                        @input="(e: any) => updateAttribute(addIdx, attrIdx, 'key', (e.target as HTMLInputElement).value)"
                        placeholder="e.g. Color"
                      />
                    </div>
                    <div>
                      <label class="text-sm font-medium mb-1 block"
                        >Value</label
                      >
                      <Input
                        :value="attr.value"
                        @input="(e: any) => updateAttribute(addIdx, attrIdx, 'value', (e.target as HTMLInputElement).value)"
                        placeholder="e.g. Red"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="mt-2"
                @click="addAttribute(addIdx)"
              >
                <Plus class="h-4 w-4 mr-2" /> Add Attribute
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
