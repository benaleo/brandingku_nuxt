<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X } from "lucide-vue-next";
import type { ProductAdditional } from "~/types/products.type";
import { useProductAdditionalService } from "~/services/product-additional.service";
import FieldXSelectSimple from "./fields/FieldXSelectSimple.vue";

const props = defineProps<{
  modelValue: ProductAdditional[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: ProductAdditional[]): void;
}>();

const additionalService = useProductAdditionalService()
const deletingKey = ref<string | null>(null)

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
    const i = Number(idx)
    if (list.value[i]) {
      list.value[i].attributes = JSON.stringify(newVal[i])
    }
  }
}, { deep: true })

// Update attributes array back to string
// Removed updateAttributes, now handled by watcher

// Initialize attributes if empty
watch(
  () => props.modelValue,
  (v) => {
    console.log('[additional-form] props.modelValue changed:', JSON.parse(JSON.stringify(v)))
    list.value = (v || []).map((item, idx) => ({
      ...item,
      _uniqueKey: item.id ? undefined : `existing-${idx}-${Date.now()}-${Math.random()}`,
    }));
    console.log('[additional-form] list set from props:', JSON.parse(JSON.stringify(list.value)))
  },
  { immediate: true }
);

const previousList = ref<ProductAdditional[]>([])

watch(list, (v) => {
  console.log('[additional-form] list changed, emitting update:modelValue:', JSON.parse(JSON.stringify(v)))
  
  // Log specific changes for items with IDs
  v.forEach((item, idx) => {
    if (item.id) {
      const prevItem = previousList.value[idx]
      if (prevItem) {
        const changedFields: string[] = []
        if (item.name !== prevItem.name) changedFields.push(`name: '${prevItem.name}' -> '${item.name}'`)
        if (item.price !== prevItem.price) changedFields.push(`price: ${prevItem.price} -> ${item.price}`)
        if (item.moq !== prevItem.moq) changedFields.push(`moq: ${prevItem.moq} -> ${item.moq}`)
        if (item.stock !== prevItem.stock) changedFields.push(`stock: ${prevItem.stock} -> ${item.stock}`)
        if (item.discount !== prevItem.discount) changedFields.push(`discount: ${prevItem.discount} -> ${item.discount}`)
        if (item.discount_type !== prevItem.discount_type) changedFields.push(`discount_type: '${prevItem.discount_type}' -> '${item.discount_type}'`)
        if (item.attributes !== prevItem.attributes) changedFields.push(`attributes changed`)
        
        if (changedFields.length > 0) {
          console.log(`[additional-form] updated additional id:${item.id} - ${changedFields.join(', ')}`)
          // Extra log for ID 1
          if (item.id === '1') {
            console.log(`[additional-form] SPECIAL: additional id:1 updated - ${changedFields.join(', ')}`)
          }
        }
      }
    }
  })
  
  // Update previous list
  previousList.value = v.map(item => ({ ...item }))
  
  emit("update:modelValue", v)
}, { deep: true });

function addAdditional() {
  console.log('[additional-form] adding new additional')
  list.value.push({
    _uniqueKey: `new-${Date.now()}-${Math.random()}`,
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

async function removeAdditional(id: number, idx: number) {
  console.log('[additional-form] removing additional param:', id, 'resolved idx:', idx)
  const item = list.value[idx];
  if (!item) return
  // If item has ID -> delete from backend first, then remove locally
  if (item.id) {
    try {
      deletingKey.value = String(id)
      console.log(`[additional-form] deleting additional id:${item.id}`)
      await additionalService.deleteProductAdditional(Number(item.id))
      console.log(`[additional-form] deleted additional id:${item.id}`)
      list.value.splice(idx, 1)
    } catch (e) {
      console.error(`[additional-form] failed to delete additional id:${item.id}`, e)
    } finally {
      deletingKey.value = null
    }
  } else {
    // New (unsaved) item, just remove from UI
    console.log('[additional-form] removing unsaved additional at index:', idx)
    list.value.splice(idx, 1)
  }
}

console.log('list additionals', JSON.stringify(props.modelValue))

</script>

<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-bold">Additionals</h3>
      <Button type="button" @click="addAdditional">Add Additional</Button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      <div
        v-for="(additional, addIdx) in list"
        :key="additional.id ?? additional._uniqueKey"
        class="border rounded p-4 relative w-full"
      >
        <Button
          type="button"
          variant="destructive"
          class="absolute top-2 right-2 cursor-pointer"
          @click="removeAdditional(Number(additional.id ?? addIdx), addIdx)"
          :disabled="deletingKey === String(addIdx)"
        >
          <Trash2 />
        </Button>
        <div class="w-full grid grid-cols-2 gap-2 mt-4">
          <div class="w-full">
            <label class="form-label mb-2">Name</label>
            <Input
              placeholder="Name"
              v-model="additional.name"
            />
          </div>
          <div class="w-full">
            <label class="form-label mb-2">Price</label>
            <Input
              type="number"
              placeholder="Price"
              v-model.number="additional.price"
            />
          </div>
          <div class="w-full">
            <label class="form-label mb-2">MOQ</label>
            <Input
              type="number"
              placeholder="MOQ"
              v-model.number="additional.moq"
            />
          </div>
          <div class="w-full">
            <label class="form-label mb-2">Stock</label>
            <Input
              type="number"
              placeholder="Stock"
              v-model.number="additional.stock"
            />
          </div>
          <div class="w-full">
            <label class="form-label mb-2">Discount</label>
            <Input
              type="number"
              placeholder="Discount"
              v-model.number="additional.discount"
            />
          </div>
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
