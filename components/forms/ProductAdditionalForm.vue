<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X } from "lucide-vue-next";
import FieldXText from "~/components/forms/fields/FieldXText.vue";
import type { ProductAdditional } from "~/types/products.type";
import FieldXSelectSimple from "./fields/FieldXSelectSimple.vue";

const props = defineProps<{
  modelValue: ProductAdditional[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: ProductAdditional[]): void;
}>();


const list = ref<ProductAdditional[]>(props.modelValue || []);

function parseAttributes(attributes: string): {key: string, value: string}[] {
  try {
    return JSON.parse(attributes) || [];
  } catch {
    return [];
  }
}

const parsedAttributes = ref<Record<number, {key: string, value: string}[]>>({})

// Sync parsedAttributes with list.attributes
watch(list, () => {
  list.value.forEach((add, idx) => {
    parsedAttributes.value[idx] = parseAttributes(add.attributes)
  })
}, { deep: true, immediate: true })

// Sync back to list when parsedAttributes changes
watch(parsedAttributes, (newVal) => {
  for (const idx in newVal) {
    list.value[Number(idx)].attributes = JSON.stringify(newVal[idx])
  }
}, { deep: true })

// Update attributes array back to string
// Removed updateAttributes, now handled by watcher

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
  if (!parsedAttributes.value[additionalIdx]) parsedAttributes.value[additionalIdx] = []
  parsedAttributes.value[additionalIdx].push({ key: "", value: "" })
}

function removeAttribute(additionalIdx: number, attrIdx: number) {
  parsedAttributes.value[additionalIdx].splice(attrIdx, 1)
}

// Removed updateAttribute, now handled by v-model and watchers
function removeAdditional(idx: number) {
  if (list.value.length > 1) list.value.splice(idx, 1);
}

console.log('list additionals', JSON.stringify(props.modelValue))

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
            :name="`additionals.${addIdx}.name`"
            label="Name"
            placeholder="Name"
            v-model="additional.name"
            :standalone="true"
          />
          <FieldXText
            item-class="w-full"
            :name="`additionals.${addIdx}.price`"
            label="Price"
            placeholder="Price"
            v-model="additional.price"
            :standalone="true"
          />
          <FieldXText
            item-class="w-full"
            :name="`additionals.${addIdx}.moq`"
            label="MOQ"
            placeholder="MOQ"
            v-model="additional.moq"
            :standalone="true"
          />
          <FieldXText
            item-class="w-full"
            :name="`additionals.${addIdx}.stock`"
            label="Stock"
            placeholder="Stock"
            v-model="additional.stock"
            :standalone="true"
          />
          <FieldXText
            item-class="w-full"
            :name="`additionals.${addIdx}.discount`"
            label="Discount"
            placeholder="Discount"
            v-model="additional.discount"
            :standalone="true"
          />
          <FieldXSelectSimple
            item-class="w-full"
            :name="`additionals.${addIdx}.discount_type`"
            label="Discount Type"
            placeholder="Discount Type"
            v-model="additional.discount_type"
            :standalone="true"
            :options="[
              { id: 'AMOUNT', label: 'Amount' },
              { id: 'PERCENTAGE', label: 'Percentage' },
            ]"
          />
          <div class="w-full px-1 col-span-2">
            <label class="block form-label mb-2">Attributes</label>
            <div class="space-y-2">
              <Card
                v-for="(attr, attrIdx) in parsedAttributes[addIdx]"
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
                        v-model="attr.key"
                        placeholder="e.g. Color"
                      />
                    </div>
                    <div>
                      <label class="text-sm font-medium mb-1 block"
                        >Value</label
                      >
                      <Input
                        v-model="attr.value"
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
